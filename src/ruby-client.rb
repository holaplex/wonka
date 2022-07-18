# Command line order:
# Keypair, Config, Zip File

#Imports
#====================================================================================
require 'graphql/client'
require 'graphql/client/http'
require 'json'
puts "Starting Client"

#Vars
#====================================================================================

argKeyPair = ARGV[0]
argConfig = ARGV[1]
argZipFile = ARGV[2]

filesZipUrl = argZipFile

keypairFile = File.open(argKeyPair)
keypairContents = keypairFile.read()
keypairFile.close()
keypair = JSON.parse(keypairContents)

configJSONFile = File.open(argConfig)
configJSONContents = configJSONFile.read()
configJSONFile.close()
configJSON = JSON.parse(configJSONContents)

callbackUrl = 'http://localhost:3000/'
guid = nil
env = 'devnet'
rpc = 'https://autumn-falling-bush.solana-devnet.quiknode.pro/d780e0b6a44a10fbe4982403eb88b4e58cfaa78a/'
collectionMint = 'J9JByPaQD6JNBHm25uNCtw6Xjqnb gnfMYU7Tw6b7ts7t'
setCollectionMint = true

#Server/Query
#========================================================================================
http = GraphQL::Client::HTTP.new('http://127.0.0.1:4000/graphql')
schema = GraphQL::Client.load_schema(http)
client = GraphQL::Client.new(schema: schema, execute: http)

puts "Connection established"
Query = client.parse <<~'GRAPHQL'
mutation(
  $keyPair: String!,
  $callbackUrl: String!,
  $config: JSON!,
  $collectionMint: String!,
  $setCollectionMint: Boolean!,
  $filesZipUrl: String!,
  $guid: String,
  $rpc: String!,
  $env: String!
) {
  candyMachineUpload(
    keyPair: $keyPair,
    callbackUrl: $callbackUrl,
    config: $config,
    collectionMint: $collectionMint,
    setCollectionMint: $setCollectionMint,
    filesZipUrl: $filesZipUrl,
    guid: $guid,
    rpc: $rpc,
    env: $env
  ) {
    processId
  }
}
GRAPHQL

variables = {
  keyPair: keypair,
  callbackUrl: callbackUrl,
  config: configJSON,
  collectionMint: collectionMint,
  setCollectionMint: setCollectionMint,
  filesZipUrl: filesZipUrl,
  guid: guid,
  rpc: rpc,
  env: env,
}

puts "Sending Query"
result = client.query(Query, variables: variables)
puts result