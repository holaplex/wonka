# Wonka 🍬 🏭 🥇

This is your golden ticket to Solana NFs. 

Tech Stack:

- Typescript
- Yoga GraphQL

## Getting Started

Wonka is easy to setup and use or deploy to your own infrastructure.

1. Clone the repo
2. `cd` into the folder
3. Install dependencies with `yarn install`
4. Edit `.env` with the sample below
5. Run it with `yarn dev`


`.env`
```
HASURA_GRAPHQL_ENDPOINT=
HASURA_ADMIN_SECRET=
PORT=
SERVER_PUBLIC_KEY=
SERVER_PRIVATE_KEY=
APP_ENV=development
```


## Try it out.
Wonka is currently live and available for your use at https://wonka.holaplex.tools

## Create a Production Build 

To create a production ready build use `yarn build`. Build files can be found in `.next`.

Detailed documentation can be found at https://nextjs.org/docs/deployment#nextjs-build-api

## What can Wonka do for you?


# Create Metaplex CandyMachine v2s
  Send the following mutation to create a CandyMachineV2

  ```
  candyMachineUpload(
    callbackUrl: <URL to POST to when candymachine is complete>,
    collectionMint: <COLLECTION MINT for CANDY MACHINE>,
    config: <JSON config compatible with SUGAR CLI, see below>,
    env: <MAINNET or DEVNET>,
    filesZipUrl: <URI of zip file that contains assets>,
    keyPair: <FULL KEYPAIR>,
    rpc: <PASS IN AN RPC URL>,
    setCollectionMint: <BOOL, set to true if you are passing a collection>
  )

  Example JSON config
   {
    "price": 0.1,
    "number": $ITEMS,
    "symbol": "TEST",
    "sellerFeeBasisPoints": 500,
    "gatekeeper": null,
    "solTreasuryAccount": "$(solana address)",
    "splTokenAccount": null,
    "splToken": null,
    "goLiveDate": "$(date "+%Y-%m-%dT%T%z" | sed "s@^.\{22\}@&:@")",
    "endSettings": null,
    "whitelistMintSettings": null,
    "hiddenSettings": $HIDDEN_SETTINGS,
    "uploadMethod": "${STORAGE}",
    "ipfsInfuraProjectId": "${INFURA_ID}",
    "ipfsInfuraSecret": "${INFURA_SECRET}",
    "awsConfig": {
        "bucket": "${AWS_BUCKET}",
        "profile": "${AWS_PROFILE}",
        "directory": "${AWS_DIRECTORY}"
    },
    "nftStorageAuthToken": "${NFT_STORAGE_TOKEN}",
    "shdwStorageAccount": $SHDW,
    "retainAuthority": true,
    "isMutable": true,
    "creators": [
    {
      "address": "$(solana address)",
      "share": 100
    }
  ]
}
  ```

After you send this mutation, Wonka will begin provisioning your candy machine, this can take a while. When wonka is done, it will ping the callback url with 
```{ candyMachineAddress }```

# Create NFTs with the mintTo instruction

  Send the following mutation to mint a new NFT to a specific account
  ```  
  mintNft(
    mintToAddress: <ADDRESS OF NFT RECIPIENT>,
    nftMetadata: <JSON OF ONCHAIN NFT METADATA>,
    nftMetadataJSON: <JSON of OFFCHAIN METADATA>,
    keyPair: <FULL SOLANA KEYPAIR>
  )
  ```
  This will mint an NFT and upload the included JSON. Once its complete, the NFT is minted to the passed `mintToAddress`.


# Update NFTs
  Updating NFTs is nearly as easy as creating them! 

  Send the following mutation for a given NFT to change its json or on-chain data.

  ```
    updateNft(
      nftMintId: <MINT HASH OF NFT>, 
      updateAuthority: <FULL KEYPAIR of UPDATE AUTHORITY>,
      newUri: <NEW METADATA URI>, 
      payer: <FULL KEYPAIR OF PAYER>,
      newMedataJson: <NEW JSON METADATA>,
      )
  ```
  The response includes the new JSON uri of the metadata.
# Create fanout wallets!
  Hydra is an metaplex protocol that supports distributing tokens to multiple wallets automatically. 
  This API lets you create fanout wallets and distribute funds to them without having to sign transactions in the browser.

  ```
  createFanout(
    keyPair: <KEYPAIR Of FANOUT WALLET OWNER>,
    name: <NAME OF FANOUT WALLET>,
    splTokenAddresses: <Token mint addresses for which the fanout will create token accounts to distribute from, leave empty for a native SOL only fanout>
    members: LIST OF MEMBERS, e.g. [
      {
        publicKey: <PUBKEY OF MEMBER>,
        shares: <SHARE of total proceeds from each distribution, must add up to 100>
      }

    ]
  )
  ```
