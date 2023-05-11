const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');
const multer = require('multer'); // Add this line
const path = require('path');

// Set up the storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage }); // Use the storage object with multer


// Create a new ticket
router.post('/new-ticket', upload.array('images'), ticketController.createTicket);
// Update a ticket
router.patch('/update-ticket/:id', ticketController.updateTicket);
// Delete a ticket
router.delete('/delete-ticket/:id', ticketController.deleteTicket);
// Get all the tickets
router.post('/all-ticket', ticketController.getTickets);
// Commenting on a Ticket
router.post('/create-ticket-history',  upload.array('images'),ticketController.createTicketHistory);
// Getting all the comments on the Ticket
router.get('/get-ticket-history/:id', ticketController.getTicketHistory);
// Get all catergories/Support type
router.get('/get-category', ticketController.getDistinctSupportTypes);
// Get all sub-catergories/Support-related-to
router.get('/subcategories', ticketController.getSubcategories);
// Get all facing-issue-on
router.get('/facing-issues', ticketController.getFacingIssues);




module.exports = router;