const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const saltRounds = 10;
const JWT_SECRET = 'your_secret_key'

const createCompany = async (req, res) => {
  const { brand_name, contact_person, project, mobile_no, address, email, password , createdBy} = req.body;
  console.log(req.body,"Body")


  // Check if all required fields are provided
  if (!brand_name || !contact_person || !project || !mobile_no || !address || !email || !password) {
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
        console.log(decoded,"Decoded")
    const isAdmin = decoded.company.isAdmin;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    // Create company
    const company = {
      brand_name,
      contact_person,
      project,
      mobile_no,
      address,
      email,
      password: passwordHash,
      createdBy
    };

    const result = await db('company_details').insert(company);

    // Send response
    return res.status(201).json({ message: 'Company created', id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

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
    const token = jwt.sign({ company:company}, JWT_SECRET, { expiresIn: '1d' });
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

// const getAllCompanies = async (req, res) => {
//   try {
//     const companies = await db('company_details').select('*');
//     return res.status(200).json({ companies });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };



module.exports = { createCompany ,login , updatePassword};
