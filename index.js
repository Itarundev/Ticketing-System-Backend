require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const adminRoutes=require('./routes/adminRoutes')
const companyRoutes=require('./routes/companyRoutes')
const ticketRoutes=require('./routes/ticketRoutes')

const port = process.env.PORT || 3000

app.use(express.json());
app.use(cors());

 
app.use('/uploads', express.static('uploads'));

app.use('/admin', adminRoutes); 
app.use('/api', companyRoutes); 
app.use('/api', ticketRoutes); 

app.listen(port,()=>{
    console.log(`server started at ${port}`)
}
)
