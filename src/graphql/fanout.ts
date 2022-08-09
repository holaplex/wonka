import {
  nonNull,
  mutationField,
  arg,
  objectType,
  extendInputType,
  list,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { decryptEncodedPayload } from '../lib/cryptography/utils.js';
import { FanoutClient, MembershipModel } from '@glasseaters/hydra-sdk';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { Wallet } from '@project-serum/anchor';

interface FanoutMember {
  publicKey: string;
  shares: number;
}

export const SplFanout = objectType({
  name: 'SplFanout',
  description: 'The spl fanout result',
  definition (t) {
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
  definition (t) {
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
      type: 'SplFanout',
      description: 'Spl Fanout Details',
    });
  },
});

export const DisperseFanoutResult = objectType({
  name: 'DisperseFanoutResult',
  description: 'The result for minting a NFT',
  definition (t) {
    t.nonNull.string('message', {
      description: 'Operation message',
    });
  },
});

export const FanoutMember = extendInputType({
  type: 'FanoutMember',
  definition (t) {
    t.nonNull.field('publicKey', {
      type: 'String',
      description: 'Public key of member address',
    });
    t.nonNull.field('shares', {
      type: 'Int',
      description: 'Share member should receive',
    });
  },
});

export const CreateFanout = mutationField('createFanout', {
  type: 'CreateFanoutResult',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
    name: nonNull(
      arg({
        type: 'String',
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
  async resolve (_, args, ctx: YogaInitialContext) {
    let authorityWallet: Wallet = null!;
    const connection = new Connection(process.env.RPC_ENDPOINT, 'confirmed');
    let fanoutSdk: FanoutClient;
    let splFanoutResult: {
      splTokenAddress: PublicKey | null;
      splTokenWallet: PublicKey | null;
    }[] = [];

    const keyPairBytes = JSON.parse(
      decryptEncodedPayload(args.encryptedMessage),
    ) as number[];

    // Get create wallet from the client secrets
    try {
      authorityWallet = new Wallet(
        Keypair.fromSecretKey(Uint8Array.from(keyPairBytes)),
      );
    } catch (e) {
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

    // Make sure sum of shares is 100
    if (
      uniqueMembers.reduce((partialSum, a: any) => partialSum + a.shares, 0) !==
      100
    ) {
      return {
        message: 'Total share must be 100',
      };
    }

    // Make sure all members are valid
    if (
      uniqueMembers.filter((m: FanoutMember) => new PublicKey(m.publicKey))
        .length !== uniqueMembers.length
    ) {
      return {
        message: 'Invalid public key',
      };
    }

    fanoutSdk = new FanoutClient(connection, authorityWallet);

    let init: null | {
      fanout: PublicKey;
      nativeAccount: PublicKey;
    } = null;
    try {
      init = await fanoutSdk.initializeFanout({
        totalShares: 100,
        name: args.name,
        membershipModel: MembershipModel.Wallet, // TODO: support other membership models
      });
    } catch (e) {
      return {
        message: `Error initializing fanout: ${e.message}`,
      };
    }

    if (args.splTokenAddresses) {
      for (var i = 0; i < args.splTokenAddresses.length; i++) {
        try {
          const {
            fanoutForMint,
            tokenAccount,
          } = await fanoutSdk.initializeFanoutForMint({
            fanout: init.fanout,
            mint: new PublicKey(args.splTokenAddresses[i]),
          });
          splFanoutResult.push({
            splTokenAddress: new PublicKey(args.splTokenAddresses[i]),
            splTokenWallet: tokenAccount,
          });
        } catch (e) {
          return {
            message: `Error initializing fanout for mint: ${e.message}`,
          };
        }
      }
    }

    // Add members
    uniqueMembers.map(async (member: FanoutMember) => {
      try {
        await fanoutSdk.addMemberWallet({
          fanout: init.fanout,
          fanoutNativeAccount: init.nativeAccount,
          membershipKey: new PublicKey(member.publicKey),
          shares: member.shares,
        });
      } catch (e) {
        return {
          message: `Error adding member: ${e.message}`,
        };
      }
    });

    // Return the details of the operation
    if (args.splTokenAddresses.length > 0) {
      return {
        message: 'Successfully created wallet',
        fanoutPublicKey: init.fanout.toBase58(),
        solanaWalletAddress: init.nativeAccount.toBase58(),
        splFanout: splFanoutResult,
      };
    }

    return {
      message: 'Successfully created wallet',
      fanoutPublicKey: init.fanout.toBase58(),
      solanaWalletAddress: init.nativeAccount.toBase58(),
    };
  },
});

export const DisperseFanout = mutationField('disperseFanout', {
  type: 'DisperseFanoutResult',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
    fanoutPublicKey: nonNull(
      arg({
        type: 'String',
      }),
    ),
    splTokenAddresses: arg({
      type: list('String'),
      description:
        'Token mint addresses for which the fanout will distribute from, leave empty for a native SOL only distribution',
    }),
  },
  async resolve (_, args, ctx: YogaInitialContext) {
    let payerWallet: Wallet = null!;
    const connection = new Connection(process.env.RPC_ENDPOINT, 'confirmed');
    let fanoutSdk: FanoutClient;

    // Load up that keypair
    const keyPairBytes = JSON.parse(
      decryptEncodedPayload(args.encryptedMessage),
    ) as number[];

    // Try to make the wallet
    try {
      payerWallet = new Wallet(
        Keypair.fromSecretKey(Uint8Array.from(keyPairBytes)),
      );
    } catch (e) {
      return {
        message: `Error creating wallet from client secret: ${e.message}`,
      };
    }

    // Verify fanout is legit
    try {
      new PublicKey(args.fanoutPublicKey);
    } catch (e) {
      return {
        message: `Error creating wallet from fanout address: ${e.message}`,
      };
    }

    fanoutSdk = new FanoutClient(connection, payerWallet);

    // For each SPL token provided verify it's valid and distribute funds
    if (args.splTokenAddresses) {
      for (var i = 0; i < args.splTokenAddresses.length; i++) {
        try {
          new PublicKey(args.splTokenAddresses[i]);
        } catch (e) {
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
          return {
            message: `Error dispersing funds: ${e.message}`,
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
        return {
          message: `Error dispersing funds: ${e.message}`,
        };
      }
    }

    return {
      message: 'Disperse fanout successful',
    };
  },
});
