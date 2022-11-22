import mongoose from 'mongoose';

// populated in db using event emited fron the smart contract
const betsModel = new mongoose.Schema([{
    matchId: Number,
    Stake: Number,
    matched: Boolean,// true = can't accepte more matchers.
    homeTeam: String,
    awayTeam: String,
    selectedOutCome: String, // "0" home, "1" draw, "2" away ..... or "1" yes "2" no
    betProviderAddress: String,
    providedOdd: String,
    betType: Number,
    matchers: [ {
        matcherAddress: String,
        matcherStake: Number,
        winableAmount: Number
    }]
}]);

export default mongoose.model('betsModel',betsModel);