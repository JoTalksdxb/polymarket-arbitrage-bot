import { config } from "dotenv";

config();

export const POLYMARKET_PRIVATE_KEY = reteriveDotEnv("POLYMARKET_PRIVATE_KEY");
export const PROXY_WALLET_ADDRESS = reteriveDotEnv("PROXY_WALLET_ADDRESS");

export const RPC_URL = reteriveDotEnv("RPC_URL");

/** CLOB REST API base URL (production default). */
export const CLOB_HOST = optionalDotEnv("CLOB_HOST", "https://clob.polymarket.com");

/** Polygon mainnet = 137. Override only for custom RPC / test setups that match your keys. */
export const CHAIN_ID = parsePositiveInt("CHAIN_ID", 137);

/** Polymarket real-time WebSocket endpoint. */
export const RTDS_WS_URL = optionalDotEnv("RTDS_WS_URL", "wss://ws-live-data.polymarket.com");

/**
 * CLOB signature type: 0 = EOA, 1 = EIP-1271, 2 = Gnosis Safe / proxy (typical for Polymarket proxy wallets).
 */
export const SIGNATURE_TYPE = parseIntWithFallback("POLYMARKET_SIGNATURE_TYPE", 2);

function reteriveDotEnv(key: string): string {
  const env = process.env[key];
  if (!env) {
    throw new Error(`${key} is not set`);
  }
  return env;
}

function optionalDotEnv(key: string, defaultValue: string): string {
  const v = process.env[key];
  return v !== undefined && v.trim() !== "" ? v : defaultValue;
}

function parsePositiveInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseIntWithFallback(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}