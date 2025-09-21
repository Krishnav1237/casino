import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || ["*"] }));

// -------------------- Setup --------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

// Resolve path relative to this file (ESM-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = (...segments) => path.join(__dirname, "abi", ...segments);

// Load ABIs
const forwarderAbi = JSON.parse(fs.readFileSync(abiPath("Forwarder.json"), "utf-8"));
const slotsAbi = JSON.parse(fs.readFileSync(abiPath("SlotMachineGasless.json"), "utf-8"));
const minesAbi = JSON.parse(fs.readFileSync(abiPath("MinesGasless.json"), "utf-8"));
const blackjackAbi = JSON.parse(fs.readFileSync(abiPath("BlackjackGasless.json"), "utf-8"));
const crashAbi = JSON.parse(fs.readFileSync(abiPath("CrashGasless.json"), "utf-8"));

// Contracts
const forwarder = new ethers.Contract(process.env.FORWARDER_ADDRESS, forwarderAbi, relayerWallet);

// -------------------- Helpers --------------------
async function forwardTx(target, user, data, value = "0") {
  const tx = await forwarder.forwardCall(target, user, data, {
    value,
    gasLimit: 800000,
  });
  const receipt = await tx.wait();
  return receipt;
}

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, chainId: provider?._network?.chainId ?? null });
});

// -------------------- Routes --------------------

// 🎰 Slots
app.post("/api/spin-slots", async (req, res) => {
  try {
    const { userAddress, betEth, betNative } = req.body;
    const betIn = betNative ?? betEth;
    if (!userAddress || betIn == null) return res.status(400).json({ error: "userAddress and bet amount required" });

    const slotsBetWei = ethers.parseEther(String(betIn));
    const slotsGame = new ethers.Contract(process.env.SLOTS_ADDRESS, slotsAbi, relayerWallet);
    const slotsData = slotsGame.interface.encodeFunctionData("spin", []);

    const receipt = await forwardTx(process.env.SLOTS_ADDRESS, userAddress, slotsData, slotsBetWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💣 Mines
app.post("/api/play-mines", async (req, res) => {
  try {
    const { userAddress, betEth, betNative, minesPicked } = req.body;
    const betIn = betNative ?? betEth;
    if (!userAddress || betIn == null || typeof minesPicked === "undefined") {
      return res.status(400).json({ error: "userAddress, bet and minesPicked required" });
    }

    const minesBetWei = ethers.parseEther(String(betIn));
    const minesGame = new ethers.Contract(process.env.MINES_ADDRESS, minesAbi, relayerWallet);
    const minesData = minesGame.interface.encodeFunctionData("play", [minesPicked]);

    const receipt = await forwardTx(process.env.MINES_ADDRESS, userAddress, minesData, minesBetWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🃏 Blackjack
app.post("/api/play-blackjack", async (req, res) => {
  try {
    const { userAddress, betEth, betNative, action } = req.body;
    const betIn = betNative ?? betEth;
    if (!userAddress || betIn == null || !action) return res.status(400).json({ error: "userAddress, bet and action required" });

    const bjBetWei = ethers.parseEther(String(betIn));
    const bjGame = new ethers.Contract(process.env.BLACKJACK_ADDRESS, blackjackAbi, relayerWallet);
    const bjData = bjGame.interface.encodeFunctionData("play", [action]);

    const receipt = await forwardTx(process.env.BLACKJACK_ADDRESS, userAddress, bjData, bjBetWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📈 Crash
app.post("/api/play-crash", async (req, res) => {
  try {
    const { userAddress, betEth, betNative, multiplier } = req.body;
    const betIn = betNative ?? betEth;
    if (!userAddress || betIn == null) return res.status(400).json({ error: "userAddress and bet required" });

    const crashBetWei = ethers.parseEther(String(betIn));
    const crashGame = new ethers.Contract(process.env.CRASH_ADDRESS, crashAbi, relayerWallet);
    const crashData = crashGame.interface.encodeFunctionData("play", [multiplier ?? 0]);

    const receipt = await forwardTx(process.env.CRASH_ADDRESS, userAddress, crashData, crashBetWei);
    res.json({ txHash: receipt.transactionHash, events: receipt.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () =>
  console.log(`Casino backend running on port ${PORT}`)
);
