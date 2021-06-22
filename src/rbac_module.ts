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

import { rbacAccountPropsSchema, RBACAccountProps, RBACRolesPropsSchema, RBACRolesProps, RBACPermissionsProps, RBACPermissionsPropsSchema, RBACRulesetsSchema, RBACRulesets, RBACAccountRoleItem, } from './data';
import RBAC from './rbac-algorithm/algorithm';
import { AssignRoleAsset } from './assets/assign_role';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, RBAC_PERMISSIONS_STATESTORE_KEY, RBAC_ROLES_STATESTORE_KEY, RBAC_RULESETS_STATESTORE_KEY } from './constants';
import { CreateRoleAsset } from './assets/role_create';
import { createRulesetRecord, hasPermission, isHexString, loadRBACRuleset, readRBACPermissionsObject, readRBACRolesObject, readRBACRulesetsObject, writeRBACPermissionsObject, writeRBACRolesObject, writeRBACRulesetsObject } from './utils';
import { UpdateRoleAsset } from './assets/role_update';

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
    hasPermission: async (params: Record<string, unknown>): Promise<boolean> => {
      const { address, resource, operation } = params;

      if (typeof address === 'string' && !isHexString(address)) {
        throw new Error('Address parameter should be a hex string.');
      }

      if (typeof resource !== 'string' || typeof operation !== 'string') {
        throw new Error("Parameters 'resource' and 'operation' need to be of type string");
      }

      const account = await this._dataAccess.getAccountByAddress<RBACAccountProps>(Buffer.from(address as string, 'hex'));
      return hasPermission(account, resource, operation, this.RBACSolver);
    },
    getAccountRoles: async (params: Record<string, unknown>): Promise<RBACAccountRoleItem[]> => {
      const { address } = params;

      if (typeof address === 'string' && !isHexString(address)) {
        throw new Error('Address parameter should be a hex string.');
      }

      const account = await this._dataAccess.getAccountByAddress<RBACAccountProps>(Buffer.from(address as string, 'hex'));
      return account.rbac.roles;
    }
  };
  public reducers = {
    getAccountRoles: async (params: Record<string, unknown>, stateStore: StateStore): Promise<RBACAccountRoleItem[]> => {
      const { address } = params;
      if (!Buffer.isBuffer(address)) {
        throw new Error('Address must be a buffer');
      }
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

      const account = await stateStore.account.get<RBACAccountProps>(address);
      return hasPermission(account, resource, operation, this.RBACSolver);
    },
  };

  public name = 'rbac';
  public id = 7222;

  public transactionAssets = [
    new AssignRoleAsset(),
    new CreateRoleAsset(),
    new UpdateRoleAsset(),
  ];

  public events = [];
  public accountSchema = rbacAccountPropsSchema;

  private RBACSolver: RBAC = new RBAC;
  private readonly assetIDsRequiringRBACReload = [1,2];

  public constructor(genesisConfig: GenesisConfig) {
    super(genesisConfig);
  }

  // Lifecycle hooks
  public async beforeBlockApply(_input: BeforeBlockApplyContext): Promise<void> {
    // Get any data from stateStore using block info, below is an example getting a generator
    // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
    // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
  }

  public async afterBlockApply(_input: AfterBlockApplyContext): Promise<void> {

    // 1. Determine if one of the transactions from the current block belong to this module
    let RbacReloadRequired = false;
    for (const transaction of _input.block.payload) {
      if (transaction.moduleID !== this.id) {
        continue;
      }
      if (this.assetIDsRequiringRBACReload.includes(transaction.assetID)) {
        RbacReloadRequired = true;
        break;
      }
    }

    // 2. In case there were RBAC admin transactions in this block, reload solver, bump version
    if (RbacReloadRequired) {
      const roles = await readRBACRolesObject(_input.stateStore);
      const permissions = await readRBACPermissionsObject(_input.stateStore);

      if (roles && permissions) {
        const rulesetsObj = await readRBACRulesetsObject(_input.stateStore);
        if (rulesetsObj) {
          // In case activeVersion was set to latestVersion, increment it as well
          if (rulesetsObj.activeVersion === rulesetsObj.latestVersion) {
            rulesetsObj.activeVersion += 1;
          }
          rulesetsObj.latestVersion += 1;
          rulesetsObj.rulesets.push(createRulesetRecord(roles, permissions, _input.block.header.id, rulesetsObj.latestVersion));
          await writeRBACRulesetsObject(_input.stateStore, rulesetsObj)
        }
      }
    }

    // 3. Load active ruleset into RBACSolve; this only happens when ruleset was updated through a transaction in this block
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

    const genesisRbacRulesetVersion = 0;
    const genesisRbacRulesetRecord = createRulesetRecord(DEFAULT_ROLES, DEFAULT_PERMISSIONS, _input.genesisBlock.header.id, genesisRbacRulesetVersion)

    // Write first database entries for roles/permissions/rulesets after genesis block
    await writeRBACRolesObject(_input.stateStore, DEFAULT_ROLES);
    await writeRBACPermissionsObject(_input.stateStore, DEFAULT_PERMISSIONS);
    await writeRBACRulesetsObject(_input.stateStore, { rulesets: [genesisRbacRulesetRecord], activeVersion: genesisRbacRulesetVersion, latestVersion: genesisRbacRulesetVersion });

    // Load initial ruleset into RBACSolver
    this.RBACSolver = loadRBACRuleset(genesisRbacRulesetRecord);
  }
}
