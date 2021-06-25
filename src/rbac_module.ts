import { BaseModule, AfterBlockApplyContext, AfterGenesisBlockApplyContext, GenesisConfig, StateStore, codec } from 'lisk-sdk';

import { createRulesetRecord, hasPermission, isHexString, loadRBACRuleset } from './utils';
import { readRBACPermissionsObject, readRBACRolesObject, readRBACRulesetObject, writeDefaultRBACRolesPermissions, writeRBACPermissionsObject, writeRBACRolesObject, writeRBACRulesetObject, writeRBACRulesetVersionObject } from './rbac_db';
import { rbacAccountPropsSchema, RBACAccountProps, RBACRolesPropsSchema, RBACRolesProps, RBACPermissionsProps, RBACPermissionsPropsSchema, RBACAccountRoleItem, RBACRuleset, RBACRulesetSchema, RBACRulesetRecordSchema, RBACRulesetRecord, RBACRoleRecordSchema } from './data';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, RBAC_PERMISSIONS_STATESTORE_KEY, RBAC_ROLES_STATESTORE_KEY, RBAC_RULESET_STATESTORE_KEY, RBAC_RULESET_VERSIONS_STATESTORE_KEY } from './constants';

import { AssignRoleAsset, CreateRoleAsset, UpdateRoleAsset, DeleteRoleAsset, AssociatePermissionsAsset, RemovePermissionsAsset } from './assets';

import RBAC from './rbac-algorithm/algorithm';

export class RbacModule extends BaseModule {

  public actions = {
    getSolverRuleset: async (): Promise<Record<string, unknown>> => Promise.resolve(this.RBACSolver.getRules()),
    getRoles: async (): Promise<Record<string, unknown>> => {
      const rolesBuffer = await this._dataAccess.getChainState(RBAC_ROLES_STATESTORE_KEY);

      if (!rolesBuffer) {
        return Promise.reject(new Error("No roles list available in stateStore."));
      }

      const roles = codec.decode<RBACRolesProps>(RBACRolesPropsSchema, rolesBuffer)

      return Promise.resolve(codec.toJSON(RBACRolesPropsSchema, roles));
    },
    getRole: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => {
      const { id } = params;

      const rolesListBuffer = await this._dataAccess.getChainState(RBAC_ROLES_STATESTORE_KEY);

      if (!rolesListBuffer) {
        return Promise.reject(new Error("No roles list available in stateStore."));
      }

      const rolesList = codec.decode<RBACRolesProps>(RBACRolesPropsSchema, rolesListBuffer)

      // 1. Verify that role with the sent id does exist
      const roleRecord = rolesList.roles.find(elem => id === elem.id);
      if (!roleRecord) {
        throw new Error(`Role with id '${id as string}' does not exist.`);
      }

      return Promise.resolve(codec.toJSON(RBACRoleRecordSchema, roleRecord));
    },
    getPermissions: async (): Promise<Record<string, unknown>> => {
      const permissionsBuffer = await this._dataAccess.getChainState(RBAC_PERMISSIONS_STATESTORE_KEY);

      if (!permissionsBuffer) {
        return Promise.reject(new Error("No permissions list available in stateStore."));
      }

      const permissions = codec.decode<RBACPermissionsProps>(RBACPermissionsPropsSchema, permissionsBuffer)

      return Promise.resolve(codec.toJSON(RBACPermissionsPropsSchema, permissions));
    },
    getActiveRuleset: async (): Promise<Record<string, unknown>> => {
      const rulesetBuffer = await this._dataAccess.getChainState(RBAC_RULESET_STATESTORE_KEY);

      if (!rulesetBuffer) {
        return Promise.reject(new Error("No ruleset available in stateStore."));
      }

      const ruleset = codec.decode<RBACRuleset>(RBACRulesetSchema, rulesetBuffer)

      return Promise.resolve(codec.toJSON(RBACRulesetRecordSchema, ruleset.ruleset));
    },
    getRulesetByVersion: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => {
      const { version } = params;

      if (!version) {
        return Promise.reject(new Error("No version provided."));
      }

      const rulesetBuffer = await this._dataAccess.getChainState(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${version as string}`);

      if (!rulesetBuffer) {
        return Promise.reject(new Error(`Ruleset version '${version as string}' does not exist.`));
      }

      const ruleset = codec.decode<RBACRulesetRecord>(RBACRulesetRecordSchema, rulesetBuffer)

      return Promise.resolve(codec.toJSON(RBACRulesetRecordSchema, ruleset));
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
    new DeleteRoleAsset(),
    new AssociatePermissionsAsset(),
    new RemovePermissionsAsset(),
  ];

  public accountSchema = rbacAccountPropsSchema;

  private RBACSolver: RBAC = new RBAC;
  private readonly assetIDsRequiringRBACReload = [1, 2, 3, 4, 5];

  public constructor(genesisConfig: GenesisConfig) {
    super(genesisConfig);
  }

  // Lifecycle hooks
  public async afterBlockApply(_input: AfterBlockApplyContext): Promise<void> {

    // 1. Determine if one of the transactions from the current block belong to this module 
    //    and if any of these transactions require a reload of the RBAC solver.
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

    // 2. In case there were RBAC admin transactions in this block, generate new ruleset version, reload solver
    if (RbacReloadRequired) {
      const roles = await readRBACRolesObject(_input.stateStore);
      const permissions = await readRBACPermissionsObject(_input.stateStore);
      const rulesetsObj = await readRBACRulesetObject(_input.stateStore);

      if (rulesetsObj && roles && permissions) {
        const newRulesetVersion = createRulesetRecord(roles, permissions, _input.block.header.id, rulesetsObj.latestVersion + 1)

        await writeRBACRulesetVersionObject(_input.stateStore, newRulesetVersion)

        // In case activeVersion was set to latestVersion, increment it as well
        if (rulesetsObj.activeVersion === rulesetsObj.latestVersion) {
          rulesetsObj.activeVersion = newRulesetVersion.version;
          rulesetsObj.latestVersion = newRulesetVersion.version;
          rulesetsObj.ruleset = newRulesetVersion;
        } else {
          rulesetsObj.latestVersion = newRulesetVersion.version;
        }

        await writeRBACRulesetObject(_input.stateStore, rulesetsObj)
      }
    }

    // 3. Load active ruleset into RBACSolve; this only happens when ruleset was updated through a transaction in this block
    const activeRuleset = await readRBACRulesetObject(_input.stateStore);
    if (activeRuleset) {
      this.RBACSolver = loadRBACRuleset(activeRuleset.ruleset);
    }
  }

  public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext): Promise<void> {

    const genesisRbacRulesetVersion = 0;
    const genesisRbacRulesetRecord = createRulesetRecord(DEFAULT_ROLES, DEFAULT_PERMISSIONS, _input.genesisBlock.header.id, genesisRbacRulesetVersion)

    // write DEFAULT_ROLES and DEFAULT_PERMISSIONS to stateStore
    await writeDefaultRBACRolesPermissions(_input.stateStore, DEFAULT_ROLES, DEFAULT_PERMISSIONS)

    // Write first database entries for roles/permissions/rulesets
    await writeRBACRolesObject(_input.stateStore, DEFAULT_ROLES);
    await writeRBACPermissionsObject(_input.stateStore, DEFAULT_PERMISSIONS);
    await writeRBACRulesetVersionObject(_input.stateStore, genesisRbacRulesetRecord);
    await writeRBACRulesetObject(_input.stateStore, { ruleset: genesisRbacRulesetRecord, activeVersion: genesisRbacRulesetVersion, latestVersion: genesisRbacRulesetVersion });

    // Load initial ruleset into RBACSolver
    this.RBACSolver = loadRBACRuleset(genesisRbacRulesetRecord);
  }
}
