const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');

// Create a new company
router.post('/register', companyController.createCompany);
// Getting all the companies
router.get('/get-all-companies', companyController.getNonAdminCompanies);
// Login in a company 
router.post('/login', companyController.login);
// Deleting a company
router.delete('/delete-company/:id', companyController.deleteCompany);
// Getting all the projects
router.get('/get-all-projects', companyController.getNotNullProjects);

module.exports = router;