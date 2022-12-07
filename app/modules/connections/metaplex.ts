import * as dotenv from 'dotenv'
import {
  Connection,
  Keypair,
} from '@solana/web3.js';
import { 
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

dotenv.config();

export const getMetaplexConnection = (
  connection: Connection,
  payer: Keypair,
): any => {
  if(!process.env.DOT_RPC_SOLANA) throw new Error('Not found RPC of Solana');
  if(!process.env.DOT_RPC_METAPLEX) throw new Error('Not found RPC of Metaplex');

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(bundlrStorage({
        address: process.env.DOT_RPC_METAPLEX,
        providerUrl: process.env.DOT_RPC_SOLANA,
        timeout: 60000,
    }));
    // [Mock]
    // .use(mockStorage()); // Use this instead of bundlrStorage if you need mock(dummy url).

  return metaplex;
};