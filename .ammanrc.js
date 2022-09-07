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
    // remote `accounts` are loaded from this cluster by default
    // can be overriden on a per account basis
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
      },
      {
        label: 'Candy Machine Program',
        accountId: 'cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ',
        executable: true,
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