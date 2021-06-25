import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';

import { 
  DeleteRoleAssetProps, 
  deleteRoleAssetPropsSchema, 
  RoleAccounts, 
  RoleAccountsSchema 
} from '../../data';

import { 
  readDefaultRBACRolesObject, 
  readRBACRolesObject, 
  writeRBACRolesObject 
} from '../../rbac_db';

import { 
  RBAC_PREFIX, 
  RBAC_ROLE_ACCOUNTS_STATESTORE_KEY, 
  RBAC_ROLE_LIFECYCLE_INACTIVE 
} from '../../constants';

export class DeleteRoleAsset extends BaseAsset<DeleteRoleAssetProps> {
  public name = 'roles:delete';
  public id = 3;
  public scopes = [{ resource: "roles", operation: "delete" }];

  // Define schema for asset
  public schema = deleteRoleAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<DeleteRoleAssetProps>): void {
    if (asset.id === "") {
      throw new Error("No role id provided.");
    }

    if (typeof asset.id !== 'string') {
      throw new Error("Role id needs to be of type 'string'.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<DeleteRoleAssetProps>): Promise<void> {

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

    // 3. Fetch current set of roles from stateStore
    const rolesList = await readRBACRolesObject(stateStore)

    if (!rolesList) {
      throw new Error("ERR: no roles list in database");
    }

    // 4. Verify that role with the sent id does exist
    const roleRecord = rolesList.roles.find(elem => asset.id === elem.id);
    if (!roleRecord) {
      throw new Error(`Role with id '${asset.id}' does not exist. Role can not be deleted.`);
    }

    // 5. Do nothing when role is already deactived / removed
    if (roleRecord.lifecycle === RBAC_ROLE_LIFECYCLE_INACTIVE) {
      throw new Error(`Role with id '${asset.id}' has already been deleted.`);
    }

    // 6. Don't allow deletion of default roles
    const defaultRolesList = await readDefaultRBACRolesObject(stateStore)

    if (!defaultRolesList) {
      throw new Error("ERR: no default roles list in database");
    }

    if (defaultRolesList.roles.find(elem => elem.id === roleRecord.id)) {
      throw new Error(`Role with id '${asset.id}' is a default role. Default roles can not be deleted.`);
    }

    // 7. Set RoleAccounts table for this role to 'inactive'
    const roleAccountsBuffer = await stateStore.chain.get(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${asset.id}`);
    if (!roleAccountsBuffer) {
      throw new Error("ERR: no roles list in database");
    }

    const roleAccounts = codec.decode<RoleAccounts>(RoleAccountsSchema, roleAccountsBuffer);
    roleAccounts.lifecycle = RBAC_ROLE_LIFECYCLE_INACTIVE;
    await stateStore.chain.set(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${asset.id}`, codec.encode(RoleAccountsSchema, roleAccounts));

    // 8. Schedule role item for removal from RBAC solver by setting it inactive
    roleRecord.lifecycle = RBAC_ROLE_LIFECYCLE_INACTIVE

    // 9. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles.filter(elem => elem.id !== asset.id), roleRecord]
    rolesList.roles = rolesList.roles.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
