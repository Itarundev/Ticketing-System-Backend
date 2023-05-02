const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

// Create a new admin
router.post('/register', adminController.registerAdmin);

// Log in admin
// router.post('/login', adminController.login);

// // Get all admins
// router.get('/admins', adminController.getAllAdmins);

// // Get a single admin by ID
// router.get('/admin/:id', adminController.getAdminById);

// // Delete a single admin by ID
// router.delete('/admin/:id', adminController.deleteAdminById);

module.exports = router;
