import database from './database';

/**
 * Create a new wallet
 * userId (uid) required.
 */
function createWallet(req, res){
    let uid = req.body.uid, // User ID
        name = req.body.name || null, // Wallet name - optinal
        style = req.body.style || 'default'; // wallet style - optional

    if(!uid){
        return res.status(400).json({ status: false, code: 400, require: 'uid' });
    } else {
        new database.wallet({ uid, name, style }).save()
        .then(wallet=>{
            res.status(200).json({ status: true, code: 200, id: wallet._id });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Get all user's wallets
 * userId (uid) required.
 * walletId (id) is optinal.
 */
function getWallet(req, res){
    let uid = req.query.uid, // User ID
        id = req.query.id, // Wallet ID
        defaultWallet = req.query.default; // get default wallet

    if(!uid){
        return res.status(400).json({ status: false, code: 400, require: 'uid' });
    } else {
        let query = { uid };
        if(id) query['_id'] = id;
        if(defaultWallet && (defaultWallet == true || defaultWallet == 'true')) query['default'] = true;
        database.wallet.find(query).exec()
        .then(wallets=>{
            res.status(200).json({ status: true, code: 200, wallets })
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Update a wallet
 * walletId required!
 */
function editWallet(req, res){
    let id = req.body.id, // Wallet ID
        name = req.body.name, // Wallet name
        style = req.body.style, // Style of wallet
        show = req.body.show; // Visable wallet

    if(!id){
        return res.status(400).json({ status: false, code: 400, require: 'id' })
    } else {
        let object = {};
        if(name) object['name'] = name;
        if(style) object['style'] = style;
        if(show && typeof show == 'boolean') object['show'] = show;
        
        if(Object.keys(object).length == 0){
            return res.status(200).json({ status: true, code: 200 });
        } else {
            database.wallet.updateOne({ _id: id }, object).exec()
            .then(_=>{
                return res.status(200).json({ status: true, code: 200 });
            }).catch(_=>{
                res.status(500).json({ status: false, code: 500 });
            });
        }
    }
}

/**
 * Remove a wallet forever
 * walletId required!
 */
 function removeWallet(req, res){
     let id = req.body.id; // Wallet ID

     if(!id){
        return res.status(400).json({ status: false, code: 400, require: 'id' })
     } else {
         database.wallet.deleteOne({ _id: id }).exec()
        .then(_=>{
            return res.status(200).json({ status: true, code: 200 });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
     }
 }


/**
 * Make a wallet default
 * walletId and userId required!
 */
function defaultWallet(req, res){
    let uid = req.body.uid, // User ID
        id = req.body.id; // Wallet ID

    if(!uid){
        return res.status(400).json({ status: false, code: 400, require: 'uid' });
    }else if(!id){
        return res.status(400).json({ status: false, code: 400, require: 'id' })
     } else {
         database.wallet.updateOne({uid, default: true}, { default: false }).exec()
         .then(()=>{
             return database.wallet.updateOne({_id: id, uid}, { default: true }).exec();
         }).then(_=>{
            return res.status(200).json({ status: true, code: 200 });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
     }
}

/**
 * Use wallet inventory
 * walletId (wid) and amount required.
 * Description is optional.
 */
async function useWallet(req, res){
    let wid = req.body.wid, // Wallet ID
        amount = req.body.amount, // Amount of money
        description = req.body.description; 

    if(!wid){
        return res.status(400).json({ status: false, code: 400, require: 'wid' })
    } else if(!amount){
        return res.status(400).json({ status: false, code: 400, require: 'amount' });
    } else if(typeof amount != 'number'){
        return res.status(400).json({ status: false, code: 400, bad: 'amount', type: 'number' });
    } else {
        try {
            let wallet = await database.wallet.findById(wid).exec();
            if(wallet == null){
                return res.status(200).json({ status: false, code: 200, wallet: null });
            } else if(wallet['amount'] - amount < 0){
                return res.status(200).json({ status: false, code: 200, amount: wallet['amount'] - amount})
            } else {
                await database.wallet.updateOne({ _id: wid }, { amount: wallet['amount'] - amount }).exec();
                let transaction = await new database.transaction({
                    wallet: wid,
                    add: false,
                    amount: amount,
                    before: wallet['amount'],
                    description
                }).save();
                return res.status(200).json({ status: true, code: 200, id: transaction._id });
            }
        } catch (_) {
            return res.status(500).json({ status: false, code: 500 });
        }
    }
}

/**
 * Get All transactions
 * walletId (wid) is required.
 */
function getTransactions(req, res){
    let wid = req.body.wid; // Wallet ID
    if(!wid){
        return res.status(400).json({ status: false, code: 400, require: 'wid' })
    } else {
        database.transaction.find({ wallet: wid }).exec()
        .then(transactions=>{
            res.status(200).json({ status: true, code: 200, transactions });
        }).catch(_=>{
            res.status(500).json({ status: false, code: 500 });
        });
    }
}

/**
 * Add money to wallet
 * walletId (wid) and amount required.
 */
async function addToWallet(req, res){
    let wid = req.body.wid, // Wallet ID
        amount = req.body.amount; // Amount of money

    if(!wid){
        return res.status(400).json({ status: false, code: 400, require: 'wid' })
    } else if(!amount){
        return res.status(400).json({ status: false, code: 400, require: 'amount' });
    } else if(typeof amount != 'number'){
        return res.status(400).json({ status: false, code: 400, bad: 'amount', type: 'number' });
    } else {
        try {
            let wallet = await database.wallet.findById(wid).exec();
            if(wallet == null){
                return res.status(200).json({ status: false, code: 200, wallet: null });
            } else {
                await database.wallet.updateOne({ _id: wid }, { amount: wallet['amount'] + amount }).exec();
                let transaction = await new database.transaction({ 
                    wallet: wid,
                    add: true,
                    amount,
                    before: wallet['amount']
                }).save();
                return res.status(200).json({ status: true, code: 200, id: transaction._id });
            }
        } catch (error) {
            return res.status(500).json({ status: false, code: 500 });
        }
    }
}

export default { createWallet, getWallet, editWallet, removeWallet, defaultWallet, useWallet, getTransactions, addToWallet };