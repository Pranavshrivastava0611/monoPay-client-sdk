/**
 * @monopay/client-sdk - Middleware TypeScript Definitions
 *
 * These types define:
 * - The payment payload returned from server (402 Payment Required)
 * - Client SDK middleware options
 * - The MonoPay wrapped fetch() type
 * - Exposed SDK functions
 */

/**
 * Payment configuration returned when server responds with 402
 */
export interface PaymentConfig {
    requiresPayment: boolean;       // always true for 402 flow
    serviceId: string;              // service identifier
    wallet: string;                 // payout wallet address
    priceLamports: number;          // amount owed (in lamports)
    message: string;                // optional message for user
  }
  
  /**
   * MonoPay middleware configuration options
   */
  export interface MonoPayMiddlewareOptions {
    /**
     * Solana RPC endpoint
     * @default "https://api.devnet.solana.com"
     */
    rpcUrl?: string;
  
    /**
     * Called when 402 Payment Required is detected
     */
    onPaymentStart?: () => void;
  
    /**
     * Called after Phantom signs successfully
     */
    onPaymentSuccess?: (signature: string) => void;
  
    /**
     * Called if Phantom rejects or any error happens
     */
    onPaymentError?: (error: Error) => void;
  }
  
  /**
   * MonoPay wrapped fetch()
   */
  export interface MonoPayFetch {
    (url: string, options?: RequestInit): Promise<Response>;
  }
  
  /**
   * Create a standalone middleware instance.
   *
   * Usage:
   *   const mpFetch = createMonoPayMiddleware({ ...options });
   *   const res = await mpFetch("/api/protected");
   */
  export function createMonoPayMiddleware(
    options?: MonoPayMiddlewareOptions
  ): MonoPayFetch;
  
  /**
   * Initialize MonoPay globally.
   *
   * Usage (Next.js / React):
   *   useEffect(() => {
   *     initMonoPay({ onPaymentSuccess: sig => console.log(sig) });
   *   }, []);
   *
   * Returns the wrapped fetch() function.
   */
  export function initMonoPay(options?: MonoPayMiddlewareOptions): MonoPayFetch;
  