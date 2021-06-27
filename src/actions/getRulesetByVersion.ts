import {
  BaseModuleDataAccess,
  codec
} from 'lisk-sdk';
import { RBAC_RULESET_VERSIONS_STATESTORE_KEY } from '../constants';
import {
  RBACRulesetRecord,
  rbacRulesetRecordSchema
} from '../schemas';

export const getRulesetByVersionAction = async (version: string, chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  if (!version) {
    return Promise.reject(new Error("No version provided."));
  }

  const rulesetBuffer = await chainGetter.getChainState(`${RBAC_RULESET_VERSIONS_STATESTORE_KEY}:${version}`);

  if (!rulesetBuffer) {
    return Promise.reject(new Error(`Ruleset version '${version}' does not exist.`));
  }

  const ruleset = codec.decode<RBACRulesetRecord>(rbacRulesetRecordSchema, rulesetBuffer)

  return Promise.resolve(codec.toJSON(rbacRulesetRecordSchema, ruleset));
}