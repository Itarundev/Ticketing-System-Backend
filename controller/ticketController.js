const jwt = require('jsonwebtoken');
const db = require('../db/db');
const path = require('path');
require('dotenv').config();

const JWT_SECRET =process.env.JWT_SECRET;
const createTicket = async (req, res) => {
  try {
    const { support_type, support_related_to, title, description, facing_issue_on,project_name,end_date ,priority} = req.body;
    const images = req.files;


    const tickets = await db("tickets");
    console.log("tickets ", tickets);

    //   // Check if all required fields are provided
    if (!support_type || !title || !description || !facing_issue_on||!project_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    //     // Verify company token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    //     // Create ticket
    const ticket = {
      support_type,
      support_related_to,
      title,
      description,
      facing_issue_on,
      end_date,
      image: images ? JSON.stringify(images.map((image) => ({ url: path.join('uploads', image.filename) }))) : null,
      created_by_id: decoded.company.id,
      created_by_name: decoded.company.brand_name,
      priority,
      project_name
    };
    const result = await db('tickets').insert(ticket);

    // Send response
    return res.status(201).json({ message: 'Ticket created', result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the ticket' });
  }
}

// Updating a ticket
const updateTicket = async (req, res) => {
  const ticketId = req.params.id;
  const { support_type, support_related_to, title, description, facing_issue_on, status,priority,end_date } = req.body;

  // Check if all required fields are provided
  if (!support_type || !support_related_to || !title || !description || !facing_issue_on || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    //   // Check if user is admin or not
    const is_admin= decoded.company.is_admin

    if (!is_admin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Update ticket
    const result = await db('tickets').where('id', ticketId).update({
      support_type,
      support_related_to,
      title,
      description,
      facing_issue_on,
      status,
      updated_at: db.fn.now(),
      priority,
      end_date
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send response
    return res.status(200).json({ message: 'Ticket updated' });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Deleting a ticket
const deleteTicket = async (req, res) => {
  const ticketId = req.params.id;

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
    const result = await db('tickets').where('id', ticketId).del();

    if (result === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send response
    return res.status(200).json({ message: 'Ticket deleted' });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Geting all the Tickets



// const getTickets = async (req, res) => {
//   try {
//     // Verify user token
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.split(' ')[1] ?? '';
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Get page and page size from query parameters
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.limit) || 10;

//     // Calculate the offset based on page and page size
//     const offset = (page - 1) * pageSize;

//     // Query the database for tickets based on the user's access level
//     let ticketsQuery = db('tickets');

//     // Add filter based on start and end date
//     if (req.body.startDate && req.body.endDate) {
//       ticketsQuery = ticketsQuery.whereBetween('created_at', [`${req.body.startDate} 00:00:00.000000+05:30`, `${req.body.endDate} 23:59:59.999999+05:30`]);
//     } else if (req.body.startDate) {
//       ticketsQuery = ticketsQuery.where('created_at', '>=', `${req.body.startDate} 00:00:00.000000+05:30`);
//     } else if (req.body.endDate) {
//       ticketsQuery = ticketsQuery.where('created_at', '<=', `${req.body.endDate} 23:59:59.999999+05:30`);
//     }

//     // Check if req.body is empty
//     const filters = Object.entries(req.body).reduce((acc, [key, value]) => {
//       if (value && key !== 'startDate' && key !== 'endDate' ) {
//         return { ...acc, [key]: value };
//       }
//       return acc;
//     }, {});

//     if (!decoded.company.is_admin) {
//       ticketsQuery = ticketsQuery.where('tickets.created_by_id', decoded.company.id).where((builder) => {
//         Object.entries(filters).forEach(([key, value]) => {
//           builder.whereRaw(`lower(${key}) like ?`, [`%${value.toLowerCase()}%`]);
//         });
//       });
//     }

//     if (decoded.company.is_admin && Object.keys(filters).length > 0) {
//       ticketsQuery = ticketsQuery.where((builder) => {
//         Object.entries(filters).forEach(([key, value]) => {
//           builder.whereRaw(`lower(${key}) like ?`, [`%${value.toLowerCase()}%`]);
//         });
//       });
//     }

//     let tickets;
//     if (req.query.page && req.query.limit) {
//       tickets = await ticketsQuery.offset(offset).limit(pageSize);
//     } else {
//       tickets = await ticketsQuery;
//     }

//     const countResult = await ticketsQuery.count('id as count').first();
//     const count = countResult?.count ?? 0;

//     // Send the tickets and count in the response
//     return res.status(200).json({ tickets, count });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'An error occurred while getting tickets' });
//   }
// };

const getTickets = async (req, res) => {
  try {
    // Verify user token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get page and page size from query parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;

    // Calculate the offset based on page and page size
    const offset = (page - 1) * pageSize;

    // Query the database for tickets based on the user's access level
    let ticketsQuery = db('tickets');

    // Add filter based on start and end date
    if (req.body.startDate && req.body.endDate) {
      ticketsQuery = ticketsQuery.whereBetween('created_at', [`${req.body.startDate} 00:00:00.000000+05:30`, `${req.body.endDate} 23:59:59.999999+05:30`]);
    } else if (req.body.startDate) {
      ticketsQuery = ticketsQuery.where('created_at', '>=', `${req.body.startDate} 00:00:00.000000+05:30`);
    } else if (req.body.endDate) {
      ticketsQuery = ticketsQuery.where('created_at', '<=', `${req.body.endDate} 23:59:59.999999+05:30`);
    }

    // Check if req.body is empty
    const filters = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value && key !== 'startDate' && key !== 'endDate') {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});

    if (!decoded.company.is_admin) {
      ticketsQuery = ticketsQuery.where('tickets.created_by_id', decoded.company.id).where((builder) => {
        Object.entries(filters).forEach(([key, value]) => {
          builder.whereRaw(`lower(${key}) like ?`, [`%${value.toLowerCase()}%`]);
        });
      });
    }

    if (decoded.company.is_admin && Object.keys(filters).length > 0) {
      ticketsQuery = ticketsQuery.where((builder) => {
        Object.entries(filters).forEach(([key, value]) => {
          builder.whereRaw(`lower(${key}) like ?`, [`%${value.toLowerCase()}%`]);
        });
      });
    }

    // Count the total number of tickets for pagination
    const countQuery = ticketsQuery.clone().clearSelect().count('id as count').first();
    const countResult = await countQuery;
    const count = countResult?.count ?? 0;

    // Retrieve the tickets for the current page
    const tickets = await ticketsQuery.offset(offset).limit(pageSize).groupBy('tickets.id').orderBy('created_at', 'desc');

    // Fetch data from developers_list table and wait for the result
    const developers = await db('developers_list').select('*');

    // Send the tickets, count, and developers in the response
    return res.status(200).json({ tickets, count, developers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while getting tickets' });
  }
};










// We are adding comment on the ticket
const createTicketHistory = async (req, res) => {
  const { comment, ticket_id } = req.body;
  const images = req.files;

  // Check if all required fields are provided
  if (!comment || !ticket_id) {
    return res.status(400).json({ message: 'Comment and ticket ID are required' });
  }

  try {
    // Verify user token
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] ?? '';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Insert ticket history record into the database
    const result = await db('tickets_history').insert({
      comment,
      image: images ? JSON.stringify(images.map((image) => ({ url: path.join('uploads', image.filename) }))) : null,
      ticket_id,
      created_by_id: decoded.company.id,
      created_by_name: decoded.company.brand_name

    });

    // Send response
    return res.status(201).json({ message: 'Ticket history created', id: result.insertedId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Getting all the Ticket Comments
const getTicketHistory = async (req, res) => {
  const ticketId = req.params.id;

  try {
    // Query the database for ticket history records
    const result = await db('tickets_history')
      .where('ticket_id', ticketId)
      .select();

    // Send the ticket history records in the response
    return res.status(200).json({ ticketHistory: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while getting ticket history' });
  }
};


// Getting all the categories

const getDistinctSupportTypes = async (req, res) => {
  try {
    const result = await db('support_type')
      .distinct('category')
      .select()
      .orderBy('category');
    const supportTypes = result.map((row) => row.category);

    return res.status(200).json(supportTypes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching the support types' });
  }
}

// Getting all the sub-categories

async function getSubcategories(req, res) {
  try {
    // Query the database for subcategories
    const results = await db('support_type').select();
    // Group the subcategories by category
    const subcategoriesByCategory = {};
    results.forEach((row) => {
      const { category, category_type } = row;
      if (!subcategoriesByCategory[category]) {
        subcategoriesByCategory[category] = [category_type];
      } else {
        subcategoriesByCategory[category].push(category_type);
      }
    });

    // Send the subcategories grouped by category in the response
    return res.status(200).json(subcategoriesByCategory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while getting subcategories' });
  }
}

// getting all the facing issue on filed value
async function getFacingIssues(req, res) {
  try {
    // Query the database for issues
    const results = await db('facing_issue_on').select();

    // Extract the issues from the query result
    const issues = results.map((row) => row.issues);

    // Send the issues in the response
    return res.status(200).json({ issues });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while getting issues' });
  }
}




module.exports = { updateTicket, createTicket, deleteTicket, createTicketHistory, getTicketHistory, getDistinctSupportTypes, getSubcategories, getFacingIssues, getTickets };
