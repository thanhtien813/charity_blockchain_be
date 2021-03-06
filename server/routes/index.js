const express = require('express');
const { MessageTypeEnum } = require('../../utils/constants');
const { broadcast, broadcastToUI } = require('../../utils/p2pUtils');
const router = express.Router();
const controller = require('../controllers/controller');
const { pool, accountMap } = require('../data');
const { authenticateWallet, authenticateEvent } = require('../middlewares/authenticate');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Charity Block BE' });
});

// get blocks
router.get('/blocks', (req, res, next) => {
  controller.getBlocks(req, res, next);
});

// get block by index
// [query] index
router.get('/blocks/:index', (req, res, next) => {
  controller.getBlockByIndex(req, res, next);
});

router.get('/pool', (req, res, next) => {
  return res.status(200).json({
    message: 'OK',
    payload: {
      pool: pool
    }
  })
})

router.get('/testUISocket', (req, res, next) => {
  broadcastToUI({
    type: MessageTypeEnum.TEST
  })

  return res.status(200).json({
    message: 'OK'
  })
})

router.get('/user', (req, res, next) => {
  return res.status(200).json({
    message: 'OK',
    payload: {
      count: accountMap.size
    }
  })
})

// create-wallet
// [body] name: name of creator
router.post('/wallet', (req, res, next) => {
  console.log("Create wallet")
  controller.createWallet(req, res, next);
});

// access wallet
// [headers] authorization: privateKey
router.post('/wallet-access', authenticateWallet, (req, res, next) => {
  controller.accessWallet(req, res, next);
});

// get wallet information
// [headers] authorization: privateKey
router.get('/wallet', authenticateWallet, (req, res, next) => {
  controller.getWalletInfo(req, res, next);
});

// add money to wallet
// [headers] authorization: privateKey of wallet
// [body] amount
router.post('/wallet/add', authenticateWallet, (req, res, next) => {
  controller.addAmountToWallet(req, res, next);
});

// create transaction
// [headers] authorization: privateKey
// [body] {
//    receiptAddress: address of receipt
//    amount: amount
// }
router.post('/transaction', authenticateWallet, (req, res, next) => {
  controller.createTransaction(req, res, next);
});

// get transactions in pool
router.get('/transaction', (req, res, next) => {
  controller.getTransactionInPool(req, res, next);
});

// get my transactions
// [headers] authorization: privateKey
router.get('/transaction/mine', authenticateWallet, (req, res, next) => {
  controller.getTransactionsByPrivateKey(req, res, next);
});

// get transaction by id
// [query] id: id of transaction
router.get('/transaction/id', (req, res, next) => {
  controller.getTransactionById(req, res, next);
});

// get history
router.get('/history', (req, res, next) => {
  controller.getHistory(req, res, next);
});

// create event
// [headers] authorization: privateKey of creator
// [body] {
//    name: nameEvent,
//    description: desc of event
//    startDate,
//    endDate
// }
router.post('/event', authenticateWallet, (req, res, next) => {
  controller.createEvent(req, res, next);
});

// get events by private key of creator
// [headers] authorization: privateKey of creator
router.get('/event/mine', authenticateWallet, (req, res, next) => {
  controller.getEventsByPrivateKey(req, res, next);
});

// get all events
router.get('/event', (req, res, next) => {
  controller.getAllEvents(req, res, next);
});

// accept an event
// [headers] authorization: privateKey of creator
router.post('/event/accept', authenticateWallet, (req, res, next) => {
  controller.acceptEvent(req, res, next);
});

// get event donate history
// [query] address: address of event(project)
router.get('/event/donate', (req, res, next) => {
  controller.getEventDonateHistory(req, res, next);
});

// get all event donate history
// [query]: none
router.get('/donations', (req, res, next) => {
  controller.getAllEventDonateHistory(req, res, next);
});

// get event disbursement history
// [query] address: address of event(project)
router.get('/event/disbursement', (req, res, next) => {
  controller.getEventDisbursementHistory(req, res, next);
});

// disbursement
// [headers] authorization: privateKey of event(project)
// [body] amount
router.post('/event/disbursement', authenticateEvent, (req, res, next) => {
  controller.disbursement(req, res, next);
});

// end event(project)
// [headers] authorization: privateKey of event(project)
router.post('/event/end', authenticateEvent, (req, res, next) => {
  controller.forceEndEvent(req, res, next);
});

// check accepted
// [headers] authorization: privateKey of wallet
// [query] address: publicKey of event(project)
router.post('/event/checkAccept', authenticateWallet, (req, res, next) => {
  console.log("Here")
  controller.checkAccepted(req, res, next);
});

// get event(project) by address key
// [query] address: publicKey of event(project)
router.get('/event/detail', (req, res, next) => {
  controller.getEventByAddress(req, res, next);
});

router.post('/dispatch', (req, res, next) => {
  broadcast({
    type: MessageTypeEnum.TEST
  })
  res.status(200).json({
    message: 'OK'
  })
})


//------------------------------------------------------------
//P2P
//------------------------------------------------------------

router.get('/peers', (req, res, next) => {
  controller.getPeers(req, res, next);
});

router.get('/senderSockets', (req, res, next) => {
  controller.getSenderSockets(req, res, next);      
});

router.post('/addPeer', (req, res, next) => {
  controller.addPeers(req, res, next);
});

module.exports = router;
