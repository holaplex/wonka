import path from 'path';
import * as fs from 'fs';
import { LOCALHOST } from '@metaplex-foundation/amman';
import {
  Amman,
  ammanMockStorage,
  AmmanMockStorageDriver,
} from '@metaplex-foundation/amman-client';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
  Nft,
  token,
  findAssociatedTokenAccountPda,
  SplTokenAmount,
  formatAmount,
} from '@metaplex-foundation/js';

import { makeServer } from '../src/makeServer';
import { GraphQLClient, gql } from 'graphql-request';
import base58 from 'bs58';
import { Fanout, FanoutClient } from '@glasseaters/hydra-sdk';
import { BN, Wallet } from '@project-serum/anchor';

const makeTestClient = (): GraphQLClient => {
  return new GraphQLClient('http://0.0.0.0:4000/graphql');
};

const ensureBalance = async (
  amman: Amman,
  connection: Connection,
  pubkey: PublicKey,
  minBalance: number,
  maxBalance: number = 2 * minBalance,
): Promise<void> => {
  const currentBalance = await connection.getBalance(pubkey, 'confirmed');
  if (currentBalance < minBalance) {
    const sig = await amman.airdrop(connection, pubkey, maxBalance);
    // NOTE(will): need to finzalize otherwise tx's done immediately after will fail
    await connection.confirmTransaction(sig.signature, 'finalized');
  }
};

const createTokenAssociatedTokenAccountIfNeeded = async (
  connection: Connection,
  tokenMint: PublicKey,
  payer: Keypair,
  owner = payer.publicKey,
): Promise<PublicKey> => {
  const ataAddress = findAssociatedTokenAccountPda(tokenMint, owner);
  const createTokenIx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    ataAddress,
    owner,
    owner,
  );

  const tx = new Transaction().add(createTokenIx);
  const txResult = await connection.sendTransaction(tx, [payer]);
  console.log(txResult);
  await connection.confirmTransaction(txResult, 'finalized');
  return ataAddress;
};

const createToken = async (
  amman: Amman,
  connection: Connection,
  tokenMint: Keypair,
  tokenMintAuthority: Keypair,
  payer: Keypair,
  owner: Keypair = payer,
): Promise<[PublicKey, PublicKey]> => {
  const metaplex = new Metaplex(connection);
  const createMintResult = await metaplex
    .tokens()
    .createTokenWithMint({
      decimals: 6,
      initialSupply: token(1000 * Math.pow(10, 6)),
      mint: tokenMint,
      mintAuthority: tokenMintAuthority,
      freezeAuthority: tokenMintAuthority.publicKey,
      owner: owner.publicKey,
      payer: payer,
      confirmOptions: {
        commitment: 'finalized',
      },
    })
    .run();

  // maybe create metadata account as well here?

  return [createMintResult.token.mint.address, createMintResult.token.address];
};

const mintTokens = async (
  connection: Connection,
  tokenMint: PublicKey,
  tokenAuthority: Keypair,
  payer: Keypair,
  mintTokensTo: PublicKey,
  amount: SplTokenAmount,
): Promise<void> => {
  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(payer));
  const tokenMintResult = await metaplex
    .tokens()
    .mint({
      mintAddress: tokenMint,
      amount: amount,
      toOwner: mintTokensTo,
      mintAuthority: tokenAuthority,
      payer: payer,
      confirmOptions: { commitment: 'finalized' },
    })
    .run();

  // const balance = await connection.getTokenAccountBalance()
  console.log(
    'Minted tokens (' + tokenMint.toBase58() + ') to owner: ',
    mintTokensTo.toBase58(),
  );
  console.log(tokenMintResult);
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
  const storage = metaplex.storage();
  const collectionNftDir = path.resolve(
    __dirname,
    'data',
    'example_collection_nft',
  );
  const collectionNftImagePath = path.resolve(collectionNftDir, '0.png');
  const collectionNftImageData = fs.readFileSync(collectionNftImagePath);
  const collectionNftImageMetaplexFile = toMetaplexFile(
    collectionNftImageData,
    'collection-nft.png',
  );

  const collectionNftImageUri = await storage.upload(
    collectionNftImageMetaplexFile,
  );

  const collectionNftJsonPath = path.resolve(collectionNftDir, '0.json');
  const collectionNftMetadataStr = fs.readFileSync(
    collectionNftJsonPath,
    'utf-8',
  );
  let collectionNftMetadataJson = JSON.parse(collectionNftMetadataStr);
  collectionNftMetadataJson['image'] = collectionNftImageUri;

  const collectionNftMetadataUri = await storage.uploadJson(
    collectionNftMetadataJson,
  );

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

  return nft;
};

const uploadCandyMachine = async (
  amman: Amman,
  connection: Connection,
  splTokenMint?: PublicKey,
  nativeWallet?: PublicKey,
): Promise<string | null> => {
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
  await ensureBalance(amman, connection, payerPubkey, 100);

  const [collectionMint] = await amman.addr.resolveLabel(
    'super-cool-collection-mint',
  );

  console.log('collection mint: ', collectionMint);

  const cmConfigJson: any = {
    price: 0.01,
    sellerFeeBasisPoints: 100,
    itemsAvailable: 10,
    gatekeeper: null,
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

  if (!!splTokenMint) {
    cmConfigJson['splToken'] = splTokenMint.toBase58();
    const ownerAta = await createTokenAssociatedTokenAccountIfNeeded(
      connection,
      splTokenMint,
      payerKeypair,
    );
    cmConfigJson['splTokenAccount'] = ownerAta.toBase58();
  } else if (!!nativeWallet) {
    const [treasPubkey, treasKeypair] = await amman.loadOrGenKeypair(
      'treasury',
    );
    await ensureBalance(amman, connection, treasPubkey, 1);
    cmConfigJson['solTreasuryAccount'] = nativeWallet.toBase58();
  } else {
    throw Error(
      'need to provide either a native wallet or an spl mint and account for treasury',
    );
  }

  const client = makeTestClient();

  const result = await client.request(
    gql`
      mutation candyMachineUpload(
        $keyPair: String!
        $callbackUrl: String
        $config: JSON!
        $collectionMint: String!
        $setCollectionMint: Boolean!
        $filesZipUrl: String!
        $guid: String
        $rpc: String!
        $env: String!
        $useHiddenSettings: Boolean!
        $executeSync: Boolean!
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
          executeSync: $executeSync
        ) {
          processId
          candyMachineAddress
        }
      }
    `,
    {
      keyPair: base58.encode(payerKeypair.secretKey),
      callbackUrl: null,
      config: cmConfigJson,
      collectionMint: collectionMint,
      setCollectionMint: true,
      filesZipUrl: zipUri,
      guid: '--',
      env: 'localnet',
      rpc: LOCALHOST,
      useHiddenSettings: true,
      executeSync: true,
    },
  );

  console.log('result', result);
  return result.candyMachineUpload.candyMachineAddress;
};

const main = async () => {
  const server = makeServer(4000, true, console);
  server.start();
  const connection = new Connection(LOCALHOST);
  const amman = Amman.instance({
    log: console.log,
  });

  const [richPersonPubkey, richPersonKeypair] = await amman.loadOrGenKeypair(
    'rich-person',
  );
  const [tokenCreatorPubkey, tokenCreatorKeypair] =
    await amman.loadOrGenKeypair('token-creator');
  const [tokenMintPubkey, tokenMintKeypair] = await amman.genLabeledKeypair(
    'my-token-mint-keypair',
  );
  const [tokenMintAuthPubkey, tokenMintAuthKeypair] =
    await amman.genLabeledKeypair('my-token-authority-keypair');

  await ensureBalance(amman, connection, richPersonPubkey, 1000);
  await ensureBalance(amman, connection, tokenCreatorPubkey, 1000);

  const [tokenMintAddress, tokenAccountAddress] = await createToken(
    amman,
    connection,
    tokenMintKeypair,
    tokenMintAuthKeypair,
    tokenCreatorKeypair,
  );

  await mintTokens(
    connection,
    tokenMintPubkey,
    tokenMintAuthKeypair,
    richPersonKeypair,
    richPersonPubkey,
    token(1, 6),
  );

  const richPersonTokenAcct = findAssociatedTokenAccountPda(
    tokenMintPubkey,
    richPersonPubkey,
  );

  console.log('Rich Person Token Acct: ', richPersonTokenAcct.toBase58());

  const nft = await createCollectionNft(amman, connection);
  const candyAddress = await uploadCandyMachine(
    amman,
    connection,
    tokenMintAddress,
    tokenAccountAddress,
  );

  console.log('candyAddress: ', candyAddress);

  await setTimeout(async () => {
    console.log('checking candy machine');
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(richPersonKeypair));

    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({
        address: new PublicKey(candyAddress),
        commitment: 'confirmed',
      })
      .run();

    console.log(candyMachine);

    console.log('Candy Info');
    console.log('Go Live: ', candyMachine.goLiveDate.toNumber());
    console.log('Price: ', formatAmount(candyMachine.price));
    console.log('Items Available: ', candyMachine.itemsAvailable.toNumber());
    console.log('Items Remaining: ', candyMachine.itemsRemaining.toNumber());
    console.log('Items Loaded: ', candyMachine.itemsLoaded.toNumber());
    console.log('Items Minted', candyMachine.itemsMinted.toNumber());

    const richPersonBalance = await connection.getTokenAccountBalance(
      richPersonTokenAcct,
      'finalized',
    );
    console.log('Rich Person Token Balance: ', richPersonBalance.value.amount);

    console.log('minting an NFT');
    const mintedNft = await metaplex
      .candyMachines()
      .mint({
        candyMachine,
        payer: richPersonKeypair,
        payerToken: richPersonTokenAcct,
        confirmOptions: {
          skipPreflight: true,
          commitment: 'finalized',
        },
      })
      .run();

    // TODO(will): this runs reportedly runs into a bot tax
    // unclear why (and will fail without `skipPreflight`)

    console.log(mintedNft);
  }, 5000);

  server.stop();
};

main();
