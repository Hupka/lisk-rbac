import { AfterBlockApplyContext } from 'lisk-sdk';
import { RBACEngine } from '../rbac-algorithm/algorithm';
import {
  readRBACPermissionsObject,
  readRBACRolesObject,
  readRBACRulesetObject,
  writeRBACRulesetObject,
  writeRBACRulesetVersionObject
} from '../rbac_db';
import {
  createRulesetRecord,
  loadRBACRuleset
} from '../utils';

export const afterBlockApplyLifecycleHook = async (moduleId: number, assetIDsRequiringRBACReload: number[], solver: RBACEngine, context: AfterBlockApplyContext): Promise<RBACEngine> => {

  // 1. Determine if one of the transactions from the current block belong to this module 
  //    and if any of these transactions require a reload of the RBAC solver.
  let RbacReloadRequired = false;
  for (const transaction of context.block.payload) {
    if (transaction.moduleID !== moduleId) {
      continue;
    }
    if (assetIDsRequiringRBACReload.includes(transaction.assetID)) {
      RbacReloadRequired = true;
      break;
    }
  }

  // 2. In case there were RBAC admin transactions in this block, generate new ruleset version, reload solver
  if (RbacReloadRequired) {
    const roles = await readRBACRolesObject(context.stateStore);
    const permissions = await readRBACPermissionsObject(context.stateStore);
    const rulesetsObj = await readRBACRulesetObject(context.stateStore);

    if (rulesetsObj && roles && permissions) {
      const newRulesetVersion = createRulesetRecord(roles, permissions, context.block.header.id, rulesetsObj.latestVersion + 1)

      await writeRBACRulesetVersionObject(context.stateStore, newRulesetVersion)

      // In case activeVersion was set to latestVersion, increment it as well
      if (rulesetsObj.activeVersion === rulesetsObj.latestVersion) {
        rulesetsObj.activeVersion = newRulesetVersion.version;
        rulesetsObj.latestVersion = newRulesetVersion.version;
        rulesetsObj.ruleset = newRulesetVersion;
      } else {
        rulesetsObj.latestVersion = newRulesetVersion.version;
      }

      await writeRBACRulesetObject(context.stateStore, rulesetsObj)
    }
  }

  // 3. Load active ruleset into RBACSolve; this only happens when ruleset was updated through a transaction in this block
  const activeRuleset = await readRBACRulesetObject(context.stateStore);
  if (activeRuleset) {
  // eslint-disable-next-line no-param-reassign
    solver = loadRBACRuleset(activeRuleset.ruleset);
  }

  return solver;
}