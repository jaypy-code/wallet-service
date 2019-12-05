import mongoose from 'mongoose';

(async ()=>{
    try {        
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Connected successfully!");
    } catch (error) {
        console.log("MongoDB cannot connect.");
        process.exit();
    }
})();

const
    wallet = mongoose.model("wallet", new mongoose.Schema({
        uid: { type: String, required: true }, // user id: ObjectID, username, email, etc..
        name: { type: String, default: null }, // Name of user's wallet
        amount: { type: Number, default: 0 }, // How much money user has?
        style: { type: String, default: 'default' }, // Style of card - optional,
        default: { type: Boolean, default: false }, // Is this wallet default for user?
        show: { type: Boolean, default: true }, // Show this wallet to user
    }, {
        timestamps: true, // Enable created_at and updated_at; When wallet created and last wallet update
    })),
    transaction = mongoose.model("transaction", new mongoose.Schema({
        wallet: { type: mongoose.Types.ObjectId, required: true }, // Wallet's ObjectID
        add: { type: Boolean, required: true }, // Money added to wallet or used
        amount: { type: Number, required: true }, // Amount used or added to wallet
        before: { type: Number, default: 0 }, // Wallet inventory before this transaction
        description: { type: String, default: null }, // Some details about why user used their wallet
    }, {
        timestamps: true
    }));

export default { wallet, transaction };