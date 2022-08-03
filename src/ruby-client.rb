# Command line order:
# Keypair, Config, Zip File

#Imports
#====================================================================================
require 'graphql/client'
require 'graphql/client/http'
require 'json'
require 'base58'
puts "Starting Client"

#Vars
#====================================================================================

argKeyPair = ARGV[0]
argConfig = ARGV[1]
argZipFile = ARGV[2]

filesZipUrl = argZipFile
puts filesZipUrl

keypairFile = File.open(argKeyPair)
keypairContents = keypairFile.read()
keypairFile.close()
puts keypairContents
keyPair = Base58.binary_to_base58(JSON.parse(keypairContents).pack('c*'), :bitcoin, true).chomp
puts keyPair


configJSONFile = File.open(argConfig)
configJSONContents = configJSONFile.read()
configJSONFile.close()
configJSON = JSON.parse(configJSONContents)

callbackUrl = 'http://localhost:3000/'
guid = nil
env = 'devnet'
rpc = 'https://autumn-falling-bush.solana-devnet.quiknode.pro/d780e0b6a44a10fbe4982403eb88b4e58cfaa78a/'
collectionMint = 'FTRY1THFYyV8tBV39aiRkdx8xNYvLiEr4xB8k4R8u4op'
setCollectionMint = true

#Server/Query
#========================================================================================
puts 'connecting'
httpConnect = GraphQL::Client::HTTP.new('http://127.0.0.1:4000/graphql')
puts 'connected, loading schema'
schemaRemote = GraphQL::Client.load_schema(httpConnect)
puts 'finalizing'
client = GraphQL::Client.new(schema: schemaRemote, execute: httpConnect)

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
  keyPair: keyPair,
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
puts result.data.candy_machine_upload.process_id