/**
 * Centralized frontend environment variables.
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";

export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ??
  "414385096657-2f2nn719isqc4aoj5ralqhpthd88u58u.apps.googleusercontent.com";

export const CONTRACT_ADDRESS_LOCAL =
  process.env.REACT_APP_CONTRACT_ADDRESS_LOCAL?.trim() ?? "";

export const CONTRACT_ADDRESS_AMOY =
  process.env.REACT_APP_CONTRACT_ADDRESS_AMOY?.trim() ?? "";
