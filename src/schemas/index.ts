export * from './account_props'
export * from './assets/roles/roles_create'
export * from './assets/roles/roles_update'
export * from './assets/roles/roles_delete'
export * from './assets/permissions/permission_associate'
export * from './assets/permissions/permission_remove'
export * from './assets/role_membership/role_membership_remove'
export * from './assets/role_membership/role_membership_assign'
export * from './http-api/roles'
export * from './rbac_db'

export type GenesisAccountsType = {
  genesisAccounts: [{
    roles: string[]; 
    addresses: string[];
  }];
}