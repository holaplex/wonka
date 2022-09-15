import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `File` scalar type represents a file upload. */
  File: any;
  JSON: any;
};

/** Result from calling candy machine upload logs */
export type CandyMachineUploadLogsResult = {
  __typename?: 'CandyMachineUploadLogsResult';
  logs: Scalars['JSON'];
  /** Process id handle */
  processId: Scalars['String'];
};

/** Result from calling candy machine upload */
export type CandyMachineUploadResult = {
  __typename?: 'CandyMachineUploadResult';
  /** Process id handle */
  processId: Scalars['String'];
};

/** The result for minting a NFT */
export type CreateFanoutResult = {
  __typename?: 'CreateFanoutResult';
  /** Fanout public key */
  fanoutPublicKey?: Maybe<Scalars['String']>;
  /** Operation message */
  message: Scalars['String'];
  /** Solana address of the fanout */
  solanaWalletAddress?: Maybe<Scalars['String']>;
  /** Spl Fanout Details */
  splFanout?: Maybe<Array<Maybe<SplFanout>>>;
};

/** The result for minting a NFT */
export type DisperseFanoutResult = {
  __typename?: 'DisperseFanoutResult';
  /** Operation message */
  message: Scalars['String'];
};

/** This is the input of an encrypted message, using public-key authenticated encryption to Encrypt and decrypt messages between sender and receiver using elliptic curve Diffie-Hellman key exchange. */
export type EncryptedMessage = {
  /** Base58 Encoded Box */
  boxedMessage: Scalars['String'];
  /** Base58 Encoded Client public key used to box the message */
  clientPublicKey: Scalars['String'];
  /** Base58 Encoded nonce used for boxing the message */
  nonce: Scalars['String'];
};

/** The result for decrypting */
export type EncryptedMessageResult = {
  __typename?: 'EncryptedMessageResult';
  /** Decrypted message */
  message: Scalars['String'];
};

export type FanoutMember = {
  /** Public key of member address */
  publicKey: Scalars['String'];
  /** Share member should receive */
  shares: Scalars['Float'];
};

/** The result for minting a NFT */
export type MintNftResult = {
  __typename?: 'MintNftResult';
  /** Mint hash of newly minted NFT */
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  authenticatedMutation?: Maybe<EncryptedMessageResult>;
  candyMachineUpload?: Maybe<CandyMachineUploadResult>;
  createFanout?: Maybe<CreateFanoutResult>;
  disperseFanout?: Maybe<DisperseFanoutResult>;
  mintNft?: Maybe<MintNftResult>;
  updateNft?: Maybe<UpdateNftResult>;
};


export type MutationAuthenticatedMutationArgs = {
  encryptedMessage: EncryptedMessage;
};


export type MutationCandyMachineUploadArgs = {
  callbackUrl: Scalars['String'];
  collectionMint: Scalars['String'];
  config: Scalars['JSON'];
  env: Scalars['String'];
  filesZipUrl: Scalars['String'];
  guid?: InputMaybe<Scalars['String']>;
  keyPair: Scalars['String'];
  rpc: Scalars['String'];
  setCollectionMint: Scalars['Boolean'];
};


export type MutationCreateFanoutArgs = {
  keyPair: Scalars['String'];
  members: Array<InputMaybe<FanoutMember>>;
  name: Scalars['String'];
  splTokenAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationDisperseFanoutArgs = {
  fanoutPublicKey: Scalars['String'];
  keyPair: Scalars['String'];
  splTokenAddresses?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};


export type MutationMintNftArgs = {
  encryptedMessage: EncryptedMessage;
  mintToAddress?: InputMaybe<Scalars['String']>;
  nftMetadata?: InputMaybe<NftMetadata>;
  nftMetadataJSON?: InputMaybe<Scalars['File']>;
};


export type MutationUpdateNftArgs = {
  cluster: Scalars['String'];
  newMetadataJson?: InputMaybe<NftMetadata>;
  newUri?: InputMaybe<Scalars['String']>;
  nftMintId: Scalars['String'];
  payer: Scalars['String'];
  updateAuthority: Scalars['String'];
};

export type NftAttribute = {
  /** Name of the attribute */
  trait_type?: InputMaybe<Scalars['String']>;
  /** Value of the attribute */
  value?: InputMaybe<Scalars['String']>;
};

export type NftCreator = {
  /** creator address (pubkey base58) */
  address?: InputMaybe<Scalars['String']>;
  /** creator share in basis points */
  share?: InputMaybe<Scalars['Int']>;
};

export type NftFile = {
  /** Whether the file is hosted on the CDN */
  cdn?: InputMaybe<Scalars['Boolean']>;
  /** Type of the file */
  type?: InputMaybe<Scalars['String']>;
  /** URI of the file */
  uri?: InputMaybe<Scalars['String']>;
};

/** Metadata for a NFT */
export type NftMetadata = {
  /** Animation URL of the NFT */
  animation_url?: InputMaybe<Scalars['String']>;
  /** Metadata for the NFT */
  attributes?: InputMaybe<Array<InputMaybe<NftAttribute>>>;
  /** Description of the NFT */
  description: Scalars['String'];
  /** External URL of the NFT */
  external_url: Scalars['String'];
  /** Image of the NFT */
  image: Scalars['String'];
  /** Name of the NFT */
  name: Scalars['String'];
  /** Properties of the NFT */
  properties?: InputMaybe<NftProperties>;
  /** Seller fee basis points */
  seller_fee_basis_points?: InputMaybe<Scalars['Int']>;
  /** Symbol of the NFT */
  symbol: Scalars['String'];
};

export type NftProperties = {
  /** Category of the NFT */
  category?: InputMaybe<Scalars['String']>;
  /** list of creators for this nft */
  creators?: InputMaybe<Array<InputMaybe<NftCreator>>>;
  /** Files associated with the NFT */
  files?: InputMaybe<Array<InputMaybe<NftFile>>>;
};

export type Query = {
  __typename?: 'Query';
  /** Get logs for a candy machine upload process */
  candyMachineUploadLogs?: Maybe<CandyMachineUploadLogsResult>;
};


export type QueryCandyMachineUploadLogsArgs = {
  processId: Scalars['String'];
};

/** The spl fanout result */
export type SplFanout = {
  __typename?: 'SplFanout';
  /** SPL Token Address */
  splTokenAddress: Scalars['String'];
  /** SPL Token Wallet */
  splTokenWallet: Scalars['String'];
};

/** The result for updating an NFT */
export type UpdateNftResult = {
  __typename?: 'UpdateNftResult';
  /** a descriptive message */
  message: Scalars['String'];
  /** uri of uploaded JSON metadata, if one was uploaded */
  newUri?: Maybe<Scalars['String']>;
  /** process id of the request which can be used to get logs */
  processId: Scalars['String'];
  /** true if nft update succeeded, false otherwise */
  success: Scalars['Boolean'];
};



export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {

  };
}
export type Sdk = ReturnType<typeof getSdk>;