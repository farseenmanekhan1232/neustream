import express, { Request, Response } from "express";
import Database from "../../lib/database";
import { handleGenericIdParam } from "../../middleware/idHandler";
import * as crypto from "crypto";

const router = express.Router();
const db = new Database();

// Get all stream sources with user info
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const sources = await db.query<any>(`
      SELECT
        ss.*,
        u.email,
        u.display_name,
        COUNT(sd.id) as destinations_count,
        EXISTS(
          SELECT 1 FROM active_streams
          WHERE source_id = ss.id AND ended_at IS NULL
        ) as is_active
      FROM stream_sources ss
      LEFT JOIN users u ON ss.user_id = u.id
      LEFT JOIN source_destinations sd ON ss.id = sd.source_id
      GROUP BY ss.id, u.email, u.display_name
      ORDER BY ss.created_at DESC
    `);

    res.json({ data: sources });
  } catch (error: any) {
    console.error("Get sources error:", error);
    res.status(500).json({ error: "Failed to fetch stream sources" });
  }
});

// Get specific stream source with destinations
router.get(
  "/:id",
  handleGenericIdParam("stream_sources"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Stream source is already available from middleware
      const source = (req as any).entity;

      // Get destinations for this source
      const destinations = await db.query<any>(
        `
      SELECT sd.*, d.* FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
      WHERE sd.source_id = $1
      ORDER BY sd.created_at DESC
    `,
        [id],
      );

      // Check if currently active
      const activeStream = await db.query<any>(
        `
      SELECT * FROM active_streams
      WHERE source_id = $1 AND ended_at IS NULL
      ORDER BY started_at DESC LIMIT 1
    `,
        [id],
      );

      // Get stream statistics
      const streamStats = await db.query<any>(
        `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE source_id = $1 AND ended_at IS NOT NULL
    `,
        [id],
      );

      res.json({
        data: {
          source: {
            ...source,
            is_active: activeStream.length > 0,
            active_stream: activeStream[0] || null,
            stats: {
              totalStreams: parseInt(streamStats[0]?.total_streams) || 0,
              avgDuration: parseFloat(streamStats[0]?.avg_duration) || 0,
            },
          },
          destinations,
        },
      });
    } catch (error: any) {
      console.error("Get source error:", error);
      res.status(500).json({ error: "Failed to fetch stream source" });
    }
  },
);

// Update stream source
router.put(
  "/:id",
  handleGenericIdParam("stream_sources"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, is_active } = req.body as {
      name?: string;
      description?: string;
      is_active?: boolean;
    };

    try {
      // Source exists check is already handled by middleware
      const existingSource = (req as any).entity;

      // Check if source is currently active before deactivating
      if (is_active === false) {
        const activeStream = await db.query<any>(
          "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
          [id],
        );

        if (activeStream.length > 0) {
          res
            .status(400)
            .json({ error: "Cannot deactivate source while streaming" });
          return;
        }
      }

      const result = await db.run<any>(
        `UPDATE stream_sources SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active)
      WHERE id = $4 RETURNING *`,
        [name, description, is_active, id],
      );

      res.json({ data: result });
    } catch (error: any) {
      console.error("Update source error:", error);
      res.status(500).json({ error: "Failed to update stream source" });
    }
  },
);

// Delete stream source
router.delete(
  "/:id",
  handleGenericIdParam("stream_sources"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Source exists check is already handled by middleware
      const existingSource = (req as any).entity;

      // Check if source is currently active
      const activeStream = await db.query<any>(
        "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
        [id],
      );

      if (activeStream.length > 0) {
        res.status(400).json({ error: "Cannot delete source while streaming" });
        return;
      }

      // Delete the source (destinations will be deleted due to CASCADE)
      const result = await db.run<any>(
        "DELETE FROM stream_sources WHERE id = $1",
        [id],
      );

      if (result.changes === 0) {
        res.status(404).json({ error: "Stream source not found" });
        return;
      }

      res.json({ message: "Stream source deleted successfully" });
    } catch (error: any) {
      console.error("Delete source error:", error);
      res.status(500).json({ error: "Failed to delete stream source" });
    }
  },
);

// Regenerate stream key for source
router.post(
  "/:id/regenerate-key",
  handleGenericIdParam("stream_sources"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Source exists check is already handled by middleware
      const existingSource = (req as any).entity;

      // Check if source is currently active
      const activeStream = await db.query<any>(
        "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
        [id],
      );

      if (activeStream.length > 0) {
        res
          .status(400)
          .json({ error: "Cannot regenerate stream key while streaming" });
        return;
      }

      // Generate unique stream key
      let streamKey: string = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        streamKey = crypto.randomBytes(24).toString("hex");

        const existingInUsers = await db.query<any>(
          "SELECT id FROM users WHERE stream_key = $1",
          [streamKey],
        );

        if (existingInUsers.length === 0) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        res.status(500).json({ error: "Failed to generate unique stream key" });
        return;
      }

      // Update source stream key
      const result = await db.run<any>(
        "UPDATE stream_sources SET stream_key = $1 WHERE id = $2 RETURNING *",
        [streamKey, id],
      );

      res.json({
        message: "Stream key regenerated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Regenerate stream key error:", error);
      res.status(500).json({ error: "Failed to regenerate stream key" });
    }
  },
);

export default router;
