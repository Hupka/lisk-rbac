import { codec, StateStore } from "lisk-sdk";

import {
  RBACPermissionsProps,
  RBACRolesProps,
  RBACRulesetRecord,
  RBACRulesetRoleRecord,
  RBACRulesets,
  RBACRulesetsSchema
} from "./data"
import RBAC from './rbac-algorithm/algorithm';


export const createRuleset = (
  roleSet: RBACRolesProps,
  permissionSet: RBACPermissionsProps,
  transactionId: string,
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

  return new RBAC(loadOptions);
}


export const getRBACRulesetsObject = async (
  stateStore: StateStore
): Promise<RBACRulesets | undefined> => {
  const result = await stateStore.chain.get("rbac:rbac_rulesets");

  if (!result) {
    return undefined;
  }

  return codec.decode<RBACRulesets>(RBACRulesetsSchema, result);
};