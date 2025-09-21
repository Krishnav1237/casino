"use client";

import { create } from "zustand";
import { getTargetChain } from "@/lib/chain";

interface WalletState {
  address: string | null;
  chainId: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setAddress: (addr: string | null) => void;
  setChainId: (id: string | null) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  chainId: null,
  connecting: false,
  error: null,
  setAddress: (addr) => set({ address: addr }),
  setChainId: (id) => set({ chainId: id }),
  disconnect: () => set({ address: null, chainId: null, error: null, connecting: false }),
  connect: async () => {
    if (get().connecting) return;
    set({ connecting: true, error: null });
    try {
      const eth = (globalThis as any).ethereum;
      if (!eth) throw new Error("No Ethereum provider found. Install MetaMask.");

      // Ensure Avalanche chain
      const target = getTargetChain();
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target.chainIdHex }] });
      } catch (switchErr: any) {
        if (switchErr?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: target.chainIdHex,
              chainName: target.chainName,
              nativeCurrency: target.nativeCurrency,
              rpcUrls: target.rpcUrls,
              blockExplorerUrls: target.blockExplorerUrls,
            }],
          });
          await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target.chainIdHex }] });
        } else {
          throw switchErr;
        }
      }

      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const chainId: string = await eth.request({ method: "eth_chainId" });
      set({ address: accounts?.[0] ?? null, chainId });

      // Listeners
      eth.removeListener?.("accountsChanged", () => {});
      eth.on?.("accountsChanged", (accs: string[]) => set({ address: accs?.[0] ?? null }));
      eth.removeListener?.("chainChanged", () => {});
      eth.on?.("chainChanged", (id: string) => set({ chainId: id }));
    } catch (e: any) {
      set({ error: e?.message ?? String(e) });
    } finally {
      set({ connecting: false });
    }
  },
}));

export const truncateAddress = (addr?: string | null, size = 4) => {
  if (!addr) return "";
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
};
