import express from 'express';
import controller from './controller';
const router = express.Router();

router.route('/wallet')
    .get(controller.getWallet)
    .post(controller.createWallet)
    .put(controller.editWallet)
    .delete(controller.removeWallet);

router.post('/wallet/default', controller.defaultWallet);

router.get('/transaction', controller.getTransactions);
router.post('/transaction/use', controller.useWallet);
router.post('/transaction/add', controller.addToWallet);

export default router;