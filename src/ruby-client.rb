#Imports
#====================================================================================
#require 'graphql-client'
#require 'graphql/client/http'
require 'graphlient'
require 'base58'
require 'tweetnacl'
#require 'File'
require 'json'
#require 'Random'
require 'dotenv'
Dotenv.load('../.env')
puts "Starting Client"

#Methods
#====================================================================================
def getNaCLKeyPair(fileName)
  publicKeyB58 = ""
  privateKeyB58 = ""
  keyFileExists = File.file?(fileName);
  puts keyFileExists
  if !keyFileExists
    puts "start"
    keypair = TweetNaCl.crypto_box_keypair()
    puts "after"
    publicKeyB58, privateKeyB58 = TweetNaCl.crypto_box_keypair()
    puts "next"
    publicKeyB58 = Base58.int_to_base58(publicKeyB58)
    privateKeyB58 = Base58.int_to_base58(privateKeyB58)
    tempHash = { publicKey: publicKeyB58, privateKey: privateKeyB58 }
    puts "vars done"
    keyFile = File.open('../key.json', 'w')
    puts "File opened"
    keyFile.write('../key.json', tempHash.to_json)
    keyFile.close()
    puts "File written"
  else 
    keyFile = File.open(fileName)
    data = JSON.load(keyFile)
    keyFile.close
    publicKeyB58 = data.publicKey
    privateKeyB58 = data.privateKey
    puts "File read"
  end
  return publicKeyB58, privateKeyB58
end

def encryptPayload (payload, peerPublicKeyB58, myPrivateKeyB58)
  nonce = Random.new.bytes(24);
  box = TweetNaCl.crypto_box(payload,nonce, Base58.base58_to_int(peerPublicKeyB58), Base58.base58_to_int(myPrivateKeyB58))
  puts "Encryption successful"
  return Base58.int_to_base58(nonce), Base58.int_to_base58(box)
end

def boxKeyFile(peerPublicKeyB58, keyFilePath)
  solanaKeyFile = File.open(keyFilePath)
  solanaKeyFileContents = solanaKeyFile.read()
  solanaKeyFile.close()
  puts "Got contents"
  keyPair = getNaCLKeyPair('../key.json')
  puts "Got keypair"
  boxedMessage = encryptPayload(solanaKeyFileContents, peerPublicKeyB58, keyPair[1])
  puts "Got Payload"
  return boxedMessage[1], boxedMessage[0], clientPublicKey: keyPair[0]
end

puts "getting box key"

bkf = boxKeyFile('4tieZ9Pst1TRUeCpeNeaXgraNbZSLnKrzgPJjeRVMsgj', '../FTRY1THFYyV8tBV39aiRkdx8xNYvLiEr4xB8k4R8u4op.json')
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
      'Authorization' => 'Bearer ${ENV[HASURA_ADMIN_SECRET]}'
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