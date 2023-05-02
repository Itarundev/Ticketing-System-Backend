const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');


// Create a new ticket
router.post('/new-ticket', ticketController.createTicket);
// Update a ticket
router.post('/update-ticket', ticketController.updateTicket);
// Commenting on a Ticket
router.post('/update-ticket', ticketController.createTicketHistory);


module.exports = router;