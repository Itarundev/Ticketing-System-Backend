const db = require("../db/db");

// Create Deadline History
const createDeadlineHistory = async (req, res) => {
  const { ticket_id, reason, deadline_date } = req.body;

  try {
    const data = await db("deadline_history").insert({
      ticket_id,
      reason,
      deadline_date,
    });

    // Return newly created deadline history as response
    return res.status(201).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get Ticket Deadline History
const getTicketDeadlineHistory = async (req, res) => {
  const ticketId = req.params.id;

  try {
    const deadlineHistory = await db("deadline_history").where(
      "ticket_id",
      ticketId,
    ).orderBy("created_at", "desc");

    // Return deadline history as response
    return res.status(201).json({ deadlineHistory : deadlineHistory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createDeadlineHistory, getTicketDeadlineHistory };
