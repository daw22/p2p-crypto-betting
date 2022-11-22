import schedule  from 'node-schedule';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import gamesModel from './models/gamesModel.js';
import betsModel from './models/betsModel.js'

dotenv.config(); 

const db_uri = process.env.DB_URI;

// util functions
export function getFormatedDate(inc){
    // inc = 0 -> today, inc = 1 -> tomorow, inc = 2 dayAfterTomorow ....
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + inc)
    let fullYear = date.getFullYear().toString();
    let month = parseInt(date.getMonth()) + 1;
    month = month.toString();
    let day = date.getDate().toString()
    if(month.length < 2)
        month = "0" + month;
    if(day.length < 2)
        day = "0" + day;    
    return fullYear+month+day;
}

// fetch fixtures for a single day
export async function fetchFixtures(day){
    let url = `https://www.fotmob.com/api/matches?timezone=Africa%2FNairobi&
               countryCode=ET&ccode3=ETH&date=${getFormatedDate(day)}&sortOnClient=true`
    const responce = await axios.get(url); 
    const data = responce.data;
    return data;          
}

//connect to Db
export async function connectDB(){
    const config =  { useNewUrlParser: true, useUnifiedTopology: true };
    await mongoose.connect(db_uri,config);
    console.log("Connected to Db");
}

// save timeStamp to gameId pair
function timeStampToGameIdMaper(day){
    let timeStampToGameId = {};
    let leagues = day.leagues;
    for(let league in leagues){
        league = leagues[league];
        let matches = league.matches;
        for(let match in matches){
            match = matches[match];
           if(timeStampToGameId[match.timeTS] == undefined){
                timeStampToGameId[match.timeTS] = [];
           }
           timeStampToGameId[match.timeTS].push(match.id);
        }
    }
    return timeStampToGameId;
}

// crate model for gamesData
function createModel(day){
    let matchDay = {};
     matchDay.matchDay = day.date;
     matchDay.leagues = [];
     let leagues = day.leagues;
     for(let league in leagues){
        league = leagues[league];
        let _league = {};
        _league.ccode = league.ccode;
        _league.id = league.id;
        _league.primaryId = league.primaryId;
        _league.name = league.name;
        _league.matches = []
        let matches = league.matches;
            for(let match in matches){
                match = matches[match];
                let _match = {};
                _match.id = match.id;
                _match.leagueId = match.leagueId;
                _match.time = match.time;
                _match.home = {};
                _match.home.id = match.home.id;
                _match.home.score = match.home.score;
                _match.home.name = match.home.name;
                _match.home.longName = match.home.longName;
                _match.away = {};
                _match.away.id = match.away.id;
                _match.away.score = match.away.score;
                _match.away.name = match.away.name;
                _match.away.longName = match.away.longName;
                _match.statusId = match.statusId;
                _match.tournamentStage = match.tournamentStage;
                _match.status = {};
                _match.status.started = match.status.started;
                _match.status.cancelled = match.status.cancelled;
                _match.status.finished = match.status.finished;
                _match.status.startTimeStr = match.status.startTimeStr;
                _match.status.startDateStr = match.status.startDateStr;
                _match.status.startDateStrShort = match.status.startDateStrShort;
                _match.timeTS = match.timeTS;
                _league.matches.push(_match);
            } 
            matchDay.leagues.push(_league); 
       } 
        //intialze model
        let gameModel = new gamesModel(matchDay);
        return gameModel;
}

// adds match day fixtures to db
async function pouplateDB(day){
    // create model
    const newModel = createModel(day);
    // write to DB
    await newModel.save();
    console.log("data-base populated with one day fixture."); 
}
        
// main function runns once a day
// delete yesterdays document
// populate db with fixtures after 10 days counting from today and delete document from yesterday
async function main(){
    const yesterday = getFormatedDate(-1);
    // find and delete yesterdays document
    await gamesModel.findOneAndDelete({matchDay: yesterday});
    console.log(" yesterday deleted.");
    // save document for games 10 days later
    const tenDaysLater = await fetchFixtures(10);
    pouplateDB(tenDaysLater);
    console.log("populated Db with fixtures from 10 days later.")
}

// updates todays fixtures every 1o mins
async function updateFixtures(){
    const newFixturesData = await fetchFixtures(0);
    const newDoc = createModel(newFixturesData);
    const today = getFormatedDate(0);
    const oldDoc = await gamesModel.findOne({matchDay: today});
    newDoc._id = oldDoc._id;
    await gamesModel.replaceOne({matchDay: today}, newDoc, { returnOriginal: false});
    console.log("updated today's fixtures.");
}

async function tenDaysPopulator(){
    connectDB();
    for (let i = 0; i <11; i++){
        const fixtures = await fetchFixtures(i);
        await pouplateDB(fixtures);
    }
    await mongoose.connection.close();
}

export async function updater(){
    let tenMinJob;
    const dailyJob = schedule.scheduleJob('* 6 * * *',async function(){
       if(tenMinJob) tenMinJob.cancel(); 
       await main();
       // shedule 10 mins fixture update
        tenMinJob = schedule.scheduleJob('*/10 * * * *', async function(){
        await updateFixtures();
       })
    })
}
