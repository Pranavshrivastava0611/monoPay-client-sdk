/**
 * @monopay/client-sdk
 * 
 * Main Entry Point
 * 
 * This SDK provides:
 * - Global fetch interception
 * - Automatic 402 detection
 * - Phantom payment popup
 * - Solana transaction signing
 * - Automatic request retry with x-tx-signature
 * 
 * Exposed Methods:
 * - initMonoPay(options): Initializes the middleware
 * - createMonoPayMiddleware(options): Creates custom middleware instance
 */

export { createMonoPayMiddleware, initMonoPay } from "./middleware.js";
