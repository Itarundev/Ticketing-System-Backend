const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');

// Create a new company
router.post('/register', companyController.createCompany);
// Login in a company 
router.post('/login', companyController.login);


module.exports = router;