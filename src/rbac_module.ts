import {
  AfterBlockApplyContext,
  AfterGenesisBlockApplyContext,
  BaseModule,
  GenesisConfig
} from 'lisk-sdk';
import {
  getAccountPermissionsAction,
  getAccountRolesAction,
  getPermissionsAction,
  getRoleAccountsAction,
  getRoleAction,
  getRolePermissionsAction,
  getRolesAction,
  hasPermissionAction
} from './actions';
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
  afterBlockApplyLifecycleHook,
  afterGenesisBlockApplyLifecycleHook
} from './lifecycle_hooks';
import { RBACEngine } from './rbac_algorithm';
import {
  GenesisAccountsType,
  rbacAccountPropsSchema,
  RBACAccountRoleItem,
  RBACPermissionRecord
} from './schemas';

export class RbacModule extends BaseModule {

  public actions = {
    // getSolverRuleset: async (): Promise<Record<string, unknown>> => Promise.resolve(this.RBACSolver.getRules()),
    getRole: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRoleAction(params.id as string, this._dataAccess),
    getRoles: async (): Promise<Record<string, unknown>> => getRolesAction(this._dataAccess),
    getRoleAccounts: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRoleAccountsAction(params.id as string, this._dataAccess),
    getRolePermissions: async (params: Record<string, unknown>): Promise<RBACPermissionRecord[]> => getRolePermissionsAction(params.id as string, this._dataAccess, this.RBACSolver),
    getPermissions: async (): Promise<Record<string, unknown>> => getPermissionsAction(this._dataAccess),
    // getActiveRuleset: async (): Promise<Record<string, unknown>> => getActiveRulesetAction(this._dataAccess),
    // getRulesetByVersion: async (params: Record<string, unknown>): Promise<Record<string, unknown>> => getRulesetByVersionAction(params.version as string, this._dataAccess),
    hasPermission: async (params: Record<string, unknown>): Promise<boolean> => hasPermissionAction(params.address as string, params.resource as string, params.operation as string, this._dataAccess, this.RBACSolver),
    getAccountRoles: async (params: Record<string, unknown>): Promise<RBACAccountRoleItem[]> => getAccountRolesAction(params.address as string, this._dataAccess),
    getAccountPermissions: async (params: Record<string, unknown>): Promise<RBACPermissionRecord[]> => getAccountPermissionsAction(params.address as string, this._dataAccess, this.RBACSolver)
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

  private RBACSolver: RBACEngine = new RBACEngine;
  private readonly assetIDsRequiringRBACReload: number[] = [
    1, /* CreateRoleAsset */
    2, /* UpdateRoleAsset */
    3, /* DeleteRoleAsset */
    4, /* AssociatePermissionsAsset */
    5  /* RemovePermissionsAsset */
  ];
  private readonly genesisRbacAccounts: GenesisAccountsType;

  public constructor(genesisConfig: GenesisConfig) {
    super(genesisConfig);

    this.genesisRbacAccounts = genesisConfig.rbacConfig as GenesisAccountsType;
  }

  // Lifecycle hooks
  public async afterBlockApply(_input: AfterBlockApplyContext): Promise<void> {
    this.RBACSolver = await afterBlockApplyLifecycleHook(this.id, this.assetIDsRequiringRBACReload, this.RBACSolver, _input)
  }

  public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext): Promise<void> {
    this.RBACSolver = await afterGenesisBlockApplyLifecycleHook(this.genesisRbacAccounts, _input);
  }
}
