import { codec, StateStore } from "lisk-sdk";
import { Account } from "@liskhq/lisk-chain"

import {
  RBACAccountProps,
  RBACPermissionsProps,
  RBACPermissionsPropsSchema,
  RBACRolesProps,
  RBACRolesPropsSchema,
  RBACRuleset,
  RBACRulesetRecord,
  RBACRulesetRecordSchema,
  RBACRulesetRuleRecord,
  RBACRulesetSchema
} from "./data"
import { RBAC_PERMISSIONS_STATESTORE_KEY, RBAC_ROLES_STATESTORE_KEY, RBAC_RULESET_STATESTORE_KEY, RBAC_RULESET_VERSIONS_STATESTORE_KEY } from "./constants";
import RBAC from './rbac-algorithm/algorithm';

export const createRulesetRecord = (
  roleSet: RBACRolesProps,
  permissionSet: RBACPermissionsProps,
  blockId: Buffer,
  version: number
): RBACRulesetRecord => {

  const ruleset: RBACRulesetRecord = {
    roles: [],
    version,
    blockId,
  }

  roleSet.roles.forEach(elementRole => {
    const ruleRecord: RBACRulesetRuleRecord = {
      role: elementRole,
      permissions: []
    }

    permissionSet.permissions.forEach(elementPerm => {
      if (elementPerm.associatedRoleIds.find(id => id === ruleRecord.role.id)) {
        ruleRecord.permissions.push(elementPerm)
      }
    })

    ruleset.roles.push(ruleRecord);
  });

  return ruleset;
}

export const loadRBACRuleset = (ruleset: RBACRulesetRecord): RBAC => {

  const loadOptions = {
    roles: {},
  }

  ruleset.roles.forEach(element => {
    if (element.role.inheritance) {
      loadOptions.roles[element.role.id] = {
        can: [...element.permissions.map(elem => `${elem.resourceName}:${elem.operationName}`)],
        inherits: [...element.role.inheritance],
      }
    } else {
      loadOptions.roles[element.role.id] = {
        can: [...element.permissions.map(elem => `${elem.resourceName}:${elem.operationName}`)],
      }
    }
  });
  
  return new RBAC(loadOptions, ruleset.version);
}

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

export const hasPermission = (
  account: Account<RBACAccountProps>, 
  resource: string, 
  operation: string,
  solver: RBAC
  ): boolean => {
    for (const role of account.rbac.roles) {
      if (solver.can(role.id, resource, operation)) {
        return true;
      }
    }
    return false;
}

export const isHexString = (data: unknown): boolean => {
	if (typeof data !== 'string') {
		return false;
	}

	return data === '' || /^[a-f0-9]+$/i.test(data);
};