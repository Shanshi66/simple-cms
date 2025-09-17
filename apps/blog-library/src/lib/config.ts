/**
 * Shared configuration loading utilities for blog-library scripts
 */

export interface Config {
  baseURL: string;
  apiKey: string;
}

/**
 * Load base URL from environment variables
 */
export function loadBaseURL(): string {
  const baseURL = process.env.CMS_BASE_URL;

  if (!baseURL) {
    throw new Error(
      `Missing CMS base URL. Please set CMS_BASE_URL in your .env file`,
    );
  }

  return baseURL;
}

/**
 * Load admin API key from environment variables
 */
export function loadAdminAPIKey(): string {
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey) {
    throw new Error(
      `Missing admin API key. Please set ADMIN_API_KEY in your .env file`,
    );
  }

  return apiKey;
}

/**
 * Load complete configuration from environment variables
 */
export function loadConfig(): Config {
  const baseURL = loadBaseURL();
  const apiKey = loadAdminAPIKey();

  return { baseURL, apiKey };
}
