import { Account } from '@liskhq/lisk-chain';
import { isHexString } from '@liskhq/lisk-validator';
import { ApplyAssetContext, BaseAsset, codec, ValidateAssetContext } from 'lisk-sdk';
import { RBAC_PREFIX, RBAC_ROLE_ACCOUNTS_STATESTORE_KEY } from '../../constants';
import { readRBACRolesObject } from '../../rbac_db';
import {
  RBACAccountProps,
  RBACRoleRecord,
  RemoveRoleMembershipAssetProps,
  removeRoleMembershipAssetPropsSchema,
  RoleAccounts,
  roleAccountsSchema
} from '../../schemas';

export class RemoveRoleMembershipAsset extends BaseAsset<RemoveRoleMembershipAssetProps> {
  public name = 'role_membership:remove';
  public id = 7;
  public scopes = [{ resource: "role_membership", operation: "remove" }];

  // Define schema for asset
  public schema = removeRoleMembershipAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<RemoveRoleMembershipAssetProps>): void {
    if (asset.roles === []) {
      throw new Error(`No role is included. Include at least one role for assignment.`);
    }

    if (asset.roles.length > 30 || asset.addresses.length > 30) {
      throw new Error(`Don't submit more than 30 accounts and 30 roles per transaction. You are attemting to submit ${asset.addresses.length} accounts and ${asset.roles.length} roles in this transaction.`);
    }

    if (asset.addresses === []) {
      throw new Error(`No account is included. Include at least one account for assignment.`);
    }

    for (const address of asset.addresses) {
      if (typeof address === 'string' && !isHexString(address)) {
        throw new Error('Address parameter should be a hex string.');
      }
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<RemoveRoleMembershipAssetProps>): Promise<void> {

    // 1. Verify that sender has ALL necessary permission to perform transaction
    const hasPermission: boolean[] = [];
    for (const scope of this.scopes) {
      if (await reducerHandler.invoke(`${RBAC_PREFIX}:hasPermission`, {
        address: transaction.senderAddress,
        resource: scope.resource,
        operation: scope.operation
      }).then((result) => result)) {
        hasPermission.push(true);
      } else {
        hasPermission.push(false);
      }
    }

    // 2. Do nothing when sender account does not have role with sufficient permission
    if (hasPermission.filter(elem => !elem).length) {
      throw new Error(`Account "${transaction.senderAddress.toString('hex')}" does not have sufficient permissions to perform '${this.name}'.`);
    }

    // 2. Remove duplicate accounts and roles
    const assetAccountAddresses: string[] = [...new Set(asset.addresses)]
    const assetRoles: string[] = [...new Set(asset.roles)]

    // 3.1 Load all accounts which should get roles memberships removed
    const accounts: Account<RBACAccountProps>[] = [];
    for (const accountAddress of assetAccountAddresses) {
      accounts.push(await stateStore.account.get<RBACAccountProps>(Buffer.from(accountAddress, 'hex')));
    }

    // 3.2 Load all roles which should be removed from accounts
    const rolesList = await readRBACRolesObject(stateStore);

    if (!rolesList) {
      throw new Error("ERR: no roles list in database");
    }

    const reducedRolesList: RBACRoleRecord[] = [];
    for (const roleId of assetRoles) {
      const role = rolesList.roles.find(elem => elem.id === roleId)
      if (!role) {
        // Check if the roles scheduled for being assigned actually exist in the database
        throw new Error(`The role with id '${roleId}' is unknown. None of the provided roles were assigned.`);
      } else {
        reducedRolesList.push(role);
      }
    }

    // 4. Update "accounts-per-role" tables
    for (const role of reducedRolesList) {
      // Read current table of accounts per role 
      const roleAccountsBuffer = await stateStore.chain.get(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${role.id}`);
      if (!roleAccountsBuffer) {
        throw new Error("ERR: no roles list in database");
      }
      const roleAccounts = codec.decode<RoleAccounts>(roleAccountsSchema, roleAccountsBuffer);

      // Remove all accounts from this transaction
      for (const account of accounts) {
        const index = roleAccounts.addresses.findIndex(elem => Buffer.compare(elem, account.address) === 0)
        if (index >= 0) {
          roleAccounts.addresses.splice(index, 1);
        }
      }

      if (roleAccounts.addresses.length < role.minAccounts) {
        throw new Error(`ERR: Role with id '${role.id}' would have too few accounts assignments. Minimum account assignments: ${role.minAccounts}. Account assignments if transaction would be processed: ${roleAccounts.addresses.length}.`);
      }

      await stateStore.chain.set(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${role.id}`, codec.encode(roleAccountsSchema, roleAccounts));
    }

    // 5. Remove roles from users
    for (const account of accounts) {
      for (const role of assetRoles) {
        const index = account.rbac.roles.findIndex(elem => elem.id === role);
        if (index >= 0) {
          account.rbac.roles.splice(index, 1)
        }
      }
      await stateStore.account.set(account.address, account);
    }
  }
}
