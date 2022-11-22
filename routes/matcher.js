import express from 'express';
import betsModel from '../models/betsModel';
const matcher = express.Router();

matcher.get('/', (req,res)=>{
    res.send("matche bets.")
});

matcher.get('/all',async (req, res)=>{
    let games = await betsModel.find({});
    res.json(games).status(200);
});

matcher.get("/byGameId/:id", async (req, res)=>{
    let id = req.params.id;
    let games = await betsModel.find({ matchId: id});
    res.json(games).status(200);
});

matcher.get('/unmatched',async(req, res)=>{
    let games = await betsModel.find({ matched: false});
    res.send(games).status(200);
})

export default matcher;