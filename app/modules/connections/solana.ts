import * as dotenv from 'dotenv'
import {
  Connection,
} from '@solana/web3.js';

dotenv.config();

export const getSolanaConnection = (): Connection => {
  if(!process.env.DOT_RPC_SOLANA) throw new Error('Not found RPC of Solana');
  const connection = new Connection(process.env.DOT_RPC_SOLANA, 'confirmed');
  
  return connection;
}