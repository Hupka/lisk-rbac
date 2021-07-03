import { Account } from "@liskhq/lisk-chain";
import { RBAC_ROLE_LIFECYCLE_ACTIVE } from "./constants";
import { RBACEngine } from './rbac_algorithm';
import {
  RBACAccountProps,
  RBACPermissionsProps,
  RBACRoleRecord,
  RBACRolesProps,
  RBACRulesetRecord,
  RBACRulesetRuleRecord
} from "./schemas";

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

export const loadRBACRuleset = (ruleset: RBACRulesetRecord): RBACEngine => {

  const loadOptions = {
    roles: {},
  }

  ruleset.roles.forEach(element => {
    // only add roles which have are in lifecycle=active state
    if (element.role.lifecycle === RBAC_ROLE_LIFECYCLE_ACTIVE) {
      if (element.role.inheritance) {
        // validate which inherited roles are 'active', only load these
        const activeRuleInheritance = element.role.inheritance.filter(elem => ruleset.roles.find(x => x.role.id === elem)?.role.lifecycle === RBAC_ROLE_LIFECYCLE_ACTIVE)

        loadOptions.roles[element.role.id] = {
          can: [...element.permissions.map(elem => `${elem.resource}:${elem.operation}&${elem.id}`)],
          inherits: [...activeRuleInheritance],
        }
      } else {
        loadOptions.roles[element.role.id] = {
          can: [...element.permissions.map(elem => `${elem.resource}:${elem.operation}&${elem.id}`)],
        }
      }
    }
  });

  return new RBACEngine(loadOptions, ruleset.version);
}

export const hasPermissionSolver = (
  account: Account<RBACAccountProps>,
  resource: string,
  operation: string,
  solver: RBACEngine
): boolean => {
  for (const role of account.rbac.roles) {
    if (solver.can(role.id, resource, operation)) {
      return true;
    }
  }
  return false;
}

export const checkCircularInheritance = (
  role: RBACRoleRecord,
  rolesList: { [roleId: string]: RBACRoleRecord },
  ancestry: string[]
): boolean => {

  for (const parent of role.inheritance) {
    if (ancestry.find(elem => elem === parent)) {
      return true;
    } 
    if(checkCircularInheritance(rolesList[parent], rolesList, [...ancestry,role.id])) {
      return true;
    }
  }

  return false;
}