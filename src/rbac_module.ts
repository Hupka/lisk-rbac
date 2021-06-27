import {
  AfterBlockApplyContext,
  AfterGenesisBlockApplyContext,
  BaseModule, GenesisConfig
} from 'lisk-sdk';
import { getAccountRolesAction, getActiveRulesetAction, getPermissionsAction, getRoleAccountsAction, getRoleAction, getRolesAction, getRulesetByVersionAction, hasPermissionAction } from './actions';
import {
  AssignRoleMembershipAsset,
  AssociatePermissionsAsset,
  CreateRoleAsset,
  DeleteRoleAsset,
  RemovePermissionsAsset,
  RemoveRoleMembershipAsset,
  UpdateRoleAsset
} from './assets';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES
} from './constants';
import RBAC from './rbac-algorithm/algorithm';
import {
  readRBACPermissionsObject,
  readRBACRolesObject,
  readRBACRulesetObject,
  writeDefaultRBACRolesPermissions,
  writeDefaultRoleAccountsTables,
  writeGenesisAccountsRoles,
  writeRBACPermissionsObject,
  writeRBACRolesObject,
  writeRBACRulesetObject,
  writeRBACRulesetVersionObject
} from './rbac_db';
import {
  rbacAccountPropsSchema,
  RBACAccountRoleItem
} from './schemas';
import {
  createRulesetRecord, loadRBACRuleset
} from './utils';

export class RbacModule extends BaseModule {

  public actions = {
    getSolverRuleset: async (): Promise<Record<string, unknown>> => Promise.resolve(this.RBACSolver.getRules()),
    getRoles: async (): Promise<Record<string, unknown>> => getRolesAction(this._dataAccess),
    getRole: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRoleAction(params.id as string, this._dataAccess),
    getRoleAccounts: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRoleAccountsAction(params.id as string, this._dataAccess),
    getPermissions: async (): Promise<Record<string, unknown>> => getPermissionsAction(this._dataAccess),
    getActiveRuleset: async (): Promise<Record<string, unknown>> => getActiveRulesetAction(this._dataAccess),
    getRulesetByVersion: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRulesetByVersionAction(params.version as string, this._dataAccess),
    hasPermission: async (params: Record<string, unknown>): Promise<boolean> => hasPermissionAction(params.address as string, params.resource as string, params.operation as string, this._dataAccess, this.RBACSolver),
    getAccountRoles: async (params: Record<string, unknown>): Promise<RBACAccountRoleItem[]> => getAccountRolesAction(params.address as string, this._dataAccess)
  };
  public reducers = {
    getAccountRoles: async (params: Record<string, unknown>): Promise<RBACAccountRoleItem[]> => getAccountRolesAction(params.address as Buffer, this._dataAccess),
    hasPermission: async (params: Record<string, unknown>): Promise<boolean> => hasPermissionAction(params.address as Buffer, params.resource as string, params.operation as string, this._dataAccess, this.RBACSolver),
    getRole: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRoleAction(params.id as string, this._dataAccess),
  };

  public name = 'rbac';
  public id = 7222;

  public transactionAssets = [
    new CreateRoleAsset(),
    new UpdateRoleAsset(),
    new DeleteRoleAsset(),
    new AssociatePermissionsAsset(),
    new RemovePermissionsAsset(),
    new AssignRoleMembershipAsset(),
    new RemoveRoleMembershipAsset(),
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
    await writeGenesisAccountsRoles(_input.stateStore);
    await writeDefaultRoleAccountsTables(_input.stateStore);

    // Write first database entries for roles/permissions/rulesets
    await writeRBACRolesObject(_input.stateStore, DEFAULT_ROLES);
    await writeRBACPermissionsObject(_input.stateStore, DEFAULT_PERMISSIONS);
    await writeRBACRulesetVersionObject(_input.stateStore, genesisRbacRulesetRecord);
    await writeRBACRulesetObject(_input.stateStore, { ruleset: genesisRbacRulesetRecord, activeVersion: genesisRbacRulesetVersion, latestVersion: genesisRbacRulesetVersion });

    // Load initial ruleset into RBACSolver
    this.RBACSolver = loadRBACRuleset(genesisRbacRulesetRecord);
  }
}
