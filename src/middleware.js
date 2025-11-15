import {
    Connection,
    Transaction,
    SystemProgram,
    PublicKey,
  } from "@solana/web3.js";
  import bs58 from "bs58";
  
  /**
   * Create MonoPay middleware for intercepting fetch() calls
   * and handling 402-based Solana payment flow.
   *
   * @param {MonoPayMiddlewareOptions} options
   * @returns {MonoPayFetch}
   */
  export function createMonoPayMiddleware(options = {}) {
    const {
      rpcUrl = "https://api.devnet.solana.com",
      onPaymentStart,
      onPaymentSuccess,
      onPaymentError,
    } = options;
  
    /**
     * Wrapped fetch() interceptor
     */
    return async function monoPayFetch(url, fetchOptions = {}) {
      try {
        // First request — without signature
        const initialResponse = await fetch(url, fetchOptions);
  
        // If not 402 → return original response
        if (initialResponse.status !== 402) {
          return initialResponse;
        }
  
        // Extract payment config
        const paymentConfig = await initialResponse.json();
  
        if (onPaymentStart) onPaymentStart();
  
        // Sign payment via Phantom
        const signature = await createAndSignTransaction(paymentConfig, rpcUrl);
  
        if (onPaymentSuccess) onPaymentSuccess(signature);
  
        // Retry request with signature
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            "x-tx-signature": signature,
          },
        });
  
        return retryResponse;
      } catch (err) {
        if (onPaymentError) onPaymentError(err);
        throw err;
      }
    };
  }
  
  /**
   * Creates & signs Solana transaction using Phantom wallet
   * @param {PaymentConfig} paymentConfig
   * @param {string} rpcUrl
   */
  async function createAndSignTransaction(paymentConfig, rpcUrl) {
    const phantom = window?.phantom?.solana;
  
    if (!phantom) {
      throw new Error(
        "Phantom wallet not found. Please install Phantom extension."
      );
    }
  
    // Ensure wallet is connected
    if (!phantom.isConnected) {
      await phantom.connect();
    }
  
    const fromPubkey = phantom.publicKey;
    const toPubkey = new PublicKey(paymentConfig.wallet);
  
    // Build transaction
    const connection = new Connection(rpcUrl);
    const { blockhash } = await connection.getLatestBlockhash();
  
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromPubkey,
    });
  
    tx.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: paymentConfig.priceLamports,
      })
    );
  
    // Ask Phantom to sign
    const signed = await phantom.signTransaction(tx);
  
    // Extract signature
    return bs58.encode(signed.signature);
  }
  
  /**
   * Initialize MonoPay globally.
   *
   * Typically used in Next.js RootLayout or React root.
   *
   * @param {MonoPayMiddlewareOptions} options
   * @returns {MonoPayFetch}
   */
  export function initMonoPay(options = {}) {
    if (typeof window === "undefined") {
      throw new Error("initMonoPay must be called in the browser.");
    }
  
    const monoPayFetch = createMonoPayMiddleware(options);
  
    return monoPayFetch;
  }
  