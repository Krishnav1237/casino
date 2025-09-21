"use client";


import { Wallet } from "lucide-react";
import { useWalletStore, truncateAddress } from "../store/walletStore";

export default function ConnectWalletButton({ className = "" }: { className?: string }) {
  const { address, connecting, connect } = useWalletStore();
  return (
    <button
      onClick={connect}
      disabled={connecting}
      className={`bg-[var(--accent)] hover:bg-[var(--secondary)] px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition disabled:opacity-60 ${className}`}
      aria-busy={connecting}
    >
      <Wallet size={18} />
      {address ? truncateAddress(address) : connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
