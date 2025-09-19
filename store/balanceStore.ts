import { create } from 'zustand';

interface BalanceState {
  balance: number;
  setBalance: (amount: number) => void;
  increment: (amount: number) => void;
  decrement: (amount: number) => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: 1000,
  setBalance: (amount) => set({ balance: amount }),
  increment: (amount) => set((state) => ({ balance: state.balance + amount })),
  decrement: (amount) => set((state) => ({ balance: state.balance - amount })),
}));
