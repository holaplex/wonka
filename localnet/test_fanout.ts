// NOTE(will): just getting this stuff out of the way for now
// still figuring out how to structure the various utility functions such taht its easy to write
// quick tests

// const createFanout = async (
//     payer: Keypair,
//     fanoutName: String,
//     members: Array<{
//       wallet: PublicKey;
//       shares: number;
//       splTokenAcct?: PublicKey;
//     }>,
//   ) => {
//     console.log('creating fanout');
//     const client = makeTestClient();
//     let fanoutMembers = [];
//     const payerSecret = base58.encode(payer.secretKey);
//     console.log('payer secret is ', payer.secretKey.length, 'bytes');

//     const result = await client.request(
//       gql`
//         mutation createFanout(
//           $keyPair: String!
//           $name: String!
//           $members: [FanoutMember]!
//           $splTokenAddresses: [String]
//         ) {
//           createFanout(
//             keyPair: $keyPair
//             name: $name
//             members: $members
//             splTokenAddresses: $splTokenAddresses
//           ) {
//             message
//             fanoutPublicKey
//             solanaWalletAddress
//           }
//         }
//       `,
//       {
//         keyPair: payerSecret,
//         name: fanoutName,
//         members: fanoutMembers,
//         splTokenAddresses: null,
//       },
//     );

//     console.log(result);
//     return result;
//   };

//   const disperseFanout = async (payer: Keypair, fanoutAddress: PublicKey) => {
//     console.log('dispersing fanout');
//     const payerSecret = base58.encode(payer.secretKey);
//     const client = makeTestClient();
//     const result = await client.request(
//       gql`
//         mutation disperseFanout(
//           $keyPair: String!
//           $fanoutPublicKey: String!
//           $splTokenAddresses: [String]
//         ) {
//           disperseFanout(
//             keyPair: $keyPair
//             fanoutPublicKey: $fanoutPublicKey
//             splTokenAddresses: $splTokenAddresses
//           ) {
//             message
//           }
//         }
//       `,
//       {
//         keyPair: payerSecret,
//         fanoutPublicKey: fanoutAddress.toBase58(),
//         splTokenAddresses: null,
//       },
//     );

//     console.log('done with disperse...');
//     console.log(result);
//   };

//   const testFanout = async (amman: Amman, connection: Connection) => {
//     const [fanoutOwnerPubkey, fanoutOwnerKeypair] = await amman.loadOrGenKeypair(
//       'fanoutOwner',
//     );

//     await amman.airdrop(connection, fanoutOwnerPubkey, 100);

//     const [fanoutMember1Pubkey, fanoutMember1Keypair] =
//       await amman.loadOrGenKeypair('fanoutMember1');
//     const [fanoutMember2Pubkey, fanoutMember2Keypair] =
//       await amman.loadOrGenKeypair('fanoutMember2');

//     const createFanoutResult = createFanout(fanoutOwnerKeypair, 'TestFanout', [
//       { wallet: fanoutMember1Pubkey, shares: 100 },
//       { wallet: fanoutMember2Pubkey, shares: 300 },
//     ]);

//     const fanoutClient = new FanoutClient(
//       connection,
//       new Wallet(fanoutOwnerKeypair),
//     );

//     // const fanoutPubkey = new PublicKey(createFanoutResult['fanoutPublicKey']);
//     // const fanoutSolWalletAddress = new PublicKey(
//     //   createFanoutResult['solanaWalletAddress'],
//     // );

//     const fanoutPubkey = new PublicKey(
//       '3scvqz8pKnmjxWTwXF9wroU8uTCMpdhzuCQ7RPxozP7A',
//     );

//     const fanoutSolWalletAddress = new PublicKey(
//       '8rbcaDFj9S4tjYL29d1T8RFxDy8bx3EtxaddjouXdH2f',
//     );

//     const fetchedFanoutMembers = await fanoutClient.getMembers({
//       fanout: fanoutPubkey,
//     });

//     for (const memberPubkey of fetchedFanoutMembers) {
//       console.log('FanoutMember: ', memberPubkey.toBase58());
//     }

//     const fanoutAcct = await Fanout.fromAccountAddress(connection, fanoutPubkey);
//     console.log('fanout account: ');
//     console.log(fanoutAcct);

//     await amman.airdrop(connection, fanoutSolWalletAddress, 1);

//     const disperseFanoutResult = disperseFanout(fanoutOwnerKeypair, fanoutPubkey);
//   };
