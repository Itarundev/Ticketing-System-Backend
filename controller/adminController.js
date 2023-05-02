// adminController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db=require('../db/db')

const saltRounds = 10;
const JWT_SECRET = 'your_secret_key'


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
        email,
        password: hashedPassword,
        isAdmin:true
      })
      // .returning(['id', 'name', 'email', 'mobile_no','isAdmin']);
console.log(data)
    // Return newly created admin as response
    return res.status(201).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Log in an admin
// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     // Check if the admin exists in the database
//     const admin = await db('admin').where({ email }).first();
//     if (!admin) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     // Compare the provided password with the hashed password stored in the database
//     const isPasswordValid = await bcrypt.compare(password, admin.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     // Remove the password field from the admin object
//     delete admin.password;

//     // If the provided email and password are valid, create a JWT token and include the admin data in the payload
//     const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name, role: admin.role }, JWT_SECRET);

//     // Return the token and the admin data in the response
//     return res.json({ token, admin });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

module.exports = { registerAdmin};