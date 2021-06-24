# BitSpider REST API

**Note that BitSpider API is currently in BETA phase and may not be available to all users!**

Official Node.js library for accessing [BitSpider REST API](https://bitspider.com/developers).

## Getting Started

Log in to [BitSpider](https://bitspider.com/login) to get the API key and the API secret.

Install required dependencies
```bash
npm install
```

Test API key and secret by making a user info request
```js
const { BitSpider } = require('bitspider');

let bitspider = new BitSpider({
  apiKey: "your_api_key_goes_here",
  apiSecret: "your_api_secret_goes_here",
});

bitspider
.getUserInfo()
.then(user => console.log(user))
.catch(err => console.error(err));
```

### Using Promise

Example using async-await approach
```js
const { BitSpider } = require('bitspider');

(async () => {
  //Create a new instance
  let bitspider = new BitSpider({
    apiKey: "your_api_key_goes_here",
    apiSecret: "your_api_secret_goes_here",
  });

  //Estimate the exchange amount from Euro to Bitcoin
  let estimated = await bitspider.estimatePrice({
    requestedCurrency: "EUR",
    requestedAmount: 120.0,
    intermediateCurrency: "BTC"
  });
  console.log(estimated);

  //Create a new payment request with Bitcoin as intermediate currency
  let created = await bitspider.createPaymentRequest({
    requestedCurrency: "EUR",
    requestedAmount: 120.0,
    intermediateCurrency: "BTC"
  });
  console.log(created);

  //Verify the payment request status
  let result = await bitspider.getPaymentRequestById(created.id);
  console.log(result);
})();
```

## List of methods

The following methods correspond to API calls.

### Payment request

| Method and arguments | Corresponds to | Description |
|----------------------|----------------|-------------|
| getPaymentRequests(query) | GET /merchant/payment | List payment requests |
| getPaymentRequestById(id) | GET /merchant/payment/:id | Get payment request by id |
| createPaymentRequest(data) | POST /merchant/payment | Create payment request |
| cancelPaymentRequest(id) | DELETE /merchant/payment/:id | Delete payment request |

### Withdrawal request

| Method and arguments | Corresponds to | Description |
|----------------------|----------------|-------------|
| getWithdrawalRequests(query) | GET /merchant/withdrawal | List withdrawal requests |
| getWithdrawalRequestById(id) | GET /merchant/withdrawal/:id | Get withdrawal request by id |
| createWithdrawalRequest(data) | POST /merchant/withdrawal | Create withdrawal request |
| cancelWithdrawalRequest(id) | DELETE /merchant/withdrawal/:id | Delete withdrawal request |

### Miscellaneous

| Method and arguments | Corresponds to | Description |
|----------------------|----------------|-------------|
| estimatePrice(data) | POST /merchant/estimate | Estimate price in cryptocurrency |
| getBalance() | GET /merchant/balance | Get user's balance |
| getUserInfo() | GET /user/me | Get user info |

Please refer to unit tests for more info.

## Unit Test

First set `API_KEY` and `API_SECRET` as environment variables, then run
```bash
npm run test
```

On Unix system
```bash
#!/bin/bash
VERBOSE=0
API_KEY=your_api_key_goes_here
API_SECRET=your_api_secret_goes_here
npm run test
```

On Windows system
```bat
@echo off
setlocal
set VERBOSE=0
set API_KEY=your_api_key_goes_here
set API_SECRET=your_api_secret_goes_here
npm run test
endlocal
```