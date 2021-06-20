import { codec, StateStore } from "lisk-sdk";
import { RBAC_PERMISSIONS_STATESTORE_KEY, RBAC_ROLES_STATESTORE_KEY, RBAC_RULESETS_STATESTORE_KEY } from "./constants";

import {
  RBACPermissionsProps,
  RBACPermissionsPropsSchema,
  RBACRolesProps,
  RBACRolesPropsSchema,
  RBACRulesetRecord,
  RBACRulesetRoleRecord,
  RBACRulesets,
  RBACRulesetsSchema
} from "./data"
import RBAC from './rbac-algorithm/algorithm';


export const createRuleset = (
  roleSet: RBACRolesProps,
  permissionSet: RBACPermissionsProps,
  transactionId: Buffer,
  version: BigInt
): RBACRulesetRecord => {

  const ruleset: RBACRulesetRecord = {
    roles: [],
    transactionId,
    version,
  }

  roleSet.roles.forEach(elementRole => {
    const role: RBACRulesetRoleRecord = {
      roleId: elementRole.id,
      can: [],
      inherits: []
    };

    if (elementRole.inheritance) {
      role.inherits = elementRole.inheritance;
    }

    permissionSet.permissions.forEach(elementPerm => {
      if (elementPerm.roleId === role.roleId) {
        role.can.push({
          name: elementPerm.resourceName,
          operation: elementPerm.operationName
        })
      }
    })

    ruleset.roles.push(role);
  });

  return ruleset;
}

export const loadRBACRuleset = (ruleset: RBACRulesetRecord): RBAC => {

  const loadOptions = {
    roles: {},
  }

  ruleset.roles.forEach(element => {
    if (element.inherits) {
      loadOptions.roles[element.roleId] = {
        can: [...element.can],
        inherits: [...element.inherits],
      }
    } else {
      loadOptions.roles[element.roleId] = {
        can: [...element.can],
      }
    }
  });

  const newRBAC = new RBAC(loadOptions, ruleset.version);

  // eslint-disable-next-line no-console
  console.log(newRBAC.getRules());
  // eslint-disable-next-line no-console
  console.log(newRBAC.version);

  return new RBAC(loadOptions, ruleset.version);
}

export const readRBACRulesetsObject = async (
  stateStore: StateStore
): Promise<RBACRulesets | undefined> => {
  const result = await stateStore.chain.get(RBAC_RULESETS_STATESTORE_KEY);

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRulesets>(RBACRulesetsSchema, result);
};

export const writeRBACRulesetsObject = async (
  stateStore: StateStore,
  rulesets: RBACRulesets,
): Promise<void> => {
  await stateStore.chain.set(RBAC_RULESETS_STATESTORE_KEY, codec.encode(RBACRulesetsSchema, rulesets));
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