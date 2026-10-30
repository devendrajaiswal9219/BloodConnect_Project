require ('dotenv').config();
const express=require("express");
const connectDB=require("./config/db");
const cors=require("cors");
const {errorHandler,notFoundHandler}=require("./middleware/errorHandler");
const authRoutes=require("./routes/authRoutes");
const bloodInventory=require("./models/BloodInventory");
const inventoryRoutes=require("./routes/inventoryRoute");
const donationRoute=require("./routes/donatioRoutes")
const requestRoute=require("./routes/requestRoutes")
const statCounts=require("./routes/statsRoutes")



connectDB().then(()=>bloodInventory.ensureAllGroups());
const app=express();
const allowedOrigins=(process.env.CLIENT_ORIGIN || 'http://localhost:8000').split(',')
app.use(cors({origin:allowedOrigins, credentials:true}));

app.use(express.json({limit:"1mb"}));
app.get('/api/health',(req,res)=>{
    res.json({status:"ok",timestamp:new Date().toISOString()});
});

app.use('/api/auth',authRoutes);
app.use('/api/inventory',inventoryRoutes);
app.use('/api/donations',donationRoute);
app.use('/api/requests',requestRoute);
app.use('/api/stats',statCounts);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})