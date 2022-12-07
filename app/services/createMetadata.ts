import * as fs from 'fs';

/* -------------------------------------------------
    Create Metadata using JSON file for NFT
------------------------------------------------- */
export const createMetadata = (
  inputMetadata: any,
): any => {
  // Read Base Metadata
  const metadataJson = fs.readFileSync('./app/assets/metadata.json', 'utf8');
  const metadata = JSON.parse(metadataJson);

  // Rewrite Input Metadata to Base Metadata
  metadata.name = inputMetadata.name;
  metadata.image = inputMetadata.image;
  metadata.attributes = inputMetadata.attributes;
  
  return metadata;
};