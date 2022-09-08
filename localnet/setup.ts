import { LOCALHOST } from '@metaplex-foundation/amman';
import {
  Amman,
  ammanMockStorage,
  AmmanMockStorageDriver,
} from '@metaplex-foundation/amman-client';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import path from 'path';
import * as fs from 'fs';
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
  Nft,
} from '@metaplex-foundation/js';

import { CreateFanout } from '../src/graphql';
import * as graphqlTypes from '../src/graphql';
import { makeSchema } from 'nexus';
import { resolveObjMapThunk } from 'graphql';

import { asNexusMethod } from 'nexus';
import { makeServer } from '../src/makeServer';
import { GraphQLClient, gql, RequestDocument } from 'graphql-request';
import base58 from 'bs58';
import { defaultYogaLogger } from '@graphql-yoga/common';
import { Fanout, FanoutClient } from '@glasseaters/hydra-sdk';
import { Wallet } from '@project-serum/anchor';

const ensureBalance = async (
  amman: Amman,
  connection: Connection,
  pubkey: PublicKey,
  minBalance: number,
  maxBalance: number = 2 * minBalance,
) => {
  const currentBalance = await connection.getBalance(pubkey, 'confirmed');
  if (currentBalance < minBalance) {
    const sig = await amman.airdrop(connection, pubkey, maxBalance);
    // NOTE(will): need to finzalize otherwise tx's done immediately after will fail
    await connection.confirmTransaction(sig.signature, 'finalized');
  }
};

const createFanout = async (
  payer: Keypair,
  fanoutName: String,
  members: Array<{
    wallet: PublicKey;
    shares: number;
    splTokenAcct?: PublicKey;
  }>,
) => {
  console.log('creating fanout');
  const client = new GraphQLClient('http://0.0.0.0:4000/graphql');
  let fanoutMembers = [];

  for (const member of members) {
    fanoutMembers.push({
      publicKey: member.wallet.toBase58(),
      shares: member.shares,
    });
  }
  const payerSecret = base58.encode(payer.secretKey);
  console.log('payer secret is ', payer.secretKey.length, 'bytes');

  const result = await client.request(
    gql`
      mutation createFanout(
        $keyPair: String!
        $name: String!
        $members: [FanoutMember]!
        $splTokenAddresses: [String]
      ) {
        createFanout(
          keyPair: $keyPair
          name: $name
          members: $members
          splTokenAddresses: $splTokenAddresses
        ) {
          message
          fanoutPublicKey
          solanaWalletAddress
        }
      }
    `,
    {
      keyPair: payerSecret,
      name: fanoutName,
      members: fanoutMembers,
      splTokenAddresses: null,
    },
  );

  console.log(result);
  return result;
};

const disperseFanout = async (payer: Keypair, fanoutAddress: PublicKey) => {
  console.log('dispersing fanout');
  const payerSecret = base58.encode(payer.secretKey);
  const client = new GraphQLClient('http://0.0.0.0:4000/graphql');
  const result = await client.request(
    gql`
      mutation disperseFanout(
        $keyPair: String!
        $fanoutPublicKey: String!
        $splTokenAddresses: [String]
      ) {
        disperseFanout(
          keyPair: $keyPair
          fanoutPublicKey: $fanoutPublicKey
          splTokenAddresses: $splTokenAddresses
        ) {
          message
        }
      }
    `,
    {
      keyPair: payerSecret,
      fanoutPublicKey: fanoutAddress.toBase58(),
      splTokenAddresses: null,
    },
  );

  console.log('done with disperse...');
  console.log(result);
};

const testFanout = async (amman: Amman, connection: Connection) => {
  const [fanoutOwnerPubkey, fanoutOwnerKeypair] = await amman.loadOrGenKeypair(
    'fanoutOwner',
  );

  await amman.airdrop(connection, fanoutOwnerPubkey, 100);

  const [fanoutMember1Pubkey, fanoutMember1Keypair] =
    await amman.loadOrGenKeypair('fanoutMember1');
  const [fanoutMember2Pubkey, fanoutMember2Keypair] =
    await amman.loadOrGenKeypair('fanoutMember2');

  const createFanoutResult = createFanout(fanoutOwnerKeypair, 'TestFanout', [
    { wallet: fanoutMember1Pubkey, shares: 100 },
    { wallet: fanoutMember2Pubkey, shares: 300 },
  ]);

  const fanoutClient = new FanoutClient(
    connection,
    new Wallet(fanoutOwnerKeypair),
  );

  // const fanoutPubkey = new PublicKey(createFanoutResult['fanoutPublicKey']);
  // const fanoutSolWalletAddress = new PublicKey(
  //   createFanoutResult['solanaWalletAddress'],
  // );

  const fanoutPubkey = new PublicKey(
    '3scvqz8pKnmjxWTwXF9wroU8uTCMpdhzuCQ7RPxozP7A',
  );

  const fanoutSolWalletAddress = new PublicKey(
    '8rbcaDFj9S4tjYL29d1T8RFxDy8bx3EtxaddjouXdH2f',
  );

  const fetchedFanoutMembers = await fanoutClient.getMembers({
    fanout: fanoutPubkey,
  });

  for (const memberPubkey of fetchedFanoutMembers) {
    console.log('FanoutMember: ', memberPubkey.toBase58());
  }

  const fanoutAcct = await Fanout.fromAccountAddress(connection, fanoutPubkey);
  console.log('fanout account: ');
  console.log(fanoutAcct);

  await amman.airdrop(connection, fanoutSolWalletAddress, 1);

  const disperseFanoutResult = disperseFanout(fanoutOwnerKeypair, fanoutPubkey);
};

const createCollectionNft = async (
  amman: Amman,
  connection: Connection,
): Promise<Nft> => {
  const [collectionOwnerPubkey, collectionOwnerKeypair] =
    await amman.loadOrGenKeypair('collection_owner');
  const [userPubkey, userKeypair] = await amman.loadOrGenKeypair('user1');

  await ensureBalance(amman, connection, collectionOwnerPubkey, 100);
  await ensureBalance(amman, connection, userPubkey, 2);
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
      name: 'Super Cool Collection',
      symbol: 'SCC',
      sellerFeeBasisPoints: 0,
      updateAuthority: collectionOwnerKeypair,
    })
    .run();

  const mintLabelResult = await amman.addr.addLabel(
    'super-cool-collection-mint',
    nft.mint.address,
  );

  console.log('what does this print?', mintLabelResult);
  return nft;
};

const uploadCandyMachine = async (amman: Amman, connection: Connection) => {
  // prepare the zip file
  const storage = amman.createMockStorageDriver('amman-mock-storage');
  const zipPath = path.resolve(__dirname, 'data', 'example_drop.zip');
  const zipBuf = fs.readFileSync(zipPath);
  const zipMetaplexFile = toMetaplexFile(zipBuf, 'example_drop.zip');
  const zipUri = await storage.upload(zipMetaplexFile);

  console.log('Zip Uri: ', zipUri);

  const [payerPubkey, payerKeypair] = await amman.loadOrGenKeypair(
    'collection_owner',
  );

  ensureBalance(amman, connection, payerPubkey, 100);
  const [treasPubkey, treasKeypair] = await amman.loadOrGenKeypair('treasury');
  const [collectionMint] = await amman.addr.resolveLabel(
    'super-cool-collection-mint',
  );

  console.log('collection mint: ', collectionMint);

  const cmConfigJson: any = {
    price: 0.01,
    sellerFeeBasisPoints: 0,
    itemsAvailable: 10,
    gatekeeper: null,
    solTreasuryAccount: treasPubkey.toBase58(),
    collection: collectionMint,
    goLiveDate: 1654999999,
    endSettings: null,
    whitelistMintSettings: null,
    storage: 'nft-storage',
    nftStorageKey: 'dummy',
    ipfsInfuraProjectId: null,
    ipfsInfuraSecret: null,
    awsS3Bucket: null,
    noRetainAuthority: false,
    noMutable: false,
  };

  const client = new GraphQLClient('http://0.0.0.0:4000/graphql');

  const result = await client.request(
    gql`
      mutation candyMachineUpload(
        $keyPair: String!
        $callbackUrl: String!
        $config: JSON!
        $collectionMint: String!
        $setCollectionMint: Boolean!
        $filesZipUrl: String!
        $guid: String
        $rpc: String!
        $env: String!
        $useHiddenSettings: Boolean!
      ) {
        candyMachineUpload(
          keyPair: $keyPair
          callbackUrl: $callbackUrl
          config: $config
          collectionMint: $collectionMint
          setCollectionMint: $setCollectionMint
          filesZipUrl: $filesZipUrl
          guid: $guid
          rpc: $rpc
          env: $env
          useHiddenSettings: $useHiddenSettings
        ) {
          processId
        }
      }
    `,
    {
      keyPair: base58.encode(payerKeypair.secretKey),
      callbackUrl: 'http://fakeurl.com/callback',
      config: cmConfigJson,
      collectionMint: collectionMint,
      setCollectionMint: true,
      filesZipUrl: zipUri,
      guid: '--',
      env: 'localnet',
      rpc: LOCALHOST,
      useHiddenSettings: true,
    },
  );
};

const main = async () => {
  const server = makeServer(4000, true, console);
  server.start();
  const connection = new Connection(LOCALHOST);
  const amman = Amman.instance({
    log: console.log,
  });

  const nft = await createCollectionNft(amman, connection);
  await uploadCandyMachine(amman, connection);

  // await testFanout(amman, connection);

  // server.stop();
};

main();
