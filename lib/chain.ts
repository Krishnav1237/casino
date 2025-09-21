export type ChainConfig = {
  chainIdHex: string; // e.g. '0xa86a' (43114) or '0xa869' (43113)
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

const DEFAULTS = {
  // Default to Fuji for safety in development
  chainIdHex: '0xa869', // 43113
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorer: 'https://testnet.snowtrace.io',
};

export function getTargetChain(): ChainConfig {
  const chainIdHex = process.env.NEXT_PUBLIC_CHAIN_ID_HEX || DEFAULTS.chainIdHex;
  const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || DEFAULTS.chainName;
  const symbol = process.env.NEXT_PUBLIC_NATIVE_SYMBOL || DEFAULTS.nativeCurrency.symbol;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || DEFAULTS.rpcUrl;
  const explorer = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || DEFAULTS.explorer;

  return {
    chainIdHex,
    chainName,
    nativeCurrency: { name: 'Avalanche', symbol, decimals: 18 },
    rpcUrls: [rpcUrl],
    blockExplorerUrls: [explorer],
  };
}

