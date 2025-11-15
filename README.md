# @monopay/client-sdk

A lightweight JavaScript middleware for handling Solana payments on the frontend. Automatically detects payment requirements (402 status), creates transactions, and handles Phantom wallet signing.

## 🎯 What It Does

Converts this:
```
User Request → 402 Payment Required → User rejects/approves → Success/Error
```

Into this:
```javascript
const response = await monoPayFetch('/api/protected/data');
// That's it! Everything else is automatic
```

## ✨ Features

- ✅ **Automatic 402 Detection** - Intercepts payment required responses
- ✅ **Phantom Integration** - Seamless wallet signing
- ✅ **Transaction Creation** - Builds Solana transfers automatically
- ✅ **Signature Handling** - Encodes and sends signatures to server
- ✅ **React Hooks** - `useMonoPay()` for React apps
- ✅ **Error Handling** - Comprehensive error management
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Vanilla JS** - Works anywhere, no dependencies

## 📦 Installation

```bash
npm install @monopay/client-sdk @solana/web3.js
```

## 🚀 Quick Start

### Vanilla JavaScript

```html
<!-- Load Solana web3 library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/solana-web3.js/1.89.3/web3.min.js"></script>

<!-- Load MonoPay SDK -->
<script src="https://cdn.jsdelivr.net/npm/@monopay/client-sdk@latest/dist/index.js"></script>

<script>
  // Initialize
  const monoPayFetch = MonoPay.initMonoPay({
    rpcUrl: 'https://api.devnet.solana.com'
  });

  // Use like normal fetch
  async function getData() {
    const response = await monoPayFetch('/api/protected/data');
    const data = await response.json();
    console.log(data);
  }
</script>
```

### React

```jsx
import { useMonoPay } from '@monopay/client-sdk';

function App() {
  const { monoPayFetch, isLoading, error } = useMonoPay({
    rpcUrl: 'https://api.devnet.solana.com'
  });

  async function handleClick() {
    try {
      const response = await monoPayFetch('/api/protected/data');
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Data'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### React with Provider

```jsx
import { MonoPayProvider, useMonoPayContext } from '@monopay/client-sdk';

function App() {
  return (
    <MonoPayProvider options={{ rpcUrl: 'https://api.devnet.solana.com' }}>
      <MyComponent />
    </MonoPayProvider>
  );
}

function MyComponent() {
  const { monoPayFetch } = useMonoPayContext();

  async function getData() {
    const response = await monoPayFetch('/api/protected/data');
    return await response.json();
  }

  return <button onClick={getData}>Get Data</button>;
}
```

## 📖 API Reference

### `initMonoPay(options?)`

Initializes the MonoPay middleware.

```javascript
const monoPayFetch = initMonoPay({
  rpcUrl: 'https://api.devnet.solana.com',
  onPaymentStart: () => console.log('Payment started...'),
  onPaymentSuccess: (signature) => console.log('Signed:', signature),
  onPaymentError: (error) => console.error('Error:', error),
});
```

**Options:**
- `rpcUrl` (string, optional) - Solana RPC URL. Default: `https://api.devnet.solana.com`
- `onPaymentStart` (function, optional) - Called when payment process starts
- `onPaymentSuccess` (function, optional) - Called with signature when payment succeeds
- `onPaymentError` (function, optional) - Called with error if payment fails

**Returns:** `monoPayFetch` function

### `monoPayFetch(url, fetchOptions?)`

Fetch with automatic payment handling.

```javascript
const response = await monoPayFetch('/api/protected/data', {
  method: 'GET',
  headers: { 'Custom-Header': 'value' }
});
```

**Parameters:**
- `url` (string) - API endpoint URL
- `fetchOptions` (object, optional) - Standard fetch options

**Returns:** `Promise<Response>` - The final response after payment if needed

### `useMonoPay(options?)`

React hook for MonoPay.

```javascript
const { monoPayFetch, isLoading, error } = useMonoPay(options);
```

**Returns:**
- `monoPayFetch` - The fetch middleware function
- `isLoading` - Whether a fetch is in progress
- `error` - Error message if something failed

### `MonoPayProvider`

React provider component.

```jsx
<MonoPayProvider options={options}>
  {children}
</MonoPayProvider>
```

### `useMonoPayContext()`

Get MonoPay from context.

```javascript
const { monoPayFetch, isLoading, error } = useMonoPayContext();
```

## 🔄 How It Works

```
1. Your app calls: monoPayFetch('/api/data')
                    ↓
2. SDK makes request (no signature)
                    ↓
3. Server responds: 402 Payment Required
                    ↓
4. SDK extracts payment config
                    ↓
5. SDK creates Solana transaction
                    ↓
6. Phantom popup appears
                    ↓
7. User clicks "Approve"
                    ↓
8. SDK gets signature from Phantom
                    ↓
9. SDK retries request with signature header
                    ↓
10. Server verifies and returns data
                    ↓
11. Your app receives final response ✅
```

## 💳 Payment Flow

**Initial Request:**
```
GET /api/protected/data
Headers: {}
```

**Server Response:**
```json
HTTP 402
{
  "requiresPayment": true,
  "serviceId": "service_123",
  "wallet": "So11111111111111111111111111111111111111112",
  "priceLamports": 5000000,
  "message": "Payment required"
}
```

**Phantom Signs Transaction**
```
User sees: "Approve transaction?"
User clicks: "Approve"
```

**Retry with Signature:**
```
GET /api/protected/data
Headers: {
  "x-tx-signature": "4Z58PQrV24kiLvHkZjAqVsPwWWhzrhUqVJQxCqVrD4R9..."
}
```

**Server Accepts:**
```json
HTTP 200
{
  "data": "Protected content here!"
}
```

## ⚙️ Configuration

### Solana Mainnet
```javascript
const monoPayFetch = initMonoPay({
  rpcUrl: 'https://api.mainnet-beta.solana.com'
});
```

### Solana Devnet
```javascript
const monoPayFetch = initMonoPay({
  rpcUrl: 'https://api.devnet.solana.com'
});
```

### With Callbacks
```javascript
const monoPayFetch = initMonoPay({
  rpcUrl: 'https://api.devnet.solana.com',
  onPaymentStart: () => {
    console.log('💳 Requesting payment approval...');
    // Show loading indicator
  },
  onPaymentSuccess: (signature) => {
    console.log('✅ Payment successful!');
    console.log('Signature:', signature);
    // Hide loading indicator
  },
  onPaymentError: (error) => {
    console.error('❌ Payment failed:', error.message);
    // Show error message
  }
});
```

## 🔐 Prerequisites

1. **Phantom Wallet** - User must have Phantom installed and connected
2. **@solana/web3.js** - Must be loaded in the page (via CDN or import)
3. **Solana Account** - User must have SOL in their wallet for payment

## ❌ Error Handling

### Phantom Not Installed
```
Error: Phantom wallet not found. Please install Phantom browser extension.
```

### Wallet Not Connected
```
Error: Phantom wallet is not connected. Please connect your wallet.
```

### User Rejects Transaction
```
Error: User rejected the transaction in Phantom
```

### Invalid Payment
```
HTTP 403 - Payment signature verification failed
```

### Server Error
```
HTTP 500 - Internal Server Error
```

## 📝 Examples

### Get Protected Data

```javascript
const monoPayFetch = initMonoPay();

const response = await monoPayFetch('/api/protected/data');
if (response.ok) {
  const data = await response.json();
  console.log('Data:', data);
} else {
  console.error('Request failed:', response.status);
}
```

### POST with Payment

```javascript
const response = await monoPayFetch('/api/protected/action', {
  method: 'POST',
  body: JSON.stringify({ action: 'delete', id: 123 }),
});
```

### Download Protected File

```javascript
const response = await monoPayFetch('/api/protected/download');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
```

### React Loading State

```jsx
function DataComponent() {
  const { monoPayFetch, isLoading, error } = useMonoPay();

  const fetchData = async () => {
    const response = await monoPayFetch('/api/data');
    const data = await response.json();
    // Use data...
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? '⏳ Loading...' : '📥 Load Data'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## 📦 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

(Requires Phantom wallet to be installed)

## 🔗 Links

- [MonoPay Documentation](https://monopay.xyz)
- [Phantom Wallet](https://phantom.app)
- [Solana Documentation](https://docs.solana.com)

## 📄 License

MIT

## 🤝 Support

- GitHub Issues: [Report a bug](https://github.com/Pranavshrivastava0611/monoPay-client-sdk/issues)
- Email: support@monopay.xyz