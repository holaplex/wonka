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
  NftAttribute: { // input type
    trait_type?: string | null; // String
    value?: string | null; // String
  }
  NftFile: { // input type
    cdn?: boolean | null; // Boolean
    type?: string | null; // String
    uri?: string | null; // String
  }
  NftMetadata: { // input type
    animation_url: string; // String!
    attributes?: Array<NexusGenInputs['NftAttribute'] | null> | null; // [NftAttribute]
    description: string; // String!
    external_url: string; // String!
    image: string; // String!
    name: string; // String!
    properties?: NexusGenInputs['NftProperties'] | null; // NftProperties
    symbol: string; // String!
  }
  NftProperties: { // input type
    category?: string | null; // String
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
    logs: string; // String!
    processId: string; // String!
  }
  CandyMachineUploadResult: { // root type
    processId: string; // String!
  }
  EncryptedMessageResult: { // root type
    message: string; // String!
  }
  MintNftResult: { // root type
    message: string; // String!
  }
  Mutation: {};
  Query: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  CandyMachineUploadLogsResult: { // field return type
    logs: string; // String!
    processId: string; // String!
  }
  CandyMachineUploadResult: { // field return type
    processId: string; // String!
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
    mintNft: NexusGenRootTypes['MintNftResult'] | null; // MintNftResult
  }
  Query: { // field return type
    candyMachineUploadLogs: NexusGenRootTypes['CandyMachineUploadLogsResult'] | null; // CandyMachineUploadLogsResult
  }
}

export interface NexusGenFieldTypeNames {
  CandyMachineUploadLogsResult: { // field return type name
    logs: 'String'
    processId: 'String'
  }
  CandyMachineUploadResult: { // field return type name
    processId: 'String'
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
    mintNft: 'MintNftResult'
  }
  Query: { // field return type name
    candyMachineUploadLogs: 'CandyMachineUploadLogsResult'
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
    }
    mintNft: { // args
      encryptedMessage: NexusGenInputs['EncryptedMessage']; // EncryptedMessage!
      nftMetadata?: NexusGenInputs['NftMetadata'] | null; // NftMetadata
      nftMetadataJSON?: NexusGenScalars['File'] | null; // File
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