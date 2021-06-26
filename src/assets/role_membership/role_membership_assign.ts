import { Account } from '@liskhq/lisk-chain';
import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';

import {
  assignRoleMembershipAssetPropsSchema,
  AssignRoleMembershipAssetProps,
  RBACAccountProps,
  RBACRoleRecord,
  RoleAccounts,
  RoleAccountsSchema,
} from '../../data';

import { RBAC_PREFIX, RBAC_ROLE_ACCOUNTS_STATESTORE_KEY } from '../../constants';
import { readRBACRolesObject } from '../../rbac_db';
import { isHexString } from '../../utils';

export class AssignRoleMembershipAsset extends BaseAsset<AssignRoleMembershipAssetProps> {
  public name = 'role_membership:assign';
  public id = 6;
  public scopes = [{ resource: "role_membership", operation: "create" }];

  // Define schema for asset
  public schema = assignRoleMembershipAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<AssignRoleMembershipAssetProps>): void {
    if (asset.roles === []) {
      throw new Error(`No role is included. Include at least one role for assignment.`);
    }

    if (asset.roles.length > 30 || asset.accounts.length > 30) {
      throw new Error(`Don't submit more than 30 accounts and 30 roles per transaction. You are attemting to submit ${asset.accounts.length} accounts and ${asset.roles.length} roles in this transaction.`);
    }

    if (asset.accounts === []) {
      throw new Error(`No account is included. Include at least one account for assignment.`);
    }

    for (const address of asset.accounts) {
      if (typeof address === 'string' && !isHexString(address)) {
        throw new Error('Address parameter should be a hex string.');
      }
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<AssignRoleMembershipAssetProps>): Promise<void> {

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
      throw new Error(`Account '${transaction.senderAddress.toString('hex')}' does not have sufficient permissions to perform '${this.name}'.`);
    }

    // 2. Remove duplicate accounts and roles in transaction
    const assetAccounts: string[] = [...new Set(asset.accounts)]
    const assetRoles: string[] = [...new Set(asset.roles)]

    // 3.1 Load all accounts which should get roles assigned
    const accounts: Account<RBACAccountProps>[] = [];
    for (const account of assetAccounts) {
      accounts.push(await stateStore.account.get<RBACAccountProps>(Buffer.from(account, 'hex')));
    }

    // 3.2 Load all roles to be assigned
    const rolesList = await readRBACRolesObject(stateStore);

    if (!rolesList) {
      throw new Error("ERR: no roles list in database");
    }

    // 4. Check if the roles scheduled for being assigned actually exist in the database
    const reducedRolesList: RBACRoleRecord[] = [];
    for (const roleId of assetRoles) {
      const role = rolesList.roles.find(elem => elem.id === roleId)
      if (!role) {
        throw new Error(`The role with id '${roleId}' is unknown. None of the provided roles were assigned.`);
      } else {
        reducedRolesList.push(role);
      }
    }

    // 5. Check if the roles have lifecycle state set "active", if not abord
    const inactiveRole = reducedRolesList.find(elem => elem.lifecycle === "inactive");
    if (inactiveRole) {
      throw new Error(`At least role with id [${inactiveRole.id}] had been removed. Removed roles can't be assigned.`);
    }

    // 6. Update "accounts-per-role" tables
    for (const role of reducedRolesList) {

      // Read current table of accounts per role 
      const roleAccountsBuffer = await stateStore.chain.get(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${role.id}`);
      if (!roleAccountsBuffer) {
        throw new Error("ERR: no roles list in database");
      }
      const roleAccounts = codec.decode<RoleAccounts>(RoleAccountsSchema, roleAccountsBuffer);

      // Insert all new accounts 
      for (const account of accounts) {
        if (!roleAccounts.accounts.find(elem => Buffer.compare(elem, account.address) === 0 )) {
          roleAccounts.accounts.push(account.address);
        }
      }

      await stateStore.chain.set(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${role.id}`, codec.encode(RoleAccountsSchema, roleAccounts));
    }

    // 7. Assign roles to users
    for (const account of accounts) {
      for (const role of reducedRolesList) {
        if (!account.rbac.roles.find(elem => elem.id === role.id)) {
          account.rbac.roles.push({ id: role.id, name: role.name })
        }
      }

      account.rbac.roles.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
      await stateStore.account.set(account.address, account);
    }
  }
}
