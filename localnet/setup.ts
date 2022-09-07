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

const main = async () => {
  const server = makeServer(4000, true, console);
  server.start();
  const connection = new Connection(LOCALHOST);
  const amman = Amman.instance({
    log: console.log,
  });

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

  // const [collectionOwnerPubkey, collectionOwnerKeypair] =
  //   await amman.loadOrGenKeypair('collection_owner');
  // const [userPubkey, userKeypair] = await amman.loadOrGenKeypair('user1');
  // const [collectionNftPubkey, collectionNftKeypair] =
  //   await amman.loadOrGenKeypair('test_collection');

  // await amman.airdrop(connection, collectionOwnerPubkey, 100);
  // await amman.airdrop(connection, userPubkey, 2);

  const metaplex = new Metaplex(connection);

  const cmInput = CandyMachineInput
  metaplex.candyMachines().create()
  // metaplex.use(keypairIdentity(collectionOwnerKeypair));
  // metaplex.use(ammanMockStorage('amman-mock-storage'));
  // const storageDriver = metaplex.storage().driver();

  // const collectionNftDir = path.resolve(
  //   __dirname,
  //   'data',
  //   'example_collection_nft',
  // );
  // const collectionNftImagePath = path.resolve(collectionNftDir, '0.png');
  // const collectionNftJsonPath = path.resolve(collectionNftDir, '0.json');
  // const collectionNftImageData = fs.readFileSync(collectionNftImagePath);
  // const collectionNftMetadataData = fs.readFileSync(collectionNftJsonPath);

  // const collectionNftImageMetaplexFile = toMetaplexFile(
  //   collectionNftImageData,
  //   'collection-nft.png',
  // );

  // const collectionNftMetadataMetaplexFile = toMetaplexFile(
  //   collectionNftMetadataData,
  //   'collection-nft.json',
  // );

  // const [collectionNftImageUri, collectionNftMetadataUri] =
  //   await storageDriver.uploadAll([
  //     collectionNftImageMetaplexFile,
  //     collectionNftMetadataMetaplexFile,
  //   ]);

  // console.log('Upload Results:');
  // console.log('nftImageUri:', collectionNftImageUri);
  // console.log('nftMetadataUri:', collectionNftMetadataUri);

  // const { nft } = await metaplex
  //   .nfts()
  //   .create({
  //     uri: collectionNftMetadataUri,
  //     name: 'Example Collection NFT',
  //     symbol: 'ECNFT',
  //     sellerFeeBasisPoints: 0,
  //     updateAuthority: collectionOwnerKeypair,
  //   })
  //   .run();

  // console.log('created NFT');
  // console.log('nft mint address:', nft.mint.address.toBase58());
  // console.log('nft metadata addresss: ', nft.metadataAddress.toBase58());
  // console.log(nft);

  // console.log('localnet is up');

  // server.stop();
};

main();
