import { Metaplex, toBigNumber } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

export const mintNftWithUri = async (
  metaplex: Metaplex,
  name: string,
  uri: string,
  collectionAddress: PublicKey,
): Promise<PublicKey> => {
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: uri,
      name: name,
      sellerFeeBasisPoints: 500, // Represents 5.00%.
      maxSupply: toBigNumber(1),
      collection: collectionAddress,
    })

  return nft.address;
};