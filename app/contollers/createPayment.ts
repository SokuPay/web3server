// --- Lib ---
import * as dotenv from 'dotenv'
import { Router } from 'express';
import axios from 'axios';
import BigNumber from 'bignumber.js';

// --- Solana Common ---
import { Keypair, PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from '../modules/connections/solana';

// --- Solana Pay ---
import {
  encodeURL,
  validateTransfer,
} from '@solana/pay';

dotenv.config();
export const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.header('Content-Type', 'application/json; charset=utf-8');

    // ------------------------------------------------------
    //   Config for Solana
    // ------------------------------------------------------
    const connection = getSolanaConnection();

    if (!process.env.DOT_MERCHANT_KEY) throw new Error('Not found Wallet Key');
    const secretKey = new Uint8Array(JSON.parse(process.env.DOT_MERCHANT_KEY));
    const merchantKeypair = Keypair.fromSecretKey(secretKey);

    // ----------------------------------------------
    //  Create Payment Link
    // ----------------------------------------------
    const recipient: PublicKey = merchantKeypair.publicKey;
    const amount: BigNumber = new BigNumber(req.body.amount);
    const reference: PublicKey = new Keypair().publicKey;
    const label: string = 'Buy';
    const message: string = 'Thank you for buying NFT!';

    const paymentUrl = encodeURL({
      recipient: recipient,
      amount: amount,
      reference: reference,
      label: label,
      message: message,
    });
    const paymentLink: string = paymentUrl.href;
    
    // ------------------------------------------------------
    //  Render Result
    // ------------------------------------------------------
    res.render(
      'createPayment',
      {
        payment_link: paymentLink,
      }
    );
  } catch (error) {
    next(error);
  }
});