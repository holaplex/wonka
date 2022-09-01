import { LOCALHOST } from '@metaplex-foundation/amman';
import {
  Amman,
  AmmanMockStorageDriver,
} from '@metaplex-foundation/amman-client';
import { Connection } from '@solana/web3.js';

import {
  Metaplex,
  keypairIdentity,
  MetaplexPlugin,
  UploadMetadataOutput,
  Nft,
  CreateNftOutput,
  CreateNftInput,
} from '@metaplex-foundation/js-next';

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
  const ammanStorage = amman.createMockStorageDriver('amman-storage-driver');
  metaplex.use(keypairIdentity(collectionOwnerKeypair));
  metaplex.use(ammanStorage as MetaplexPlugin);

  // Can I initialize amman from config.js here? / Do I want to
  // Test data needed to generate
  //  - "user" wallet (funded)
  //  - "owner" wallet (funded)
  //  - a candy machine
  //
  // How can I transform this into some sort of test?

  console.log('localnet is up');
};

main();
