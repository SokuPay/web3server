## Setup
### RPC
Rewrite [QuickNode RPC URL](https://www.quicknode.com/) for Devnet to `DOT_RPC_SOLANA` in .env.dev file.  
e.g.  
```
DOT_RPC_SOLANA=https://twilight-methodical-gas.solana-devnet.discover.quiknode.pro/<KEY>/
```

### NPM
```
% mv package.json.example package.json
% npm i
```

## Run
### 1. Terminal
```
% npm run dev
```

### 2. Browser
1. Run [main request](https://sokupay.postman.co/workspace/9198efd6-310b-4236-8370-38d11eb675f0/collection/24765757-db79a27e-adf1-462d-9efc-88f6444dc18b?action=share&creator=24765757) at Postman

2. get Payment Link from terminal log: e.g.  
```
solana:HXtBm8XZbxaTt41uqaKhwUAa6Z1aPyvJdsZVENiWsetg?amount=0.001&reference=HYx8byhQvHGhu88MMxiW6fB6jqZYgKZxngWuHGthG6Re&label=Buy&message=Thank+you+for+buying+NFT%21
```

3. [Generate QR code](https://www.the-qrcode-generator.com/) using above Payment Link  
![QR Code Sample](https://github.com/SokuPay/web3server/blob/main/docs/qrcode_sample.png?raw=true)

### 3. Smartphone
Scan above QR Code using Phantom.
