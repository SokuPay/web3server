import * as dotenv from 'dotenv'
import {
  Connection,
} from '@solana/web3.js';

dotenv.config();

export const getSolanaConnection = (): Connection => {
  if(!process.env.DOT_RPC_SOLANA) throw new Error('Not found RPC of Solana');
  // const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const connection = new Connection(process.env.DOT_RPC_SOLANA, 'confirmed');
  
  return connection;
}