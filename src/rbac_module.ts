import {
  BaseModule,
  AfterBlockApplyContext,
  TransactionApplyContext,
  BeforeBlockApplyContext,
  AfterGenesisBlockApplyContext,
  GenesisConfig,
  StateStore
} from 'lisk-sdk';

import { rbacAccountPropsSchema, RBACAccountProps } from './data';
import RBAC from './rbac-algorithm/algorithm';
import { AssignRoleAsset } from './assets/assign_role';
import { createRuleset, loadRBACRuleset } from './utils';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './constants';

export class RbacModule extends BaseModule {

  public actions = {
    getRuleset: async (): Promise<Record<string, unknown>> => Promise.resolve(this.RBACSolver.getRules()),
  };
  public reducers = {
    // Example below
    // getBalance: async (
    // 	params: Record<string, unknown>,
    // 	stateStore: StateStore,
    // ): Promise<bigint> => {
    // 	const { address } = params;
    // 	if (!Buffer.isBuffer(address)) {
    // 		throw new Error('Address must be a buffer');
    // 	}
    // 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
    // 	return account.token.balance;
    // },
    getAccountRoles: async (params: Record<string, unknown>, stateStore: StateStore): Promise<Buffer[]> => {
      const { address } = params;
      if (!Buffer.isBuffer(address)) {
        throw new Error('Address must be a buffer');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const account = await stateStore.account.getOrDefault<RBACAccountProps>(address);
      return account.rbac.roles;
    }

    
  };

  public name = 'rbac';
  public id = 7222;

  public transactionAssets = [
    new AssignRoleAsset(),
  ];

  public events = [
    // Example below
    // 'rbac:newBlock',
  ];
  public accountSchema = rbacAccountPropsSchema;

  private readonly RBACSolver: RBAC;

  public constructor(genesisConfig: GenesisConfig) {
    super(genesisConfig);

    this.RBACSolver = loadRBACRuleset(createRuleset(DEFAULT_ROLES, DEFAULT_PERMISSIONS, "genesis", BigInt(1)))
  }

  // Lifecycle hooks
  public async beforeBlockApply(_input: BeforeBlockApplyContext) {
    // Get any data from stateStore using block info, below is an example getting a generator
    // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
    // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
  }

  public async afterBlockApply(_input: AfterBlockApplyContext) {
    // Get any data from stateStore using block info, below is an example getting a generator
    // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
    // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
  }

  public async beforeTransactionApply(_input: TransactionApplyContext) {
    // Get any data from stateStore using transaction info, below is an example
    // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
  }

  public async afterTransactionApply(_input: TransactionApplyContext) {
    // Get any data from stateStore using transaction info, below is an example
    // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
  }

  public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
    // Get any data from genesis block, for example get all genesis accounts
    // const x = genesisBlock.header.asset.accounts;
  }
}
