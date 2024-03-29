import {
  nonNull,
  mutationField,
  arg,
  objectType,
  extendInputType,
  stringArg,
  list,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { FanoutClient, MembershipModel } from '@glasseaters/hydra-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { Wallet } from '@project-serum/anchor';
import base58 from 'bs58';
import { WonkaLogger } from '../lib/helpers/logger';

const LOGGER = WonkaLogger.with('fanout');

interface FanoutMember {
  publicKey: string;
  shares: number;
}

export const SplFanout = objectType({
  name: 'SplFanout',
  description: 'The spl fanout result',
  definition(t) {
    t.nonNull.string('splTokenAddress', {
      description: 'SPL Token Address',
    });
    t.nonNull.string('splTokenWallet', {
      description: 'SPL Token Wallet',
    });
  },
});

export const CreateFanoutResult = objectType({
  name: 'CreateFanoutResult',
  description: 'The result for minting a NFT',
  definition(t) {
    t.nonNull.string('message', {
      description: 'Operation message',
    });
    t.string('fanoutPublicKey', {
      description: 'Fanout public key',
    });
    t.field('solanaWalletAddress', {
      type: 'String',
      description: 'Solana address of the fanout',
    });
    t.field('splFanout', {
      type: list('SplFanout'),
      description: 'Spl Fanout Details',
    });
  },
});

export const DisperseFanoutResult = objectType({
  name: 'DisperseFanoutResult',
  description: 'The result for minting a NFT',
  definition(t) {
    t.nonNull.string('message', {
      description: 'Operation message',
    });
  },
});

export const FanoutMember = extendInputType({
  type: 'FanoutMember',
  definition(t) {
    t.nonNull.field('publicKey', {
      type: 'String',
      description: 'Public key of member address',
    });
    t.nonNull.field('shares', {
      type: 'Float',
      description: 'Share member should receive',
    });
  },
});

export const CreateFanout = mutationField('createFanout', {
  type: 'CreateFanoutResult',
  args: {
    keyPair: nonNull(
      stringArg({
        description: 'Wallet keypair',
      }),
    ),
    name: nonNull(
      stringArg({
        description: 'Fanout Name',
      }),
    ),
    members: nonNull(
      arg({
        type: list('FanoutMember'),
      }),
    ),
    splTokenAddresses: arg({
      type: list('String'),
      description:
        'Token mint addresses for which the fanout will create token accounts to distribute from, leave empty for a native SOL only fanout.',
    }),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
    const logger = LOGGER.withIdentifier();

    try {
      let authorityWallet: Wallet = null!;
      const connection = new Connection(process.env.RPC_ENDPOINT, 'confirmed');
      let fanoutSdk: FanoutClient;
      let splFanoutResult: {
        splTokenAddress: PublicKey;
        splTokenWallet: PublicKey;
      }[] = [];

      const keyPairBytes = base58.decode(args.keyPair);

      // Get create wallet from the client secrets
      try {
        authorityWallet = new Wallet(
          Keypair.fromSecretKey(Uint8Array.from(keyPairBytes)),
        );
      } catch (e) {
        logger.error('Error creating wallet from client secret', e);
        return {
          message: `Error creating wallet from client secret: ${e.message}`,
        };
      }

      // Removes duplicates
      const uniqueMembers = [
        ...new Map(
          args.members.map((item) => [item['publicKey'], item]),
        ).values(),
      ];

      // Make sure all members are valid
      if (
        uniqueMembers.filter((m: FanoutMember) => new PublicKey(m.publicKey))
          .length !== uniqueMembers.length
      ) {
        logger.error('Invalid public key');
        return {
          message: 'Invalid public key',
        };
      }

      const totalShares = uniqueMembers.reduce(
        (partialSum, a: any) => partialSum + a.shares,
        0,
      ) as number;
      fanoutSdk = new FanoutClient(connection, authorityWallet);
      let init: null | {
        fanout: PublicKey;
        nativeAccount: PublicKey;
      } = null;
      try {
        init = await fanoutSdk.initializeFanout({
          totalShares,
          name: args.name,
          membershipModel: MembershipModel.Wallet, // TODO: support other membership models
        });
      } catch (e) {
        logger.error('Error initializing fanout', e);
        return {
          message: `Error initializing fanout: ${e.message}`,
        };
      }

      if (args.splTokenAddresses) {
        for (var i = 0; i < args.splTokenAddresses.length; i++) {
          try {
            const { fanoutForMint, tokenAccount } =
              await fanoutSdk.initializeFanoutForMint({
                fanout: init.fanout,
                mint: new PublicKey(args.splTokenAddresses[i]),
              });
            splFanoutResult.push({
              splTokenAddress: new PublicKey(args.splTokenAddresses[i]),
              splTokenWallet: tokenAccount,
            });
          } catch (e) {
            logger.error('Error initializing fanout for mint', e);
            return {
              message: `Error initializing fanout for mint: ${e.message}`,
            };
          }
        }
      }

      // TODO
      // should get all promises in array, then do promise.all, check for errors
      uniqueMembers.map(async (member: FanoutMember) => {
        try {
          await fanoutSdk.addMemberWallet({
            fanout: init.fanout,
            fanoutNativeAccount: init.nativeAccount,
            membershipKey: new PublicKey(member.publicKey),
            shares: member.shares,
          });
        } catch (e) {
          logger.error('Error adding member', e);
          return {
            message: `Error adding member: ${e.message}`,
          };
        }
      });

      // Return the details of the operation
      if (args.splTokenAddresses) {
        if (args.splTokenAddresses.length > 0) {
          const result = {
            message: 'Successfully created wallet',
            fanoutPublicKey: init.fanout.toBase58(),
            solanaWalletAddress: init.nativeAccount.toBase58(),
            splFanout: splFanoutResult,
          }
          logger.info(JSON.stringify(result));
          return result;
        }
      }

      const result = {
        message: 'Successfully created wallet',
        fanoutPublicKey: init.fanout.toBase58(),
        solanaWalletAddress: init.nativeAccount.toBase58(),
      }
      logger.info(JSON.stringify(result))
      return result;

    } catch (e) {
      logger.error("Unhandled exception in createFanout", e);
      throw e;
    }
  },
});

export const DisperseFanout = mutationField('disperseFanout', {
  type: 'DisperseFanoutResult',
  args: {
    keyPair: nonNull(
      stringArg({
        description: 'Payer keypair',
      }),
    ),
    fanoutPublicKey: nonNull(
      stringArg({
        description: 'Pubkey of Fanout to disperse',
      }),
    ),
    splTokenAddresses: arg({
      type: list('String'),
      description:
        'Token mint addresses for which the fanout will distribute from, leave empty for a native SOL only distribution',
    }),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
    const logger = LOGGER.withIdentifier();

    try {
      let payerWallet: Wallet = null!;
      const connection = new Connection(process.env.RPC_ENDPOINT, 'confirmed');
      let fanoutSdk: FanoutClient;

      // Load up that keypair
      const keyPairBytes = base58.decode(args.keyPair);

      // Try to make the wallet
      try {
        payerWallet = new Wallet(
          Keypair.fromSecretKey(Uint8Array.from(keyPairBytes)),
        );
      } catch (e) {
        logger.error('Error creating wallet from client secret', e);
        return {
          message: `Error creating wallet from client secret: ${e.message}`,
        };
      }

      // Verify fanout is legit
      try {
        new PublicKey(args.fanoutPublicKey);
      } catch (e) {
        logger.error('Error creating pubkey from fanout address', e);
        return {
          message: `Error creating pubkey from fanout address: ${e.message}`,
        };
      }

      fanoutSdk = new FanoutClient(connection, payerWallet);

      // For each SPL token provided verify it's valid and distribute funds
      if (args.splTokenAddresses) {
        for (var i = 0; i < args.splTokenAddresses.length; i++) {
          try {
            new PublicKey(args.splTokenAddresses[i]);
          } catch (e) {
            logger.error('Error creating publickey from splTokenAddress', e);
            return {
              message: `Error creating publickey from splTokenAddress: ${e.message}`,
            };
          }

          try {
            await fanoutSdk.distributeAll({
              fanout: new PublicKey(args.fanoutPublicKey),
              payer: payerWallet.publicKey,
              mint: new PublicKey(args.splTokenAddresses[i]),
            });
          } catch (e) {
            logger.error('Error dispersing funds', e);
            return {
              message: `Error dispersing funds: ${e.name} - ${e.message}`,
            };
          }
        }
        // If no SPL tokens listed, assume SOL only distribution
      } else {
        try {
          await fanoutSdk.distributeAll({
            fanout: new PublicKey(args.fanoutPublicKey),
            payer: payerWallet.publicKey,
            mint: NATIVE_MINT,
          });
        } catch (e) {
          logger.error('Error dispersing funds', e);
          return {
            message: `Error dispersing funds: ${e.message}`,
          };
        }
      }

      logger.info('Disperse fanout successful');
      return {
        message: 'Disperse fanout successful',
      };

    } catch (e) {
      logger.error('Unhandled error in disperseFanout', e);
      throw e;
    }
  },
});
