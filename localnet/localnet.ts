import { LOCALHOST } from '@metaplex-foundation/amman';
import {
  Amman,
  ammanMockStorage,
  AmmanMockStorageDriver,
} from '@metaplex-foundation/amman-client';
import { Connection } from '@solana/web3.js';
import path from 'path';
import * as fs from 'fs';
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
} from '@metaplex-foundation/js';

const createNft = async (
  connection: Connection,
  amman: Amman,
  nftJson: Object,
  txLabel?: String,
) => {};

const main = async () => {
  const connection = new Connection(LOCALHOST);
  const amman = Amman.instance({
    log: console.log,
  });

  const [collectionOwnerPubkey, collectionOwnerKeypair] =
    await amman.loadOrGenKeypair('collection_owner');
  const [userPubkey, userKeypair] = await amman.loadOrGenKeypair('user1');
  const [collectionNftPubkey, collectionNftKeypair] =
    await amman.loadOrGenKeypair('test_collection');

  await amman.airdrop(connection, collectionOwnerPubkey, 100);
  await amman.airdrop(connection, userPubkey, 2);

  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(collectionOwnerKeypair));
  metaplex.use(ammanMockStorage('amman-mock-storage'));
  const storageDriver = metaplex.storage().driver();

  const collectionNftDir = path.resolve(
    __dirname,
    'data',
    'example_collection_nft',
  );
  const collectionNftImagePath = path.resolve(collectionNftDir, '0.png');
  const collectionNftJsonPath = path.resolve(collectionNftDir, '0.json');
  const collectionNftImageData = fs.readFileSync(collectionNftImagePath);
  const collectionNftMetadataData = fs.readFileSync(collectionNftJsonPath);

  const collectionNftImageMetaplexFile = toMetaplexFile(
    collectionNftImageData,
    'collection-nft.png',
  );
  const collectionNftMetadataMetaplexFile = toMetaplexFile(
    collectionNftMetadataData,
    'collection-nft.json',
  );

  const [collectionNftImageUri, collectionNftMetadataUri] =
    await storageDriver.uploadAll([
      collectionNftImageMetaplexFile,
      collectionNftMetadataMetaplexFile,
    ]);

  console.log('Upload Results:');
  console.log('nftImageUri:', collectionNftImageUri);
  console.log('nftMetadataUri:', collectionNftMetadataUri);

  const { nft } = await metaplex
    .nfts()
    .create({
      uri: collectionNftMetadataUri,
      name: 'Example Collection NFT',
      symbol: 'ECNFT',
      sellerFeeBasisPoints: 0,
      updateAuthority: collectionOwnerKeypair,
    })
    .run();

  console.log('created NFT');
  console.log('nft mint address:', nft.mint.address.toBase58());
  console.log('nft metadata addresss: ', nft.metadataAddress.toBase58());
  console.log(nft);

  console.log('localnet is up');
};

main();
