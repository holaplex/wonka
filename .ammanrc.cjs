// @ts-check
"use strict";
const path = require("path");

import { LOCALHOST, tmpLedgerDir } from '@metaplex-foundation/amman'

const WSLOCALHOST = "ws://localhost:8900/";

module.exports = {
  validator: {
    killRunningValidators: true,
    verifyFees: false,
    commitment: "confirmed",
    jsonRpcUrl: LOCALHOST,
    websocketUrl: WSLOCALHOST,
    ledgerDir: tmpLedgerDir(),
    resetLedger: true,
    detached: false,
    programs: [/* Can specify locally built programs to deploy here */],
    accountsCluster: 'https://api.metaplex.solana.com', // cluster to load accounts from
    accounts: [
      {
        label: 'Fanout',
        accountId: 'hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg',
        executable: true,
      }
    ],
  },
  storage: {
    enabled: true,
    storageId: 'mock-storage',
    clearOnStart: true,
  },
  relay: {
    enabled: true,
    killRunningRelay: true,
  }
};