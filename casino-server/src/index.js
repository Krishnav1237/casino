import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json());

// -------------------- Setup --------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

// Load ABIs
const forwarderAbi = JSON.parse(fs.readFileSync("./abi/Forwarder.json"));
const slotsAbi = JSON.parse(fs.readFileSync("./abi/SlotMachineGasless.json"));
const minesAbi = JSON.parse(fs.readFileSync("./abi/MinesGasless.json"));
const blackjackAbi = JSON.parse(fs.readFileSync("./abi/BlackjackGasless.json"));
const crashAbi = JSON.parse(fs.readFileSync("./abi/CrashGasless.json"));

// Contracts
const forwarder = new ethers.Contract(process.env.FORWARDER_ADDRESS, forwarderAbi, relayerWallet);

// -------------------- Helpers --------------------
async function forwardTx(target, user, data, value = "0") {
  const tx = await forwarder.forwardCall(target, user, data, {
    value,
    gasLimit: 800000
  });
  const receipt = await tx.wait();
  return receipt;
}

// -------------------- Routes --------------------

// 🎰 Slots
app.post("/api/spin-slots", async (req, res) => {
  try {
    const { userAddress, betEth } = req.body;
    const betWei = ethers.parseEther(betEth);

    const game = new ethers.Contract(process.env.SLOTS_ADDRESS, slotsAbi, relayerWallet);
    const data = game.interface.encodeFunctionData("spin", []); // assuming spin() takes no args

    const receipt = await forwardTx(process.env.SLOTS_ADDRESS, userAddress, data, betWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💣 Mines
app.post("/api/play-mines", async (req, res) => {
  try {
    const { userAddress, betEth, minesPicked } = req.body;
    const betWei = ethers.parseEther(betEth);

    const game = new ethers.Contract(process.env.MINES_ADDRESS, minesAbi, relayerWallet);
    const data = game.interface.encodeFunctionData("play", [minesPicked]);

    const receipt = await forwardTx(process.env.MINES_ADDRESS, userAddress, data, betWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🃏 Blackjack
app.post("/api/play-blackjack", async (req, res) => {
  try {
    const { userAddress, betEth, action } = req.body;
    const betWei = ethers.parseEther(betEth);

    const game = new ethers.Contract(process.env.BLACKJACK_ADDRESS, blackjackAbi, relayerWallet);
    const data = game.interface.encodeFunctionData("play", [action]); // e.g. "hit", "stand"

    const receipt = await forwardTx(process.env.BLACKJACK_ADDRESS, userAddress, data, betWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📈 Crash
app.post("/api/play-crash", async (req, res) => {
  try {
    const { userAddress, betEth, multiplier } = req.body;
    const betWei = ethers.parseEther(betEth);

    const game = new ethers.Contract(process.env.CRASH_ADDRESS, crashAbi, relayerWallet);
    const data = game.interface.encodeFunctionData("play", [multiplier]);

    const receipt = await forwardTx(process.env.CRASH_ADDRESS, userAddress, data, betWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Casino backend running on port ${process.env.PORT}`)
);