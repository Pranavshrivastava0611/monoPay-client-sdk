/**
 * @monopay/client-sdk - TypeScript Definitions
 *
 * This SDK provides:
 * - Automatic fetch interception
 * - 402 detection (Payment Required)
 * - Phantom wallet payment popup
 * - Solana transaction signing
 * - Automatic request retry with proof-of-payment
 *
 * Exports:
 * - initMonoPay: Initialize global middleware
 * - createMonoPayMiddleware: Create standalone middleware instance
 * - Types for middleware options and payment payload
 */

export { createMonoPayMiddleware, initMonoPay } from "./middleware";

// Export relevant types
export type {
  PaymentConfig,
  MonoPayMiddlewareOptions,
  MonoPayFetch,
} from "./middleware";
