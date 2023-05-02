const jwt = require('jsonwebtoken');
const db = require('../db/db');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'your_secret_key';
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

const createTicket = async (req, res) => {
  const { support_type, support_relatedto, title, description, facing_issue_on } = req.body;

  // Check if all required fields are provided
  if (!support_type || !support_relatedto || !title || !description || !facing_issue_on) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify company token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Create ticket
    const ticket = {
      support_type,
      support_relatedto,
      title,
      description,
      facing_issue_on,
      image: req.files.map(file => `/uploads/${file.filename}`),
      created_by: decoded.id,
      admin_id: null,
    };

    const result = await db('tickets').insert(ticket);

    // Send response
    return res.status(201).json({ message: 'Ticket created', id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTicket = async (req, res) => {
  const ticketId = req.params.id;
  const { support_type, support_relatedto, title, description, facing_issue_on, status } = req.body;

  // Check if all required fields are provided
  if (!support_type || !support_relatedto || !title || !description || !facing_issue_on || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

  //   // Check if user is admin or not
  //   const isAdmin = decoded.role === 'admin';

  //   if (!isAdmin) {
  //     return res.status(403).json({ message: 'Unauthorized access' });
  //   }

    // Update ticket
    const result = await db('tickets').where('id', ticketId).update({
      support_type,
      support_relatedto,
      title,
      description,
      facing_issue_on,
      status,
      updated_at: knex.fn.now()
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send response
    return res.status(200).json({ message: 'Ticket updated' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createTicketHistory = async (req, res) => {
  const { comment, ticket_id } = req.body;

  // Check if all required fields are provided
  if (!comment || !ticket_id) {
    return res.status(400).json({ message: 'Comment and ticket ID are required' });
  }

  try {
    // Insert ticket history record into the database
    const result = await db('tickets_history').insert({
      comment,
      image:req.files.map(file => `/uploads/${file.filename}`),
      ticket_id,
    });

    // Send response
    return res.status(201).json({ message: 'Ticket history created', id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




module.exports = { updateTicket, createTicket, createTicketHistory, upload };
