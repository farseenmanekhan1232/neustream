import express, { Request, Response } from "express";
import Database from "../../lib/database";
import { handleGenericIdParam } from "../../middleware/idHandler";

const router = express.Router();
const db = new Database();

// Get all destinations with source info
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const destinations = await db.query<any>(`
      SELECT
        sd.*,
        d.platform,
        d.rtmp_url,
        d.stream_key as destination_key,
        d.is_active as destination_is_active,
        ss.uuid as source_uuid,
        ss.name as source_name,
        u.email as user_email,
        u.display_name as user_display_name
      FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
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
    const { id } = req.params;

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

// Create new destination (FIXED: Was missing!)
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
    const sourceCheck = await db.query<any>(
      "SELECT id, name, user_id FROM stream_sources WHERE id = $1",
      [source_id],
    );

    if (sourceCheck.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    // Security: Prevent using Neustream stream keys as destinations
    const isNeustreamStreamKey = await db.query<any>(
      "SELECT id FROM stream_sources WHERE stream_key = $1 UNION SELECT id FROM users WHERE stream_key = $1",
      [stream_key],
    );

    if (isNeustreamStreamKey.length > 0) {
      res.status(400).json({
        error: "Cannot use Neustream stream keys as destinations. Please use external platform stream keys only.",
      });
      return;
    }

    // Insert into destinations table first
    const destinationResult = await db.run<any>(
      "INSERT INTO destinations (platform, rtmp_url, stream_key, is_active) VALUES ($1, $2, $3, $4) RETURNING *",
      [platform, rtmp_url, stream_key, is_active],
    );

    // Then insert into source_destinations junction table
    const result = await db.run<any>(
      "INSERT INTO source_destinations (source_id, destination_id, is_active) VALUES ($1, $2, $3) RETURNING *",
      [source_id, destinationResult.id, is_active],
    );

    res.status(201).json({
      data: {
        ...result,
        platform,
        rtmp_url,
        stream_key,
      },
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
      // Destination exists check is already handled by middleware
      const existingDest = (req as any).entity;

      // Update both source_destinations and destinations tables
      const result = await db.run<any>(
        `UPDATE source_destinations sd
       JOIN destinations d ON sd.destination_id = d.id
       SET d.platform = COALESCE($1, d.platform),
           d.rtmp_url = COALESCE($2, d.rtmp_url),
           d.stream_key = COALESCE($3, d.stream_key),
           sd.is_active = COALESCE($4, sd.is_active)
       WHERE sd.id = $5
       RETURNING sd.*, d.platform, d.rtmp_url, d.stream_key, d.is_active`,
        [platform, rtmp_url, stream_key, is_active, id],
      );

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
      const result = await db.run<any>(
        "DELETE FROM source_destinations WHERE id = $1",
        [id],
      );

      if (result.changes === 0) {
        res.status(404).json({ error: "Destination not found" });
        return;
      }

      res.json({ message: "Destination deleted successfully" });
    } catch (error: any) {
      console.error("Delete destination error:", error);
      res.status(500).json({ error: "Failed to delete destination" });
    }
  },
);

export default router;
