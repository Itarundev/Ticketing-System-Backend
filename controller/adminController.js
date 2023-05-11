// adminController.js

const bcrypt = require('bcrypt');
const db=require('../db/db')
const saltRounds = 10;


// Register a new admin
const registerAdmin = async (req, res) => {
  const { name, mobile_no, email, password } = req.body;
 

  try {
    // Check if email is already registered
    const existingUser = await db('company_details').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new admin into database
    
    const data = await db('company_details')
      .insert({
        brand_name:name,
        mobile_no,
        email:email.toLowerCase(),
        password: hashedPassword,
        is_admin:true
      })

    // Return newly created admin as response
    return res.status(201).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerAdmin};