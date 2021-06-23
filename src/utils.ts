import { Account } from "@liskhq/lisk-chain"

import {
  RBACAccountProps,
  RBACPermissionsProps,
  RBACRolesProps,
  RBACRulesetRecord,
  RBACRulesetRuleRecord,
} from "./data"

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