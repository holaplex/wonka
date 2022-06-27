//test
import { program } from 'commander';
import log from 'loglevel';
import "dotenv/config";
import { File } from '@nftstorage/metaplex-auth';

//extra imports from mintNFT

import { request, GraphQLClient, gql } from 'graphql-request'

import { MintNft} from './../src/graphql/MintNFT'

import nacl from 'tweetnacl';
import crypto from 'crypto';

import { TextEncoder } from 'util';
import { TextDecoder } from 'util';
import bs58 from 'bs58';

import { EncryptedMessage } from './../src/graphql/encrypted'
import { Ed25519Program } from '@solana/web3.js';
import * as fs from 'fs';

//end extra imports
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

program.version('1.0.0');
log.setLevel('info');

program
  .command('mint')
  .description('test')
  //.requiredOption('-meta, --metadata <string>', 'NFT Metadata')
  .action(async (meta) => 
  {
    var randomBytes = require('random-bytes')
    var enc = new TextEncoder(); // always utf-8
    let clientKeys = nacl.box.keyPair();
    //Key Generation Code:
    let test = nacl.box.keyPair.fromSecretKey(Uint8Array.from(crypto.randomBytes(32)));
    console.log(test.publicKey);
    console.log(test.secretKey);
    console.log(bs58.decode('4tieZ9Pst1TRUeCpeNeaXgraNbZSLnKrzgPJjeRVMsgj'));
    console.log(clientKeys.publicKey.length);
    let message = clientKeys.secretKey;
    let nonce = nacl.randomBytes(nacl.box.nonceLength);
    let secret = clientKeys.secretKey;
    let publicKey = Uint8Array.from(Buffer.from(process.env!.SERVER_PUBLIC_KEY, 'hex'));
    console.log(publicKey.length);
    let box = nacl.box(message, nonce, secret, publicKey);

    let nonceString = bs58.encode(nonce);
    let boxString = bs58.encode(box);
    let publicKeyString = bs58.encode(publicKey);

    let contents = fs.readFileSync("../test.json", "utf-8");
    let testFile = new File([contents], "../test.json");

    const client = new GraphQLClient('http://127.0.0.1:4000/graphql', { headers: {} });
    const query = gql`mutation test2($box: String!, $inputNonce: String!, $pkey: String!, $inputFile: File!)
    { 
      mintNft(encryptedMessage: { boxedMessage: $box, nonce: $inputNonce, clientPublicKey: $pkey }, nftMetadataJSON: $inputFile) 
      {
        MintNftResult
      }
    }`;
    const variables = {
      box: boxString,
      inputNonce: nonceString,
      pkey: publicKeyString,
      inputFile: testFile,
    }
    client.request(query, variables).then((data) => console.log(data));
  });

program.parse(process.argv);