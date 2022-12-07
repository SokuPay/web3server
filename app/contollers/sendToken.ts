// --- Lib ---
import * as dotenv from 'dotenv'
import { Router } from 'express';
import axios from 'axios';
import BigNumber from 'bignumber.js';

// --- Solana Common ---
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionBlockhashCtor,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getMint,
} from '@solana/spl-token';
import { getSolanaConnection } from '../modules/connections/solana';

// --- Solana Pay ---
import {
  encodeURL,
} from '@solana/pay';

dotenv.config();
export const router = Router();

router.post("/", async (req, res, next) => {
  try {
    res.header('Content-Type', 'application/json; charset=utf-8');

    // [Terminology]
    // Merchant = Payer = Sender
    // Customer = Recipient = Taker
    // 
    // ------------------------------------------------------
    //   Config for Solana
    // ------------------------------------------------------
    const connection = getSolanaConnection();

    if (!process.env.DOT_MERCHANT_KEY) throw new Error('Not found Wallet Key');
    const secretKey = new Uint8Array(JSON.parse(process.env.DOT_MERCHANT_KEY));
    const merchantKeypair = Keypair.fromSecretKey(secretKey);

    // ------------------------------------------------------
    //  Create Payment Link
    // ------------------------------------------------------
    const recipient: PublicKey = new PublicKey(req.body.recipient);
    // const recipient: PublicKey = Keypair.generate().publicKey; // Generate random wallet for test
    const amount: BigNumber = new BigNumber(req.body.amount);
    const splToken: PublicKey = new PublicKey(req.body.token_address)
    const reference: PublicKey = new Keypair().publicKey;
    const label: string = req.body.label;
    const message: string = req.body.message;

    const paymentUrl = encodeURL({
      recipient: recipient,
      amount: amount,
      splToken: splToken,
      reference: reference,
      label: label,
      message: message,
    });
    const paymentLink: string = paymentUrl.href;
    console.log('url.href =>', paymentLink);

    // --------------------------------------------------
    //  Init Transaction Instruction
    // --------------------------------------------------
    const latestBlockHash = await connection.getLatestBlockhash();
    const options: TransactionBlockhashCtor = {
      feePayer: merchantKeypair.publicKey,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    };
    let transaction = new Transaction(options);

    // --------------------------------------------------
    //  Get ATA
    // --------------------------------------------------
    if(!splToken) throw 'Not found Token Address';
    const senderTokenAccount = await getAssociatedTokenAddress(
      splToken,
      merchantKeypair.publicKey,
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      splToken,
      recipient,
    );

    // --------------------------------------------------
    //  Get ATA Info
    // --------------------------------------------------
    // getAccountInfo Method
    // Returns:
    //   data: get ATA details if exist ATA (it means created ATA before)
    //   Null: doesn't exist ATA (not created)
    const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount);
    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);

    // --------------------------------------------------
    //  Create ATA Instructions if doesn't exist
    // --------------------------------------------------
    if(!senderAccountInfo || !senderAccountInfo.data) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          merchantKeypair.publicKey, // payer
          senderTokenAccount, // associatedToken
          merchantKeypair.publicKey, // owner
          splToken, // mint
        )
      );
    }

    if(!recipientAccountInfo || !recipientAccountInfo.data) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          merchantKeypair.publicKey, // payer
          recipientTokenAccount, // associatedToken
          recipient, // owner
          splToken, // mint
        )
      );
    }

    // --------------------------------------------------
    //  Create Transfer Intstruction
    // --------------------------------------------------
    if(!amount) throw 'Undefined amount';
    const splTokenInfo = await getMint(connection, splToken);

    const transferInstruction = createTransferCheckedInstruction(
      senderTokenAccount, // source
      splToken, // mint (token address)
      recipientTokenAccount, // destination
      merchantKeypair.publicKey, // owner of source address
      amount.toNumber() * (10 ** (splTokenInfo).decimals),
      splTokenInfo.decimals, // decimals of the USDC token
    );

    if(!reference) throw 'Not found reference';
    transferInstruction.keys.push({
      pubkey: reference, // Type: PublicKey (not array). parseURL get PublicKey[] so it need to [0].
      isSigner: false,
      isWritable: false,
    });

    transaction.add(transferInstruction);

    // --------------------------------------------------
    //  Transfer
    // --------------------------------------------------
    const signature = await sendAndConfirmTransaction(connection, transaction, [merchantKeypair]);
    console.log('signature =>', signature);

    // ------------------------------------------------------
    //  Render Result
    // ------------------------------------------------------
    res.render(
      'sendToken',
      {
        payment_link: paymentLink,
        signature: signature,
      }
    );
  } catch (error) {
    next(error);
  }
});