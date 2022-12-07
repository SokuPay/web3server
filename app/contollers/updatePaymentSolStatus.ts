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
  findReference,
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

    // ------------------------------------------------------
    //  Check Signature
    // ------------------------------------------------------
    const reference: PublicKey = new PublicKey(req.body.reference);
    
    let paymentStatus: string;
    let signature: any;

    try {
      const signatureInfo = await findReference(
        connection,
        reference,
        { finality: 'confirmed' }
      );

      signature = signatureInfo.signature;
      paymentStatus = 'confirmed';
      console.log(paymentStatus);
    } catch (error: any) {
      console.error('Error:', error);
      process.exit(1);
    }

    // ------------------------------------------------------
    //  Check Validate
    // ------------------------------------------------------
    const recipient: PublicKey = new PublicKey(req.body.recipient);
    const amount = new BigNumber(req.body.amount);

    try {
      await validateTransfer(
        connection,
        signature,
        { recipient: recipient, amount }
      );

      paymentStatus = 'validated';
      console.log(paymentStatus);
    } catch (error) {
      res.json(error);
      process.exit(1);
    }

    // ------------------------------------------------------
    //  Render Result
    // ------------------------------------------------------
    res.render(
      'updatePaymentSolStatus',
      {
        signature: signature,
        payment_status: paymentStatus,
      }
    );
  } catch (error) {
    next(error);
  }
});