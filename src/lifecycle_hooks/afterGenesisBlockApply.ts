import { AfterGenesisBlockApplyContext } from "lisk-sdk";
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from "../constants";
import { RBACEngine } from '../rbac-algorithm/algorithm';
import {
  writeDefaultRBACRolesPermissions,
  writeDefaultRoleAccountsTables,
  writeGenesisAccountsRoles,
  writeRBACPermissionsObject,
  writeRBACRolesObject,
  writeRBACRulesetObject,
  writeRBACRulesetVersionObject
} from "../rbac_db";
import { createRulesetRecord, loadRBACRuleset } from "../utils";


export const afterGenesisBlockApplyLifecycleHook = async (context: AfterGenesisBlockApplyContext): Promise<RBACEngine> => {

  const genesisRbacRulesetVersion = 0;
  const genesisRbacRulesetRecord = createRulesetRecord(DEFAULT_ROLES, DEFAULT_PERMISSIONS, context.genesisBlock.header.id, genesisRbacRulesetVersion)

  // write DEFAULT_ROLES and DEFAULT_PERMISSIONS to stateStore
  await writeDefaultRBACRolesPermissions(context.stateStore, DEFAULT_ROLES, DEFAULT_PERMISSIONS)
  await writeGenesisAccountsRoles(context.stateStore);
  await writeDefaultRoleAccountsTables(context.stateStore);

  // Write first database entries for roles/permissions/rulesets
  await writeRBACRolesObject(context.stateStore, DEFAULT_ROLES);
  await writeRBACPermissionsObject(context.stateStore, DEFAULT_PERMISSIONS);
  await writeRBACRulesetVersionObject(context.stateStore, genesisRbacRulesetRecord);
  await writeRBACRulesetObject(context.stateStore, { ruleset: genesisRbacRulesetRecord, activeVersion: genesisRbacRulesetVersion, latestVersion: genesisRbacRulesetVersion });

  // Load initial ruleset into RBACSolver
  // eslint-disable-next-line no-param-reassign
  return loadRBACRuleset(genesisRbacRulesetRecord);
}