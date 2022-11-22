import mongoose from "mongoose";

const gamesModel = new mongoose.Schema({
        matchDay: String,
        leagues: [{
            ccode: String,
            id: Number,
            primaryId: Number,
            name: String,
            matches: [
                {
                    id: Number,
                    leagueId: Number,
                    time: String,
                    home: {
                        id: Number,
                        score: Number,
                        name: String,
                        longName: String
                    },
                    away: {
                        id: Number,
                        score: String,
                        name: String,
                        longName: String
                    },
                    statusId: Number,// game staus 
                    tournamentStage: String,// string number 
                    status: {
                        started: Boolean,
                        cancelled: Boolean,
                        finished: Boolean,
                        startTimeStr: String,
                        startDateStr: String,// ex-"Today" ....
                        startDateStrShort: String // ex-"Today"
                    },
                    timeTS: Number,
                }
            ],
    }]
});

export default mongoose.model('gamesModel',gamesModel)