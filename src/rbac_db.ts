import { codec, StateStore } from "lisk-sdk";

import {
  RBACPermissionsProps,
  RBACPermissionsPropsSchema,
  RBACRolesProps,
  RBACRolesPropsSchema,
  RBACRuleset,
  RBACRulesetRecord,
  RBACRulesetRecordSchema,
  RBACRulesetSchema
} from "./data"

import { 
  RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY,
  RBAC_DEFAULT_ROLES_STATESTORE_KEY,
  RBAC_PERMISSIONS_STATESTORE_KEY, 
  RBAC_ROLES_STATESTORE_KEY, 
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

  return codec.decode<RBACRuleset>(RBACRulesetSchema, result);
};

export const writeRBACRulesetObject = async (
  stateStore: StateStore,
  rulesets: RBACRuleset,
): Promise<void> => {
  await stateStore.chain.set(RBAC_RULESET_STATESTORE_KEY, codec.encode(RBACRulesetSchema, rulesets));
};

export const readRBACRulesetVersionObject = async (
  stateStore: StateStore,
  version: number
): Promise<RBACRulesetRecord | undefined> => {
  const result = await stateStore.chain.get(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${version}`);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRulesetRecord>(RBACRulesetRecordSchema, result);
};

export const writeRBACRulesetVersionObject = async (
  stateStore: StateStore,
  ruleset: RBACRulesetRecord
): Promise<void> => {
  await stateStore.chain.set(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${ruleset.version}`, codec.encode(RBACRulesetRecordSchema, ruleset));
};

export const readRBACRolesObject = async (
  stateStore: StateStore
): Promise<RBACRolesProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_ROLES_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRolesProps>(RBACRolesPropsSchema, result);
}

export const writeRBACRolesObject = async (
  stateStore: StateStore,
  roles: RBACRolesProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_ROLES_STATESTORE_KEY, codec.encode(RBACRolesPropsSchema, roles));
};

export const readRBACPermissionsObject = async (
  stateStore: StateStore
): Promise<RBACPermissionsProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_PERMISSIONS_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACPermissionsProps>(RBACPermissionsPropsSchema, result);
}

export const writeRBACPermissionsObject = async (
  stateStore: StateStore,
  permissions: RBACPermissionsProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_PERMISSIONS_STATESTORE_KEY, codec.encode(RBACPermissionsPropsSchema, permissions));
};

export const writeDefaultRBACRolesPermissions = async (
  stateStore: StateStore,
  roles: RBACRolesProps,
  permissions: RBACPermissionsProps,
): Promise<void> => {
  await stateStore.chain.set(RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY, codec.encode(RBACPermissionsPropsSchema, permissions));
  await stateStore.chain.set(RBAC_DEFAULT_ROLES_STATESTORE_KEY, codec.encode(RBACRolesPropsSchema, roles));
};

export const readDefaultRBACRolesObject = async (
  stateStore: StateStore
): Promise<RBACRolesProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_DEFAULT_ROLES_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRolesProps>(RBACRolesPropsSchema, result);
}

export const readDefaultRBACPermissionsObject = async (
  stateStore: StateStore
): Promise<RBACPermissionsProps | undefined> => {
  const result = await stateStore.chain.get(RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACPermissionsProps>(RBACPermissionsPropsSchema, result);
}