import {
  BaseModuleDataAccess,
  codec
} from 'lisk-sdk';
import { RBAC_RULESET_STATESTORE_KEY } from '../constants';
import {
  RBACRuleset,
  rbacRulesetRecordSchema,
  rbacRulesetSchema
} from '../schemas';

export const getActiveRulesetAction = async (chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  const rulesetBuffer = await chainGetter.getChainState(RBAC_RULESET_STATESTORE_KEY);

  if (!rulesetBuffer) {
    return Promise.reject(new Error("No ruleset available in stateStore."));
  }

  const ruleset = codec.decode<RBACRuleset>(rbacRulesetSchema, rulesetBuffer)

  return Promise.resolve(codec.toJSON(rbacRulesetRecordSchema, ruleset.ruleset));
}