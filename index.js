import express  from "express";
import { connectDB, updater } from "./dbUpdater.js";
import bookieRouter from "./routes/bookie.js";
import matcher from "./routes/matcher.js";
import json  from "body-parser";
import '../client/src/index.html'

const app = express();
app.use(json())
app.use('/bookie', bookieRouter);
app.use('/matcher', matcher);

app.get("/",async (req,res)=>{
     res.send("index");
});

app.get("/rules",(req,res)=>{
    res.send("rules page");
});

app.get("/contact",(req, res)=>{
    res.send("contact page");
});

app.listen(3000,async ()=> {
    await connectDB();
    await updater();
    console.log("server running on port 3000");
});