import {
  BaseModule,
  AfterBlockApplyContext,
  TransactionApplyContext,
  BeforeBlockApplyContext,
  AfterGenesisBlockApplyContext,
  GenesisConfig,
  StateStore,
  codec,
} from 'lisk-sdk';

import { rbacAccountPropsSchema, RBACAccountProps, RBACRolesPropsSchema, RBACRolesProps, RBACPermissionsProps, RBACPermissionsPropsSchema, RBACRulesetsSchema, RBACRulesets, } from './data';
import RBAC from './rbac-algorithm/algorithm';
import { AssignRoleAsset } from './assets/assign_role';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, RBAC_PERMISSIONS_STATESTORE_KEY, RBAC_ROLES_STATESTORE_KEY, RBAC_RULESETS_STATESTORE_KEY } from './constants';
import { CreateRoleAsset } from './assets/role_create';
import { createRuleset, loadRBACRuleset, readRBACRulesetsObject, writeRBACPermissionsObject, writeRBACRolesObject, writeRBACRulesetsObject } from './utils';

export class RbacModule extends BaseModule {

  public actions = {
    getRBACSolverRuleset: async (): Promise<Record<string, unknown>> => Promise.resolve(this.RBACSolver.getRules()),
    getRolesList: async (): Promise<Record<string, unknown>> => {
      const rolesListBuffer = await this._dataAccess.getChainState(RBAC_ROLES_STATESTORE_KEY);

      if (!rolesListBuffer) {
        return Promise.reject(new Error("No roles list available in stateStore."));
      }

      const rolesList = codec.decode<RBACRolesProps>(RBACRolesPropsSchema, rolesListBuffer)

      return Promise.resolve(codec.toJSON(RBACRolesPropsSchema, rolesList));
    },
    getPermissionsList: async (): Promise<Record<string, unknown>> => {
      const permissionsListBuffer = await this._dataAccess.getChainState(RBAC_PERMISSIONS_STATESTORE_KEY);

      if (!permissionsListBuffer) {
        return Promise.reject(new Error("No permissions list available in stateStore."));
      }

      const permissionsList = codec.decode<RBACPermissionsProps>(RBACPermissionsPropsSchema, permissionsListBuffer)

      return Promise.resolve(codec.toJSON(RBACPermissionsPropsSchema, permissionsList));
    },
    getRulesetsList: async (): Promise<Record<string, unknown>> => {
      const rulesetsBuffer = await this._dataAccess.getChainState(RBAC_RULESETS_STATESTORE_KEY);

      if (!rulesetsBuffer) {
        return Promise.reject(new Error("No rulesets available in stateStore."));
      }

      const rulesets = codec.decode<RBACRulesets>(RBACRulesetsSchema, rulesetsBuffer)

      return Promise.resolve(codec.toJSON(RBACRulesetsSchema, rulesets));
    },
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
    getAccountRoles: async (params: Record<string, unknown>, stateStore: StateStore): Promise<string[]> => {
      const { address } = params;
      if (!Buffer.isBuffer(address)) {
        throw new Error('Address must be a buffer');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const account = await stateStore.account.getOrDefault<RBACAccountProps>(address);
      return account.rbac.roles;
    },
    hasPermission: async (params: Record<string, unknown>, stateStore: StateStore): Promise<boolean> => {
      const { address, resource, operation } = params;

      if (!Buffer.isBuffer(address)) {
        throw new Error('Address must be a buffer');
      }

      if (typeof resource !== 'string' || typeof operation !== 'string') {
        throw new Error("Parameters 'resource' and 'operation' need to be of type string");
      }

      const account = await stateStore.account.getOrDefault<RBACAccountProps>(address);
      const { roles } = account.rbac;

      for (const role of roles) {
        if (this.RBACSolver.can(role, resource, operation)) {
          return true;
        }
      }
      return false;
    }
  };

  public name = 'rbac';
  public id = 7222;

  public transactionAssets = [
    new AssignRoleAsset(),
    new CreateRoleAsset()
  ];

  public events = [];
  public accountSchema = rbacAccountPropsSchema;

  private RBACSolver: RBAC = new RBAC;

  public constructor(genesisConfig: GenesisConfig) {
    super(genesisConfig);
  }

  // Lifecycle hooks
  public async beforeBlockApply(_input: BeforeBlockApplyContext): Promise<void> {
    // Get any data from stateStore using block info, below is an example getting a generator
    // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
    // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async afterBlockApply(_input: AfterBlockApplyContext): Promise<void> {

    // Load active ruleset into RBACSolve; only happens when ruleset was updated through a transaction in this block
    const rbacRulesets = await readRBACRulesetsObject(_input.stateStore);
    if (rbacRulesets && rbacRulesets.activeVersion !== this.RBACSolver.version) {
      const activeRuleset = rbacRulesets?.rulesets.find((ruleset) => ruleset.version === rbacRulesets?.activeVersion)
      if (activeRuleset) {
        this.RBACSolver = loadRBACRuleset(activeRuleset);
      }
    }
  }

  public async beforeTransactionApply(_input: TransactionApplyContext): Promise<void> {
    // Get any data from stateStore using transaction info, below is an example
    // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
  }

  public async afterTransactionApply(_input: TransactionApplyContext): Promise<void> {
    // Get any data from stateStore using transaction info, below is an example
    // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
  }

  public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext): Promise<void> {

    const genesisRbacRulesetVersion = BigInt(0);
    const genesisRbacRulesetRecord = createRuleset(DEFAULT_ROLES, DEFAULT_PERMISSIONS, Buffer.from("genesis", "utf-8"), genesisRbacRulesetVersion)

    // Write first database entries for roles/permissions/rulesets after genesis block
    await writeRBACRolesObject(_input.stateStore, DEFAULT_ROLES);
    await writeRBACPermissionsObject(_input.stateStore, DEFAULT_PERMISSIONS);
    await writeRBACRulesetsObject(_input.stateStore, { rulesets: [genesisRbacRulesetRecord], activeVersion: genesisRbacRulesetVersion, latestVersion: genesisRbacRulesetVersion });

    // Load initial ruleset into RBACSolver
    this.RBACSolver = loadRBACRuleset(genesisRbacRulesetRecord);
  }
}
