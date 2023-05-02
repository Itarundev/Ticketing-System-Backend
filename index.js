const express = require("express");
const app = express();
const cors = require("cors");

const port = 8004;
const adminRoutes=require('./routes/adminRoutes')
const companyRoutes=require('./routes/companyRoutes')



app.use(express.json());
app.use(cors());

// app.use("/uploads",express.static("./uploads"))
app.use('/admin', adminRoutes); 
app.use('/api', companyRoutes); 

app.listen(port,()=>{
    console.log(`server started at ${port}`)
}
)
