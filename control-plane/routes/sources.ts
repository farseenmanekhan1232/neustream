import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import { canCreateSource, canCreateDestination } from "../middleware/planValidation";
import { handleGenericIdParam } from "../middleware/idHandler";
import crypto from "crypto";
import posthogService from "../services/posthog";
import { StreamSource, SourceDestination } from "../types/entities";

const router = express.Router();
const db = new Database();

// Generate a unique stream key
const generateStreamKey = (): string => {
  return crypto.randomBytes(24).toString("hex");
};

// Get user's stream sources - requires authentication
router.get("/", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    const sources = await db.query<any>(
      `SELECT
        s.*,
        COUNT(sd.id) as destinations_count,
        EXISTS(
          SELECT 1 FROM active_streams
          WHERE source_id = s.id AND ended_at IS NULL
        ) as is_active
      FROM stream_sources s
      LEFT JOIN source_destinations sd ON s.id = sd.source_id
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json({ sources });
  } catch (error) {
    console.error("Get sources error:", error);
    res.status(500).json({ error: "Failed to fetch stream sources" });
  }
});

// Get specific stream source with destinations - requires authentication
router.get("/:id", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    // Get the stream source
    const sources = await db.query<StreamSource>(
      "SELECT * FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (sources.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    const source = sources[0];

    // Get destinations for this source
    const destinations = await db.query<SourceDestination>(
      "SELECT * FROM source_destinations WHERE source_id = $1 ORDER BY created_at DESC",
      [id]
    );

    // Check if currently active
    const activeStream = await db.query<any>(
      "SELECT * FROM active_streams WHERE source_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
      [id]
    );

    res.json({
      source: {
        ...source,
        is_active: activeStream.length > 0,
        active_stream: activeStream[0] || null,
      },
      destinations,
    });
  } catch (error) {
    console.error("Get source error:", error);
    res.status(500).json({ error: "Failed to fetch stream source" });
  }
});

// Create new stream source - requires authentication and plan validation
router.post("/", authenticateToken, canCreateSource, async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body as { name: string; description?: string };
  const userId = (req as any).user.id;

  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: "Source name is required" });
      return;
    }

    if (name.length > 255) {
      res
        .status(400)
        .json({ error: "Source name must be less than 255 characters" });
      return;
    }

    // Generate unique stream key
    let streamKey: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = generateStreamKey();

      // Check uniqueness in both stream_sources and users table
      const existingInSources = await db.query<{ id: number }>(
        "SELECT id FROM stream_sources WHERE stream_key = $1",
        [streamKey]
      );

      const existingInUsers = await db.query<{ id: number }>(
        "SELECT id FROM users WHERE stream_key = $1",
        [streamKey]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      res
        .status(500)
        .json({ error: "Failed to generate unique stream key" });
      return;
    }

    // Create the stream source
    const result = await db.run<StreamSource & { id: number }>(
      "INSERT INTO stream_sources (user_id, name, description, stream_key) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, name.trim(), description?.trim() || null, streamKey]
    );

    // Track source creation
    posthogService.trackAuthEvent(userId, "stream_source_created", {
      source_id: result.id,
      source_name: name,
      stream_key: streamKey,
    });

    res.status(201).json({
      source: {
        ...result,
        destinations_count: 0,
        is_active: false,
      },
    });
  } catch (error: any) {
    console.error("Create source error:", error);

    if (error.code === "23505") {
      res.status(400).json({ error: "Stream key already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to create stream source" });
  }
});

// Update stream source - requires authentication
router.put("/:id", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, is_active } = req.body as { name?: string; description?: string; is_active?: boolean };
  const userId = (req as any).user.id;

  try {
    // Validate input
    if (name && (name.trim().length === 0 || name.length > 255)) {
      res
        .status(400)
        .json({ error: "Source name must be between 1 and 255 characters" });
      return;
    }

    // Check if source belongs to user
    const existingSource = await db.query<StreamSource>(
      "SELECT * FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingSource.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Check if source is currently active before deactivating
    if (is_active === false) {
      const activeStream = await db.query<{ id: number }>(
        "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
        [id]
      );

      if (activeStream.length > 0) {
        res
          .status(400)
          .json({ error: "Cannot deactivate source while streaming" });
        return;
      }
    }

    // Update the source
    const result = await db.run<StreamSource>(
      "UPDATE stream_sources SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 AND user_id = $5 RETURNING *",
      [name?.trim(), description?.trim(), is_active, id, userId]
    );

    if (!result) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Track source update
    posthogService.trackAuthEvent(userId, "stream_source_updated", {
      source_id: parseInt(id.toString()),
      changes: { name, description, is_active },
    });

    res.json({ source: result });
  } catch (error) {
    console.error("Update source error:", error);
    res.status(500).json({ error: "Failed to update stream source" });
  }
});

// Delete stream source - requires authentication
router.delete("/:id", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    // Check if source belongs to user
    const existingSource = await db.query<StreamSource>(
      "SELECT * FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingSource.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Check if source is currently active
    const activeStream = await db.query<{ id: number }>(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      res
        .status(400)
        .json({ error: "Cannot delete source while streaming" });
      return;
    }

    // Delete the source (destinations will be deleted due to CASCADE)
    const result = await db.run<any>(
      "DELETE FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.changes === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Track source deletion
    posthogService.trackAuthEvent(userId, "stream_source_deleted", {
      source_id: parseInt(id.toString()),
      source_name: existingSource[0].name,
    });

    res.json({ message: "Stream source deleted successfully" });
  } catch (error) {
    console.error("Delete source error:", error);
    res.status(500).json({ error: "Failed to delete stream source" });
  }
});

// Get stream key for specific source - requires authentication
router.get("/:id/stream-key", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    const sources = await db.query<{ stream_key: string }>(
      "SELECT stream_key FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (sources.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    res.json({ streamKey: sources[0].stream_key });
  } catch (error) {
    console.error("Get stream key error:", error);
    res.status(500).json({ error: "Failed to get stream key" });
  }
});

// Regenerate stream key for source - requires authentication
router.post("/:id/regenerate-key", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    // Check if source belongs to user
    const existingSource = await db.query<StreamSource & { stream_key: string }>(
      "SELECT * FROM stream_sources WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingSource.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Check if source is currently active
    const activeStream = await db.query<{ id: number }>(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      res
        .status(400)
        .json({ error: "Cannot regenerate stream key while streaming" });
      return;
    }

    // Generate unique stream key
    let streamKey: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = generateStreamKey();

      // Check uniqueness in both stream_sources and users table
      const existingInSources = await db.query<{ id: number }>(
        "SELECT id FROM stream_sources WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      const existingInUsers = await db.query<{ id: number }>(
        "SELECT id FROM users WHERE stream_key = $1",
        [streamKey]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      res
        .status(500)
        .json({ error: "Failed to generate unique stream key" });
      return;
    }

    // Update the stream key
    const result = await db.run<StreamSource & { stream_key: string }>(
      "UPDATE stream_sources SET stream_key = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [streamKey, id, userId]
    );

    if (!result) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Track stream key regeneration
    posthogService.trackAuthEvent(userId, "stream_key_regenerated", {
      source_id: parseInt(id.toString()),
      old_stream_key: existingSource[0].stream_key,
      new_stream_key: streamKey,
    });

    res.json({
      message: "Stream key regenerated successfully",
      streamKey: result.stream_key,
    });
  } catch (error) {
    console.error("Regenerate stream key error:", error);
    res.status(500).json({ error: "Failed to regenerate stream key" });
  }
});

// Source-specific destination routes

// Get destinations for a specific source - requires authentication
router.get("/:sourceId/destinations", authenticateToken, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.params;
  const userId = (req as any).user.id;

  try {
    // Verify source belongs to user
    const sourceCheck = await db.query<{ id: number }>(
      "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );

    if (sourceCheck.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Get destinations for this source
    const destinations = await db.query<SourceDestination>(
      "SELECT * FROM source_destinations WHERE source_id = $1 ORDER BY created_at DESC",
      [sourceId]
    );

    res.json({ destinations });
  } catch (error) {
    console.error("Get source destinations error:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Add destination to a specific source - requires authentication and plan validation
router.post("/:sourceId/destinations", authenticateToken, canCreateDestination, handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.params;
  const { platform, rtmpUrl, streamKey } = req.body as { platform: string; rtmpUrl: string; streamKey: string };
  const userId = (req as any).user.id;

  try {
    // Verify source belongs to user
    const sourceCheck = await db.query<{ id: number; name: string }>(
      "SELECT id, name FROM stream_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );

    if (sourceCheck.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Validate input
    if (!platform || !rtmpUrl || !streamKey) {
      res
        .status(400)
        .json({ error: "Platform, RTMP URL, and stream key are required" });
      return;
    }

    // Security: Prevent using Neustream stream keys as destinations
    const isNeustreamStreamKey = await db.query<{ id: number }>(
      "SELECT id FROM stream_sources WHERE stream_key = $1 UNION SELECT id FROM users WHERE stream_key = $1",
      [streamKey]
    );

    if (isNeustreamStreamKey.length > 0) {
      res
        .status(400)
        .json({ error: "Cannot use Neustream stream keys as destinations. Please use external platform stream keys only." });
      return;
    }

    // Create destination for this source
    const result = await db.run<SourceDestination>(
      "INSERT INTO source_destinations (source_id, platform, rtmp_url, stream_key) VALUES ($1, $2, $3, $4) RETURNING *",
      [sourceId, platform, rtmpUrl, streamKey]
    );

    // Track destination addition
    posthogService.trackAuthEvent(userId, "source_destination_added", {
      source_id: parseInt(sourceId.toString()),
      source_name: sourceCheck[0].name,
      platform,
      rtmp_url: rtmpUrl,
    });

    res.status(201).json({ destination: result });
  } catch (error) {
    console.error("Add source destination error:", error);
    res.status(500).json({ error: "Failed to add destination" });
  }
});

// Delete destination from a specific source - requires authentication
router.delete(
  "/:sourceId/destinations/:destinationId",
  authenticateToken,
  handleGenericIdParam('stream_sources'),
  handleGenericIdParam('source_destinations'),
  async (req: Request, res: Response): Promise<void> => {
    const { sourceId, destinationId } = req.params;
    const userId = (req as any).user.id;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query<{ id: number; name: string }>(
        "SELECT id, name FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId]
      );

      if (sourceCheck.length === 0) {
        res.status(404).json({ error: "Stream source not found" });
        return;
      }

      // Delete destination from this source
      const result = await db.run<any>(
        "DELETE FROM source_destinations WHERE id = $1 AND source_id = $2",
        [destinationId, sourceId]
      );

      if (result.changes === 0) {
        res.status(404).json({ error: "Destination not found" });
        return;
      }

      // Track destination removal
      posthogService.trackAuthEvent(userId, "source_destination_removed", {
        source_id: parseInt(sourceId.toString()),
        source_name: sourceCheck[0].name,
        destination_id: parseInt(destinationId.toString()),
      });

      res.json({ message: "Destination removed successfully" });
    } catch (error) {
      console.error("Delete source destination error:", error);
      res.status(500).json({ error: "Failed to remove destination" });
    }
  }
);

export default router;
