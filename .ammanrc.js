const path = require("path");

const { LOCALHOST, tmpLedgerDir } = require('@metaplex-foundation/amman');

const WSLOCALHOST = "ws://localhost:8900/";

module.exports = {
  validator: {
    killRunningValidators: true,
    verifyFees: false,
    commitment: "confirmed",
    jsonRpcUrl: LOCALHOST,
    websocketUrl: WSLOCALHOST,
    resetLedger: true,
    detached: false,
    programs: [], // can specify local programs here
    // Remote `accounts` are loaded from this cluster by default
    // can be overriden
    accountsCluster: 'https://api.metaplex.solana.com',
    accounts: [
      {
        label: 'Fanout',
        accountId: 'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg',
        executable: true
      },
      {
        label: 'Token Metadata Program',
        accountId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        executable: true
      }
    ],
  },
  storage: {
    enabled: true,
    storageId: 'amman-mock-storage',
    clearOnStart: true
  },
  relay: {
    enabled: true,
    killRunningRelay: true
  }
};