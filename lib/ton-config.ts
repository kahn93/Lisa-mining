// TON blockchain configuration
export const TON_RECEIVING_WALLET =
  process.env.TON_RECEIVING_WALLET || 'UQC9Vgi5erLMGVOHit2dQ5C1dww3XTV0OAvWOm3XhgVaVUI_';

export const TON_CENTER_API_URL = process.env.TON_CENTER_API_URL || 'https://toncenter.com/api/v2';

export const TON_CENTER_API_KEY =
  process.env.TON_CENTER_API_KEY ||
  '88c5d1b06d51f91dd4548ded80f45c402d190746965cce3c1bf2f4a8c579523a';

export const JETTON_MASTER_ADDRESS =
  process.env.JETTON_MASTER_ADDRESS || 'EQA4-TXXumNx_om3IlqSUaXVHrveaCm-sVpp3r7S0SnCfLB2';

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '7367415110:AAE_eLMMgvM9rERzsHlbYoxlm2apsiVsrHU';

export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'LisaToken_Bot';

export const TELEGRAM_BOT_URL = process.env.TELEGRAM_BOT_URL || 'https://t.me/LisaToken_Bot';

// TON Connect configuration
export const TON_CONNECT_MANIFEST_URL =
  process.env.NEXT_PUBLIC_TON_CONNECT_MANIFEST_URL ||
  'https://main.d2ibjv4d7heza0.amplifyapp.com/tonconnect-manifest.json';

export const TON_NETWORK = process.env.NEXT_PUBLIC_TON_NETWORK || 'mainnet';

// Helper function to format TON amounts
export const formatTON = (amount: number): string => {
  return `${amount.toFixed(2)} TON`;
};

// Helper function to validate TON address
export const isValidTONAddress = (address: string): boolean => {
  return /^[A-Za-z0-9_-]{48}$/.test(address);
};

// TON API endpoints
export const TON_API_ENDPOINTS = {
  balance: `${TON_CENTER_API_URL}/getAddressBalance`,
  transactions: `${TON_CENTER_API_URL}/getTransactions`,
  jettonBalance: `${TON_CENTER_API_URL}/runGetMethod`,
} as const;
