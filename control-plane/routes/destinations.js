const express = require("express");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const db = new Database();

// Get user's destinations - requires authentication
router.get("/", authenticateToken, async (req, res) => {
  // Use authenticated user ID instead of query parameter
  const userId = req.user.id;

  try {
    const destinations = await db.query(
      "SELECT * FROM destinations WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json({ destinations });
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Add new destination - requires authentication
router.post("/", authenticateToken, async (req, res) => {
  const { platform, rtmpUrl, streamKey } = req.body;
  // Use authenticated user ID instead of request body parameter
  const userId = req.user.id;

  try {
    const result = await db.run(
      "INSERT INTO destinations (user_id, platform, rtmp_url, stream_key) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, platform, rtmpUrl, streamKey]
    );

    res.json({ destination: result });
  } catch (error) {
    console.error("Add destination error:", error);
    res.status(500).json({ error: "Failed to add destination" });
  }
});

// Update destination - requires authentication
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { platform, rtmpUrl, streamKey, isActive } = req.body;

  try {
    // Ensure the destination belongs to the authenticated user
    const result = await db.run(
      "UPDATE destinations SET platform = $1, rtmp_url = $2, stream_key = $3, is_active = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [platform, rtmpUrl, streamKey, isActive, id, req.user.id]
    );

    if (!result) {
      return res
        .status(404)
        .json({ error: "Destination not found or unauthorized" });
    }

    res.json({ destination: result });
  } catch (error) {
    console.error("Update destination error:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

// Delete destination - requires authentication
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure the destination belongs to the authenticated user
    const result = await db.run(
      "DELETE FROM destinations WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Destination not found or unauthorized" });
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete destination error:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

module.exports = router;
