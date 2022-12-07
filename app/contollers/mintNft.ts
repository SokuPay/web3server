import * as dotenv from 'dotenv'
import { Router } from 'express';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { toBigNumber } from "@metaplex-foundation/js";
import { getSolanaConnection } from '../modules/connections/solana';
import { getMetaplexConnection } from '../modules/connections/metaplex';

dotenv.config();
export const router = Router();

router.post("/", async(req, res, next) => {
  try {
    res.header('Content-Type', 'application/json; charset=utf-8');

    // ------------------------------------------------------
    //   Config for Solana
    // ------------------------------------------------------
    const connection = getSolanaConnection();

    if(!process.env.DOT_MERCHANT_KEY) throw new Error('Not found Wallet Key');
    const secretKey = new Uint8Array(JSON.parse(process.env.DOT_MERCHANT_KEY));
    const merchantKeypair = Keypair.fromSecretKey(secretKey);

    // ------------------------------------------------------
    //   Config for Metaplex
    // ------------------------------------------------------
    const metaplex = getMetaplexConnection(connection, merchantKeypair)

    // ------------------------------------------------------
    //   Mint an NFT with URI
    // ------------------------------------------------------
    const name = req.body.name;

    const { nft } = await metaplex
      .nfts()
      .create({
        uri: 'https://arweave.net/flsMEEsaVxZJefZRWUQlK7AqciUmveT6T4LgK-WP3-0', // TODO: replace uri
        name: name,
        sellerFeeBasisPoints: 500, // Represents 5.00%.
        maxSupply: toBigNumber(1),
      })

    // ------------------------------------------------------
    //   Render Result
    // ------------------------------------------------------
    res.render(
      'mintNft',
      {
        token_address: nft.address,
      }
    );
  } catch (error) {
    next(error);
  }
});