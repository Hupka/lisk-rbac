import {
  BaseModuleDataAccess,
  codec
} from 'lisk-sdk';
import { RBAC_ROLE_ACCOUNTS_STATESTORE_KEY, RBAC_ROLE_LIFECYCLE_INACTIVE } from '../constants';
import {
  RoleAccounts,
  roleAccountsSchema
} from '../schemas';




export const getRoleAccountsAction = async (id: string, chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  // Read current table of accounts per role 
  const roleAccountsBuffer = await chainGetter.getChainState(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${id}`);

  // 1. Verify that role with the sent id does exist
  if (!roleAccountsBuffer) {
    throw new Error(`Role with id '${id}' does not exist.`);
  }

  const roleAccounts = codec.decode<RoleAccounts>(roleAccountsSchema, roleAccountsBuffer);

  if (roleAccounts.lifecycle === RBAC_ROLE_LIFECYCLE_INACTIVE) {
    throw new Error(`Role with id '${id}' has been removed.`);
  }

  return Promise.resolve(codec.toJSON(roleAccountsSchema, roleAccounts));
}