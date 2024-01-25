const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const saltRounds = 10;
require('dotenv').config();
const JWT_SECRET =process.env.JWT_SECRET;

const createCompany = async (req, res) => {
  const { brand_name, contact_person, project, mobile_no, address, email, password } = req.body;


  // Check if all required fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);
    // Hash password
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    // Check if company with the same email already exists
    const existingCompany = await db('company_details').where({ email }).first();
    if (existingCompany) {
      return res.status(400).json({ message: 'Email already registered' });
    }
        // Check if user is admin or not
    const is_admin = decoded.company.is_admin;
    if (!is_admin ) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    // Create company
    const company = {
      brand_name,
      contact_person,
      project,
      mobile_no,
      address,
      email:email.toLowerCase(),
      password: passwordHash,
      created_by_id:decoded.company.id,
    };

    const result = await db('company_details').insert(company);

    // Send response
    return res.status(201).json({ message: 'Company created', id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getNotNullProjects = async (req, res) => {
  try {

     // Verify admin token
     const authHeader = req.headers.authorization;
     const token = authHeader?.split(' ')[1] ?? '';
     const decoded = jwt.verify(token, JWT_SECRET);
 
     // Check if user is admin or not
     const is_admin = decoded.company.is_admin;
     if (!is_admin) {
       return res.status(403).json({ message: 'Unauthorized access' });
     }

    // Get all companies from the database
    const companies = await db('company_details').select('project');

    // Filter out companies with null or empty project names
    const filteredCompanies = companies.filter(company => company.project);

    // Create an array of project names from the remaining companies
    const projects = filteredCompanies.map(company => company.project);

    // Send response
    return res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




// Getting all the companies
const getNonAdminCompanies = async (req, res) => {
  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is admin or not
    const isAdmin = decoded.company.is_admin;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get page and page size from query parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;

    // Validate page and page size
    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return res.status(400).json({ message: 'Invalid page or page size' });
    }

    // Calculate the offset based on page and page size
    const offset = (page - 1) * pageSize;

    // Get all non-admin companies with pagination
    const companies = await db('company_details')
      .where('is_admin', false)
      .orderBy('id')
      .limit(pageSize)
      .offset(offset);

    // Get total count of non-admin companies
    const totalCountResult = await db('company_details')
      .where('is_admin', false)
      .count('id as count')
      .first();
    const totalCount = parseInt(totalCountResult.count);

    // Send response
    return res.status(200).json({ companies, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





// Deleting a Company
const deleteCompany = async (req, res) => {
  const companyId = req.params.id;

  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is admin or not
    const is_admin = decoded.company.is_admin

    if (!is_admin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Delete ticket
    const result = await db('company_details').where('id', companyId).del();

    if (result === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Send response
    return res.status(200).json({ message: 'Company deleted' });
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const login = async (req, res) => {
     let {email}=req.body;
     email=email.toLowerCase()
  const { password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find company by email
    const company = await db('company_details').where({ email }).first();
    if (!company) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Verify password
    const passwordMatch = await bcrypt.compare(password, company.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Create JWT token
    const token = jwt.sign({ company:company}, JWT_SECRET);
    // Remove password from company object
    delete company.password;
    // Return company object and token
    return res.status(200).json({ message: 'Login successful', company, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  const { email, old_password, new_password } = req.body;

  // Check if email, old_password and new_password are provided
  if (!email || !old_password || !new_password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify company token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';

    const decoded = jwt.verify(token, JWT_SECRET);

    // Find company by email
    const company = await db('company_details').where({ email }).first();
    if (!company) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Verify old password
    const passwordMatch = await bcrypt.compare(old_password, company.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid old password' });
    }
    // Hash new password
    const new_passwordHash = bcrypt.hashSync(new_password, saltRounds);
    // Update password
    const result = await db('company_details').where({ email }).update({ password: new_passwordHash });
    // Send response
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





module.exports = { createCompany ,login , updatePassword,getNonAdminCompanies,deleteCompany,getNotNullProjects};
