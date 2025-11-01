const express = require("express");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const db = new Database();

// Public contact form submission endpoint
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Missing required fields",
        fields: {
          name: !name ? "Name is required" : null,
          email: !email ? "Email is required" : null,
          subject: !subject ? "Subject is required" : null,
          message: !message ? "Message is required" : null
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    // Get user ID if logged in (for future when we make this auth-optional)
    let userId = null;
    if (req.user) {
      userId = req.user.id;
    }

    // Extract IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    const query = `
      INSERT INTO contact_submissions
      (name, email, subject, message, user_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, subject, status, created_at
    `;

    const values = [name, email, subject, message, userId, ipAddress, userAgent];
    const result = await db.query(query, values);

    if (result.length === 0) {
      throw new Error("Failed to create contact submission");
    }

    const submission = result[0];

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      message: "Contact submission received successfully",
      submission: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        status: submission.status,
        createdAt: submission.created_at
      }
    });

  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process contact submission"
    });
  }
});

// Get all contact submissions (admin only)
router.get("/", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.email !== "admin@neustream.app") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  try {
    const {
      status,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND cs.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      whereClause += ` AND cs.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Validate sort field
    const allowedSortFields = ['created_at', 'name', 'email', 'subject', 'status', 'priority'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const query = `
      SELECT
        cs.id,
        cs.name,
        cs.email,
        cs.subject,
        cs.message,
        cs.status,
        cs.priority,
        cs.user_id,
        cs.ip_address,
        cs.created_at,
        cs.updated_at,
        cs.responded_at,
        cs.responded_by,
        cs.notes,
        u.display_name as responder_username,
        COUNT(*) OVER() as total_count
      FROM contact_submissions cs
      LEFT JOIN users u ON cs.responded_by = u.id
      ${whereClause}
      ORDER BY cs.${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await db.query(query, params);

    const submissions = result;
    const totalCount = submissions.length > 0 ? parseInt(submissions[0].total_count) : 0;

    res.json({
      submissions: submissions.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject,
        message: row.message,
        status: row.status,
        priority: row.priority,
        userId: row.user_id,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        respondedAt: row.responded_at,
        respondedBy: row.responded_by,
        responderUsername: row.responder_username,
        notes: row.notes
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Get contact submissions error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve contact submissions"
    });
  }
});

// Get contact submission by ID (admin only)
router.get("/:id", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.email !== "admin@neustream.app") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  try {
    const { id } = req.params;

    const query = `
      SELECT
        cs.*,
        u.display_name as responder_username,
        COUNT(csr.id) as response_count
      FROM contact_submissions cs
      LEFT JOIN users u ON cs.responded_by = u.id
      LEFT JOIN contact_submission_responses csr ON cs.id = csr.submission_id
      WHERE cs.id = $1
      GROUP BY cs.id, u.display_name
    `;

    const result = await db.query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        error: "Contact submission not found"
      });
    }

    const submission = result[0];

    // Get responses for this submission
    const responsesQuery = `
      SELECT
        csr.*,
        u.display_name as responder_username
      FROM contact_submission_responses csr
      LEFT JOIN users u ON csr.user_id = u.id
      WHERE csr.submission_id = $1
      ORDER BY csr.created_at ASC
    `;

    const responsesResult = await db.query(responsesQuery, [id]);

    res.json({
      submission: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        status: submission.status,
        priority: submission.priority,
        userId: submission.user_id,
        ipAddress: submission.ip_address,
        userAgent: submission.user_agent,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
        respondedAt: submission.responded_at,
        respondedBy: submission.responded_by,
        responderUsername: submission.responder_username,
        notes: submission.notes,
        responseCount: parseInt(submission.response_count)
      },
      responses: responsesResult
    });

  } catch (error) {
    console.error("Get contact submission error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve contact submission"
    });
  }
});

// Update contact submission status (admin only)
router.patch("/:id", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.email !== "admin@neustream.app") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  try {
    const { id } = req.params;
    const { status, priority, notes } = req.body;

    if (!status && !priority && notes === undefined) {
      return res.status(400).json({
        error: "At least one field must be provided for update"
      });
    }

    const updates = [];
    const params = [id];
    let paramIndex = 2;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      updates.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    // If marking as responded, update responded fields
    if (status === 'responded') {
      updates.push(`responded_at = NOW()`);
      updates.push(`responded_by = $${paramIndex}`);
      params.push(req.user.id);
    }

    const query = `
      UPDATE contact_submissions
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.length === 0) {
      return res.status(404).json({
        error: "Contact submission not found"
      });
    }

    res.json({
      message: "Contact submission updated successfully",
      submission: result[0]
    });

  } catch (error) {
    console.error("Update contact submission error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update contact submission"
    });
  }
});

// Add response to contact submission (admin only)
router.post("/:id/responses", authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.email !== "admin@neustream.app") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  try {
    const { id } = req.params;
    const { response, responseType = 'email' } = req.body;

    if (!response) {
      return res.status(400).json({
        error: "Response text is required"
      });
    }

    const query = `
      INSERT INTO contact_submission_responses
      (submission_id, user_id, response, response_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [id, req.user.id, response, responseType];
    const result = await db.query(query, values);

    if (result.length === 0) {
      throw new Error("Failed to add response");
    }

    // Update submission status to responded
    await db.query(
      `UPDATE contact_submissions
       SET status = 'responded', responded_at = NOW(), responded_by = $1, updated_at = NOW()
       WHERE id = $2`,
      [req.user.id, id]
    );

    res.status(201).json({
      message: "Response added successfully",
      response: result[0]
    });

  } catch (error) {
    console.error("Add response error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to add response"
    });
  }
});

module.exports = router;