require ('dotenv').config();
const express=require("express");
const connectDB=require("./config/db");
const {errorHandler,notFoundHandler}=require("./middleware/errorHandler");
const authRoutes=require("./routes/authRoutes");
const bloodInventory=require("./models/BloodInventory");
const inventoryRoutes=require("./routes/inventoryRoute");
const donationRoute=require("./routes/donatioRoutes")

connectDB().then(()=>bloodInventory.ensureAllGroups());
const app=express();
const PORT=process.env.PORT || 8000;

app.use(express.json({limit:"1mb"}));
app.get('/api/health',(req,res)=>{
    res.json({status:"ok",timestamp:new Date().toISOString()});
});

app.use('/api/auth',authRoutes);
app.use('/api/inventory',inventoryRoutes);
app.use('/api/donations',donationRoute)

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})