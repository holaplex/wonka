# Command line order:
# Keypair, Config, Zip File

#Imports
#====================================================================================
#require 'graphql-client'
#require 'graphql/client/http'
require 'graphlient'
require 'json'
puts "Starting Client"

#Vars
#====================================================================================

argKeyPair = ARGV[0]
argConfig = ARGV[1]
argZipFile = ARGV[2]

keypairFile = File.open(argKeyPair)
keypairContents = keypairFile.read()
keypairFile.close()

configJSONFile = File.open(argConfig)
configJSONContents = configJSONFile.read()
configJSONFile.close()
configJSON = JSON.parse(configJSONContents)
callback = 'http://localhost:3000/'
guid = nil
env = 'devnet'
rpc = 'https://autumn-falling-bush.solana-devnet.quiknode.pro/d780e0b6a44a10fbe4982403eb88b4e58cfaa78a/'
collectionMint = 'J9JByPaQD6JNBHm25uNCtw6Xjqnb gnfMYU7Tw6b7ts7t'
setCollectionMint = true

#Server/Query
#========================================================================================
Client = Graphlient::Client.new(http://127.0.0.1:4000/graphql)

puts "connection established"
query = <<-GRAPHQL
mutation createCandyMachine(
  $keyPair: String!
  $callback: String
  $config: JSON!
  $collectionMint: String!
  $setCollectionMint: Boolean!
  $filesZipUrl: String!
  $guid: String
  $rpc: String!
  $env: String!
) {
  candyMachineUpload(
    keyPair: $keyPair
    callback: $callback
    config: $config
    collectionMint: $collectionMint
    setCollectionMint: $setCollectionMint
    filesZipUrl: $argZipFile
    guid: $guid
    rpc: $rpc
    env: $env
  ) {
    processId
  }
}
GRAPHQL

variables = {
  keyPair: keypairContents,
  callback: callback,
  config: configJSON,
  collectionMint: collection,
  setCollectionMint: setCollectionMint,
  filesZipUrl: zipFileUrl,
  guid: guid,
  rpc: rpc,
  env: env,
}

puts "sending query"
result = Client.query(query, variables)
puts result