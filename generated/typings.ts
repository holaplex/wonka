/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * The `File` scalar type represents a file upload.
     */
    file<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "File";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * The `File` scalar type represents a file upload.
     */
    file<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "File";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  EncryptedMessage: { // input type
    boxedMessage: string; // String!
    clientPublicKey: string; // String!
    nonce: string; // String!
  }
  FanoutMember: { // input type
    publicKey: string; // String!
    shares: number; // Float!
  }
  NftAttribute: { // input type
    trait_type?: string | null; // String
    value?: string | null; // String
  }
  NftCreator: { // input type
    address?: string | null; // String
    share?: number | null; // Int
  }
  NftFile: { // input type
    cdn?: boolean | null; // Boolean
    type?: string | null; // String
    uri?: string | null; // String
  }
  NftMetadata: { // input type
    animation_url?: string | null; // String
    attributes?: Array<NexusGenInputs['NftAttribute'] | null> | null; // [NftAttribute]
    description: string; // String!
    external_url: string; // String!
    image: string; // String!
    name: string; // String!
    properties?: NexusGenInputs['NftProperties'] | null; // NftProperties
    seller_fee_basis_points?: number | null; // Int
    symbol: string; // String!
  }
  NftProperties: { // input type
    category?: string | null; // String
    creators?: Array<NexusGenInputs['NftCreator'] | null> | null; // [NftCreator]
    files?: Array<NexusGenInputs['NftFile'] | null> | null; // [NftFile]
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  File: File
  JSON: any
}

export interface NexusGenObjects {
  CandyMachineUploadLogsResult: { // root type
    logs: NexusGenScalars['JSON']; // JSON!
    processId: string; // String!
  }
  CandyMachineUploadResult: { // root type
    processId: string; // String!
  }
  CreateFanoutResult: { // root type
    fanoutPublicKey?: string | null; // String
    message: string; // String!
    solanaWalletAddress?: string | null; // String
    splFanout?: Array<NexusGenRootTypes['SplFanout'] | null> | null; // [SplFanout]
  }
  DisperseFanoutResult: { // root type
    message: string; // String!
  }
  EncryptedMessageResult: { // root type
    message: string; // String!
  }
  MintNftResult: { // root type
    message: string; // String!
  }
  Mutation: {};
  Query: {};
  SplFanout: { // root type
    splTokenAddress: string; // String!
    splTokenWallet: string; // String!
  }
  UpdateNftResult: { // root type
    message: string; // String!
    newUri?: string | null; // String
    processId: string; // String!
    success: boolean; // Boolean!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  CandyMachineUploadLogsResult: { // field return type
    logs: NexusGenScalars['JSON']; // JSON!
    processId: string; // String!
  }
  CandyMachineUploadResult: { // field return type
    processId: string; // String!
  }
  CreateFanoutResult: { // field return type
    fanoutPublicKey: string | null; // String
    message: string; // String!
    solanaWalletAddress: string | null; // String
    splFanout: Array<NexusGenRootTypes['SplFanout'] | null> | null; // [SplFanout]
  }
  DisperseFanoutResult: { // field return type
    message: string; // String!
  }
  EncryptedMessageResult: { // field return type
    message: string; // String!
  }
  MintNftResult: { // field return type
    message: string; // String!
  }
  Mutation: { // field return type
    authenticatedMutation: NexusGenRootTypes['EncryptedMessageResult'] | null; // EncryptedMessageResult
    candyMachineUpload: NexusGenRootTypes['CandyMachineUploadResult'] | null; // CandyMachineUploadResult
    createFanout: NexusGenRootTypes['CreateFanoutResult'] | null; // CreateFanoutResult
    disperseFanout: NexusGenRootTypes['DisperseFanoutResult'] | null; // DisperseFanoutResult
    mintNft: NexusGenRootTypes['MintNftResult'] | null; // MintNftResult
    updateNft: NexusGenRootTypes['UpdateNftResult'] | null; // UpdateNftResult
  }
  Query: { // field return type
    candyMachineUploadLogs: NexusGenRootTypes['CandyMachineUploadLogsResult'] | null; // CandyMachineUploadLogsResult
  }
  SplFanout: { // field return type
    splTokenAddress: string; // String!
    splTokenWallet: string; // String!
  }
  UpdateNftResult: { // field return type
    message: string; // String!
    newUri: string | null; // String
    processId: string; // String!
    success: boolean; // Boolean!
  }
}

export interface NexusGenFieldTypeNames {
  CandyMachineUploadLogsResult: { // field return type name
    logs: 'JSON'
    processId: 'String'
  }
  CandyMachineUploadResult: { // field return type name
    processId: 'String'
  }
  CreateFanoutResult: { // field return type name
    fanoutPublicKey: 'String'
    message: 'String'
    solanaWalletAddress: 'String'
    splFanout: 'SplFanout'
  }
  DisperseFanoutResult: { // field return type name
    message: 'String'
  }
  EncryptedMessageResult: { // field return type name
    message: 'String'
  }
  MintNftResult: { // field return type name
    message: 'String'
  }
  Mutation: { // field return type name
    authenticatedMutation: 'EncryptedMessageResult'
    candyMachineUpload: 'CandyMachineUploadResult'
    createFanout: 'CreateFanoutResult'
    disperseFanout: 'DisperseFanoutResult'
    mintNft: 'MintNftResult'
    updateNft: 'UpdateNftResult'
  }
  Query: { // field return type name
    candyMachineUploadLogs: 'CandyMachineUploadLogsResult'
  }
  SplFanout: { // field return type name
    splTokenAddress: 'String'
    splTokenWallet: 'String'
  }
  UpdateNftResult: { // field return type name
    message: 'String'
    newUri: 'String'
    processId: 'String'
    success: 'Boolean'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    authenticatedMutation: { // args
      encryptedMessage: NexusGenInputs['EncryptedMessage']; // EncryptedMessage!
    }
    candyMachineUpload: { // args
      callbackUrl: string; // String!
      collectionMint: string; // String!
      config: NexusGenScalars['JSON']; // JSON!
      env: string; // String!
      filesZipUrl: string; // String!
      guid?: string | null; // String
      keyPair: string; // String!
      rpc: string; // String!
      setCollectionMint: boolean; // Boolean!
      useHiddenSettings: boolean; // Boolean!
    }
    createFanout: { // args
      keyPair: string; // String!
      members: Array<NexusGenInputs['FanoutMember'] | null>; // [FanoutMember]!
      name: string; // String!
      splTokenAddresses?: Array<string | null> | null; // [String]
    }
    disperseFanout: { // args
      fanoutPublicKey: string; // String!
      keyPair: string; // String!
      splTokenAddresses?: Array<string | null> | null; // [String]
    }
    mintNft: { // args
      keyPair: string; // String!
      mintToAddress?: string | null; // String
      nftMetadata?: NexusGenInputs['NftMetadata'] | null; // NftMetadata
      nftMetadataJSON?: NexusGenScalars['File'] | null; // File
    }
    updateNft: { // args
      cluster: string; // String!
      newMetadataJson?: NexusGenInputs['NftMetadata'] | null; // NftMetadata
      newUri?: string | null; // String
      nftMintId: string; // String!
      payer: string; // String!
      updateAuthority: string; // String!
    }
  }
  Query: {
    candyMachineUploadLogs: { // args
      processId: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}