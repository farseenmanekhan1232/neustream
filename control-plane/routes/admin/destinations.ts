import express, { Request, Response } from "express";
import Database from "../../lib/database";
import { handleGenericIdParam } from "../../middleware/idHandler";
import { SourceDestination } from "../../types/entities";

const router = express.Router();
const db = new Database();

// Get all destinations with source info
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const destinations = await db.query<any>(`
      SELECT
        sd.id,
        sd.source_id,
        sd.platform,
        sd.rtmp_url,
        sd.stream_key,
        sd.is_active,
        sd.created_at,
        ss.name as source_name,
        ss.user_id,
        u.email as user_email,
        u.display_name as user_display_name
      FROM source_destinations sd
      JOIN stream_sources ss ON sd.source_id = ss.id
      JOIN users u ON ss.user_id = u.id
      ORDER BY sd.created_at DESC
    `);

    res.json({ data: destinations });
  } catch (error: any) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Get specific destination
router.get(
  "/:id",
  handleGenericIdParam("source_destinations"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Destination is already available from middleware
      const destination = (req as any).entity;

      res.json({ data: destination });
    } catch (error: any) {
      console.error("Get destination error:", error);
      res.status(500).json({ error: "Failed to fetch destination" });
    }
  },
);

// Create new destination
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { source_id, platform, rtmp_url, stream_key, is_active = true } = req.body;

    // Validate required fields
    if (!source_id || !platform || !rtmp_url || !stream_key) {
      res.status(400).json({
        error: "Missing required fields",
        required: ["source_id", "platform", "rtmp_url", "stream_key"],
      });
      return;
    }

    // Verify source exists
    const sourceCheck = await db.query<{ id: number; user_id: number }>(
      "SELECT id, user_id FROM stream_sources WHERE id = $1",
      [source_id],
    );

    if (sourceCheck.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Security: Prevent using Neustream stream keys as destinations
    const isNeustreamStreamKey = await db.query<{ id: number }>(
      "SELECT id FROM users WHERE stream_key = $1",
      [stream_key],
    );

    if (isNeustreamStreamKey.length > 0) {
      res.status(400).json({
        error: "Cannot use Neustream stream keys as destinations. Please use external platform stream keys only.",
      });
      return;
    }

    // Insert into source_destinations table
    const result = await db.run<any>(
      "INSERT INTO source_destinations (source_id, platform, rtmp_url, stream_key, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [source_id, platform, rtmp_url, stream_key, is_active],
    );

    res.status(201).json({
      data: result,
    });
  } catch (error: any) {
    console.error("Create destination error:", error);
    res.status(500).json({ error: "Failed to create destination" });
  }
});

// Update destination
router.put(
  "/:id",
  handleGenericIdParam("source_destinations"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { platform, rtmp_url, stream_key, is_active } = req.body as {
      platform?: string;
      rtmp_url?: string;
      stream_key?: string;
      is_active?: boolean;
    };

    try {
      // Build dynamic update query
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (platform !== undefined) {
        updates.push(`platform = $${paramIndex++}`);
        params.push(platform);
      }
      if (rtmp_url !== undefined) {
        updates.push(`rtmp_url = $${paramIndex++}`);
        params.push(rtmp_url);
      }
      if (stream_key !== undefined) {
        updates.push(`stream_key = $${paramIndex++}`);
        params.push(stream_key);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        params.push(is_active);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: "No valid fields to update" });
        return;
      }

      params.push(id);

      // Update source_destinations table
      const result = await db.run<any>(
        `UPDATE source_destinations SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        params,
      );

      if (!result) {
        res.status(404).json({ error: "Destination not found" });
        return;
      }

      res.json({ data: result });
    } catch (error: any) {
      console.error("Update destination error:", error);
      res.status(500).json({ error: "Failed to update destination" });
    }
  },
);

// Delete destination
router.delete(
  "/:id",
  handleGenericIdParam("source_destinations"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await db.query(
        "DELETE FROM source_destinations WHERE id = $1",
        [id],
      );

      res.json({ message: "Destination deleted successfully" });
    } catch (error: any) {
      console.error("Delete destination error:", error);
      res.status(500).json({ error: "Failed to delete destination" });
    }
  },
);

export default router;
