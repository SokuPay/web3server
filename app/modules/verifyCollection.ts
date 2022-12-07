import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

export const verifyCollection = async (
  metaplex: Metaplex,
  mintAddress: PublicKey,
  collectionAddress: PublicKey,
): Promise<string> => {
  const tx = await metaplex
    .nfts()
    .verifyCollection({
      mintAddress: mintAddress,
      collectionMintAddress: collectionAddress,
    })

  return tx.response.signature;
};