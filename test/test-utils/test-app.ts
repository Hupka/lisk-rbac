import { Application, configDevnet, genesisBlockDevnet, HTTPAPIPlugin, utils } from 'lisk-sdk';
import { DashboardPlugin } from '@liskhq/lisk-framework-dashboard-plugin';

import { RbacModule } from '../../src/rbac_module';

// PATCH genesis block for RBAC module
const updatedGenesisBlock = utils.objects.mergeDeep({}, genesisBlockDevnet);

updatedGenesisBlock.header.asset.accounts = updatedGenesisBlock.header.asset.accounts.map(a =>
  utils.objects.mergeDeep({}, a, {
    rbac: {
      roles: [],
    }
  }),
);

// Modify genesisConfig to include the genesis rbac admin accounts  as a custom parameter
const appConfig = utils.objects.mergeDeep({}, configDevnet, {
  label: 'lisk-rbac-test-app',
  rpc: {
    mode: 'ws',
    enable: true
  },
  logger: {
    fileLogLevel: "info",
    consoleLogLevel: "info",
    logFileName: "lisk.log"
  },
  genesisConfig: {
    rbacConfig: {
      genesisAccounts: [{
        roles: ["1"],
        addresses: ["9cabee3d27426676b852ce6b804cb2fdff7cd0b5"],
      },
      {
        roles: ["2"],
        addresses: ["463e7e879b7bdc6a97ec02a2a603aa1a46a04c80"],
      },
      {
        roles: ["3"],
        addresses: ["d04699e57c4a3846c988f3c15306796f8eae5c1c"],
      }]
    }
  },
  plugins: {
    httpApi: {
      port: 4000,
      whiteList: ['127.0.0.1'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
      },
      limits: {
        max: 0,
        delayMs: 0,
        delayAfter: 0,
        windowMs: 60000,
        headersTimeout: 5000,
        serverSetTimeout: 20000,
      },
    },
    dashboard: {
      applicationUrl: 'ws://localhost:8080/ws',
      port: 4005,
      host: '127.0.0.1',
      applicationName: 'Lisk',
    },
  }
});

const app = Application.defaultApplication(updatedGenesisBlock, appConfig);

app.registerModule(RbacModule);
app.registerPlugin(HTTPAPIPlugin);
app.registerPlugin(DashboardPlugin);

app.run().catch(console.error);