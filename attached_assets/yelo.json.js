const express = require('express');
const AfricasTalking = require('africastalking');
const { Web3 } = require('web3');
const app = express();
app.use(express.json());

// Celo Configuration
const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
const contractABI = require('./YeloLinkABI.json'); // Renamed ABI
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const yeloLink = new web3.eth.Contract(contractABI, contractAddress); // Renamed contract instance

// Africa's Talking SMS Setup
const atClient = AfricasTalking({
  apiKey: 'YOUR_API_KEY',
  username: 'YOUR_USERNAME'
});

// Mock MoMo Escrow DB
let escrowDB = new Map();

// --- API Endpoints ---
app.post('/ride/request', async (req, res) => {
  const { riderAddress, pickup, momoTxId, fare } = req.body;
  
  escrowDB.set(momoTxId, { status: 'pending', fare });

  const tx = yeloLink.methods.requestRide(pickup, momoTxId, fare);
  const receipt = await tx.send({ from: riderAddress });
  
  await atClient.SMS.send({
    to: '+233XXXXXXXXX',
    message: `YeloLink: Ride requested! TX ID: ${momoTxId}`
  });

  res.json({ txHash: receipt.transactionHash });
});

app.post('/ride/assign', async (req, res) => {
  const { riderAddress, driverAddress } = req.body;
  
  const isNearby = await checkDriverProximity(driverAddress, riderAddress);

  if (isNearby) {
    const tx = yeloLink.methods.assignDriver(riderAddress, driverAddress);
    await tx.send({ from: process.env.OPERATOR_WALLET });
    
    await atClient.SMS.send({
      to: '+233XXXXXXXXX',
      message: `YeloLink: New ride to ${riderAddress}!`
    });
  }

  res.json({ assigned: isNearby });
});

// --- Helpers ---
async function checkDriverProximity(driverAddr, riderAddr) {
  return true; // Mocked
}

app.listen(3000, () => console.log('YeloLink backend running on port 3000'));