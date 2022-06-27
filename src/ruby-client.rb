#Imports
#====================================================================================
#require 'graphql-client'
#require 'graphql/client/http'
require 'dotenv'
Dotenv.load('../.env')
require 'graphlient'
require 'tweetnacl'
#require 'File'
require 'json'
require 'multibases'
#require 'Random'
puts "Starting Client"

#Methods
#====================================================================================
def getNaCLKeyPair()
  publicKey = ENV['CLIENT_PUBLIC_KEY']
  privateKey = ENV['CLIENT_PRIVATE_KEY']
  publicKeyB58 = Multibases.pack('base58btc', publicKey)
  privateKeyB58 = Multibases.pack('base58btc', privateKey)
  return publicKeyB58, privateKeyB58
end

def encryptPayload (payload, peerPublicKey, myPrivateKeyB58)
  nonce = Random.new.bytes(24);
  puts "Start Encryption"
  box = TweetNaCl.crypto_box(payload, nonce, peerPublicKey, ENV['CLIENT_PRIVATE_KEY'])
  puts "Encryption successful"
  return Multibases.pack('base58btc', nonce), Multibases.pack('base58btc', box)
end

def boxKeyFile(peerPublicKey, keyFilePath)
  solanaKeyFile = File.open(keyFilePath)
  solanaKeyFileContents = solanaKeyFile.read()
  solanaKeyFile.close()
  puts "Got contents"
  keyPair = getNaCLKeyPair()
  puts "Got keypair"
  boxedMessage = encryptPayload(solanaKeyFileContents, peerPublicKey, keyPair[1])
  puts "Got Payload"
  return boxedMessage[1], boxedMessage[0], clientPublicKey: keyPair[0]
end

puts "getting box key"

bkf = boxKeyFile(ENV['SERVER_PUBLIC_KEY'], '../FTRY1THFYyV8tBV39aiRkdx8xNYvLiEr4xB8k4R8u4op.json')
box = bkf[0]
clientPublicKey = bkf[1]
nonce = bkf[2]

puts "test"

configJSONFile = File.open('../config.json')
configJSONContents = configJSONFile.read()
configJSONFile.close()
configJSON = JSON.parse(configJSONContents)
zipFileUrl = 'https://github.com/kevinrodriguez-io/stash/raw/master/assets.zip'
env = 'devnet'
rpc = 'https://autumn-falling-bush.solana-devnet.quiknode.pro/d780e0b6a44a10fbe4982403eb88b4e58cfaa78a/'
collection = 'J9JByPaQD6JNBHm25uNCtw6XjqnbgnfMYU7Tw6b7ts7t'
setCollectionMint = true

#Server/Query
#========================================================================================
Client = Graphlient::Client.new(ENV[HASURA_GRAPHQL_ENDPOINT],
    headers: {
      'Authorization' => 'Bearer ' + ENV['HASURA_ADMIN_SECRET'].to_s
    })

puts "connection established"
query = <<-GRAPHQL
mutation createCandyMachine(
  $config: JSON!
  $filesZipUrl: String!
  $encryptedKeypair: EncryptedMessage!
  $env: String!
  $rpc: String!
  $collectionMint: String!
  $setCollectionMint: Boolean!
) {
  candyMachineUpload(
    config: $config
    filesZipUrl: $filesZipUrl
    encryptedKeypair: $encryptedKeypair
    env: $env
    rpc: $rpc
    collectionMint: $collectionMint
    setCollectionMint: $setCollectionMint
  ) {
    processId
  }
}
GRAPHQL

variables = {
  config: configJSON,
    filesZipUrl: zipFileUrl,
    encryptedKeypair: {
      boxedMessage: box,
      nonce: nonce,
      clientPublicKey: clientPublicKey,
    },
    env: env,
    rpc: rpc,
    collectionMint: collection,
    setCollectionMint: setCollectionMint,
}
puts "sending query"
result = Client.query(query, variables)
puts result