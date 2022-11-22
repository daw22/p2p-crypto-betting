import json  from 'body-parser';
import express from 'express';
import gamesModel from "../models/gamesModel.js";
import betsModel from '../models/betsModel.js';
import { getFormatedDate } from "../dbUpdater.js";

const bookieRouter = express.Router();
bookieRouter.use(json());

bookieRouter.get('/:day', async(req,res)=>{
    let day = getFormatedDate(parseInt(req.params.day));
    let data = await gamesModel.find({matchDay: day});
    res.json(data).status(200);
});

bookieRouter.get('/mybets/:address',async (req, res)=>{
    let address = req.params.address;
    let bets = await betsModel.find({ betProviderAddress: address});
    res.json(bets).status(200);
});

bookieRouter.post('/provide', async (req, res)=>{
    let body = json(req.body);
    let model = new betsModel(body);
    await model.save();
    res.json(body).status(201);
})

export default bookieRouter;