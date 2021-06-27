import { Account } from "@liskhq/lisk-chain"
import { RBAC_ROLE_LIFECYCLE_ACTIVE } from "./constants";

import {
  RBACAccountProps,
  RBACPermissionsProps,
  RBACRolesProps,
  RBACRulesetRecord,
  RBACRulesetRuleRecord,
} from "./schemas"

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
    // only add roles which have are in lifecycle=active state
    if(element.role.lifecycle === RBAC_ROLE_LIFECYCLE_ACTIVE){
      if (element.role.inheritance) {
        // validate which inherited roles are 'active', only load these
        const activeRuleInheritance = element.role.inheritance.filter(elem => ruleset.roles.find(x => x.role.id === elem)?.role.lifecycle === RBAC_ROLE_LIFECYCLE_ACTIVE)

        loadOptions.roles[element.role.id] = {
          can: [...element.permissions.map(elem => `${elem.resourceName}:${elem.operationName}`)],
          inherits: [...activeRuleInheritance],
        }
      } else {
        loadOptions.roles[element.role.id] = {
          can: [...element.permissions.map(elem => `${elem.resourceName}:${elem.operationName}`)],
        }
      }
    }
  });
  
  return new RBAC(loadOptions, ruleset.version);
}

export const hasPermissionSolver = (
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