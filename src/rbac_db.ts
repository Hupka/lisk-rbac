import { codec, StateStore } from "lisk-sdk";

import {
  RBACAccountProps,
  RBACAccountRoleItem,
  RBACPermissionsProps,
  rbacPermissionsPropsSchema,
  RBACRolesProps,
  rbacRolesPropsSchema,
  RBACRuleset,
  RBACRulesetRecord,
  rbacRulesetRecordSchema,
  rbacRulesetSchema,
  RoleAccounts,
  roleAccountsSchema
} from "./schemas"

import {
  DEFAULT_ROLES,
  GENESIS_ACCOUNTS,
  RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY,
  RBAC_DEFAULT_ROLES_STATESTORE_KEY,
  RBAC_PERMISSIONS_STATESTORE_KEY,
  RBAC_ROLES_STATESTORE_KEY,
  RBAC_ROLE_ACCOUNTS_STATESTORE_KEY,
  RBAC_ROLE_LIFECYCLE_ACTIVE,
  RBAC_RULESET_STATESTORE_KEY,
  RBAC_RULESET_VERSIONS_STATESTORE_KEY
} from "./constants";

export const readRBACRulesetObject = async (
  stateStore: StateStore
): Promise<RBACRuleset | undefined> => {
  const result = await stateStore.chain.get(RBAC_RULESET_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRuleset>(rbacRulesetSchema, result);
};

export const writeRBACRulesetObject = async (
  stateStore: StateStore,
  rulesets: RBACRuleset,
): Promise<void> => {
  await stateStore.chain.set(RBAC_RULESET_STATESTORE_KEY, codec.encode(rbacRulesetSchema, rulesets));
};

export const readRBACRulesetVersionObject = async (
  stateStore: StateStore,
  version: number
): Promise<RBACRulesetRecord | undefined> => {
  const result = await stateStore.chain.get(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${version}`);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRulesetRecord>(rbacRulesetRecordSchema, result);
};

export const writeRBACRulesetVersionObject = async (
  stateStore: StateStore,
  ruleset: RBACRulesetRecord
): Promise<void> => {
  await stateStore.chain.set(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${ruleset.version}`, codec.encode(rbacRulesetRecordSchema, ruleset));
};

export const readRBACRolesObject = async (
  stateStore: StateStore
): Promise<RBACRolesProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_ROLES_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRolesProps>(rbacRolesPropsSchema, result);
}

export const writeRBACRolesObject = async (
  stateStore: StateStore,
  roles: RBACRolesProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_ROLES_STATESTORE_KEY, codec.encode(rbacRolesPropsSchema, roles));
};

export const readRBACPermissionsObject = async (
  stateStore: StateStore
): Promise<RBACPermissionsProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_PERMISSIONS_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACPermissionsProps>(rbacPermissionsPropsSchema, result);
}

export const writeRBACPermissionsObject = async (
  stateStore: StateStore,
  permissions: RBACPermissionsProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_PERMISSIONS_STATESTORE_KEY, codec.encode(rbacPermissionsPropsSchema, permissions));
};

export const writeDefaultRBACRolesPermissions = async (
  stateStore: StateStore,
  roles: RBACRolesProps,
  permissions: RBACPermissionsProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY, codec.encode(rbacPermissionsPropsSchema, permissions));
  await stateStore.chain.set(RBAC_DEFAULT_ROLES_STATESTORE_KEY, codec.encode(rbacRolesPropsSchema, roles));
};

export const readDefaultRBACRolesObject = async (
  stateStore: StateStore
): Promise<RBACRolesProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_DEFAULT_ROLES_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRolesProps>(rbacRolesPropsSchema, result);
}

export const readDefaultRBACPermissionsObject = async (
  stateStore: StateStore
): Promise<RBACPermissionsProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACPermissionsProps>(rbacPermissionsPropsSchema, result);
}

export const writeGenesisAccountsRoles = async (
  stateStore: StateStore,
): Promise<void> => {
  for (const roleAccounts of GENESIS_ACCOUNTS) {
    for (const address of roleAccounts.addresses) {

      const account = await stateStore.account.get<RBACAccountProps>(Buffer.from(address, 'hex'));

      const allRoleIds = [...roleAccounts.roles, ...account.rbac.roles.map(x => x.id)]
      const allUniqueRoleIds = [...new Set(allRoleIds)]

      const rolesData = allUniqueRoleIds.map(elem => ({ id: elem, name: DEFAULT_ROLES.roles.find(x => x.id === elem)?.name }))
      const roles: RBACAccountRoleItem[] = [];
      for (const role of rolesData) {
        if (role.name !== undefined) {
          const roleItem: RBACAccountRoleItem = {
            id: role.id,
            name: role.name
          }

          roles.push(roleItem)
        }
      }

      account.rbac.roles = [...roles];
      await stateStore.account.set(account.address, account);
    }
  }
};

export const writeDefaultRoleAccountsTables = async (
  stateStore: StateStore
): Promise<void> => {
  // Create one stateStore entry for each default role
  for (const role of DEFAULT_ROLES.roles) {
    const roleAccounts: RoleAccounts = {
      id: role.id,
      addresses: [],
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE
    }

    // Iterate over all genesis accounts which get roles assigned
    for (const roleMemberships of GENESIS_ACCOUNTS) {
      // Check if any of the assigned roles math THIS loop's role id
      for (const roleMembershipsRole of roleMemberships.roles) {
        if (roleMembershipsRole === role.id) {
          // If thats the case add all accounts of this entry
          for (const account of roleMemberships.addresses) {
            roleAccounts.addresses.push(Buffer.from(account, 'hex'))
          }
        }
      }
    }

    if (roleAccounts.addresses.length < role.minAccounts) {
      throw new Error(`ERR: Role with id '${role.id}' has too few accounts assigned. Minimum account assignments: ${role.minAccounts}. Current account assignments: ${roleAccounts.addresses.length}.`);
    }

    // Write RoleAccounts table to stateStore
    await stateStore.chain.set(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${role.id}`, codec.encode(roleAccountsSchema, roleAccounts));
  }
}