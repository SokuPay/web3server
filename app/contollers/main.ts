// --- Lib ---
import * as dotenv from 'dotenv'
import { Router } from 'express';
import axios from 'axios';
import BigNumber from 'bignumber.js';

// --- Solana Common ---
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import { getSolanaConnection } from '../modules/connections/solana';

// --- Solana Pay ---
import {
  encodeURL,
  findReference,
  FindReferenceError,
  validateTransfer,
} from '@solana/pay';

dotenv.config();
export const router = Router();

router.post("/", async (req, res, next) => {
  let paymentStatus: string;

  try {
    res.header('Content-Type', 'application/json; charset=utf-8');

    // ------------------------------------------------------
    //  Config for Solana
    // ------------------------------------------------------
    const connection = getSolanaConnection();

    if (!process.env.DOT_MERCHANT_KEY) throw new Error('Not found Wallet Key');
    const secretKey = new Uint8Array(JSON.parse(process.env.DOT_MERCHANT_KEY));
    const merchantKeypair = Keypair.fromSecretKey(secretKey);

    // ------------------------------------------------------
    //  Payment Variables
    // ------------------------------------------------------
    const recipient: PublicKey = merchantKeypair.publicKey;
    const amount: BigNumber = new BigNumber(0.001); // TODO: replace to req.body.amount
    const reference: PublicKey = new Keypair().publicKey;
    const label: string = 'Buy';
    const message: string = 'Thank you for buying NFT!';

    // ------------------------------------------------------
    //  Create Payment
    // ------------------------------------------------------
    console.log('--- Create Payment Link ---');

    const paymentUrl = encodeURL({
      recipient: recipient,
      amount: amount,
      reference: reference,
      label: label,
      message: message,
    });

    const paymentLink: string = paymentUrl.href;
    paymentStatus = 'pending';

    console.log('paymentLink =>', paymentLink);
    console.log('paymentStatus =>', paymentStatus);

    res.render(
      'main',
      {
        recipient: recipient,
        amount: amount,
        reference: reference,
        label: label,
        message: message,
        payment_link: paymentLink,
      }
    );

    // ------------------------------------------------------
    //  Find Transaction
    // ------------------------------------------------------
    console.log('--- Update Payment Status ---');

    let signatureInfo;

    const { signature }: any = await new Promise((resolve, reject) => {
      let i = 0;
      let limitCount = 10;

      const interval = setInterval(async () => {
        console.count('Checking for transaction...');
        try {
          signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
          console.log('Signature found: ', signatureInfo.signature);
          clearInterval(interval);
          resolve(signatureInfo);
        } catch (error: any) {
          if (!(error instanceof FindReferenceError)) {
            console.error(error);
            clearInterval(interval);
            reject(error);
          }
        }

        // QR Code is active but exit process. Avoid for too many request if
        // you using public RPC. If you need more request, use custom RPC(e.g. QuickNode).
        i++;
        if (i > limitCount) {
          console.log('QR payment time has expired. Restart again.');
          process.exit(0);
        }
      }, 10 * 1000); // msec
    });
    paymentStatus = 'confirmed';

    console.log('signature =>', signature);
    console.log('paymentStatus =>', paymentStatus);

    // ------------------------------------------------------
    //  Validate Transaction
    // ------------------------------------------------------
    console.log('--- Validate Transaction ---');

    try {
      await validateTransfer(
        connection,
        signature,
        {
          recipient: recipient,
          amount: new BigNumber(amount),
        }
      );

      paymentStatus = 'validated';
      console.log('paymentStatus =>', paymentStatus);
    } catch (error) {
      console.error('Payment failed', error);
    }
    

    if(paymentStatus == 'validated') {
      // ------------------------------------------------------
      //  Mint NFT
      // ------------------------------------------------------
      console.log('--- Mint NFT ---');

      const mintNftUrl = 'http://localhost:3010/mint_nft';

      const mintNftResponse = await axios.post(mintNftUrl, {
        'name': 'Kawaii Maid',
      });

      const tokenAddress = mintNftResponse.data.token_address;
      console.log('tokenAddress =>', tokenAddress.toString());

      // ------------------------------------------------------
      //  Send NFT
      // ------------------------------------------------------
      console.log('--- Send NFT ---');

      const sendTokenUrl = 'http://localhost:3010/send_token';
      
      const getTx = await connection.getTransaction(
        signature,
        { commitment: "confirmed" }
      );
      // accountKeys[1] is destination in Solana Pay transfer program
      const recipientToken = getTx?.transaction.message?.accountKeys[1];

      const sendTokenResponse = await axios.post(sendTokenUrl, {
        'recipient': recipientToken,
        'amount': '1',
        'token_address': tokenAddress,
        'label': '',
        'message': ''
      });

      const signatureSendToken = sendTokenResponse.data.signature;
      console.log('signatureSendToken =>', signatureSendToken);
      console.log('Done: payment and send NFT process.');

      process.exit(0);
    } else {
      console.log("Couldn't validate payment transaction.");
    }

    
  } catch (error) {
    next(error);
  }
});