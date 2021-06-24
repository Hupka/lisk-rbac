import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { DeleteRoleAssetProps, deleteRoleAssetPropsSchema } from '../data'
import { readRBACRolesObject, writeRBACRolesObject } from '../rbac_db';
import { DEFAULT_ROLES, RBAC_PREFIX, RBAC_ROLE_LIFECYCLE_INACTIVE } from '../constants';

export class DeleteRoleAsset extends BaseAsset<DeleteRoleAssetProps> {
  public name = 'roles:delete';
  public id = 3;

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

    // 1. Verify that sender has permission to perform transaction
    let hasPermission = false;
    if (await reducerHandler.invoke(`${RBAC_PREFIX}:hasPermission`, {
      address: transaction.senderAddress,
      resource: "roles",
      operation: "delete"
    }).then((result) => result)) {
      hasPermission = true;
    }

    // 2. Do nothing when sender account does not have role with permission roles:update
    if (!hasPermission) {
      throw new Error(`Account "${transaction.senderAddress.toString('hex')}" does not have sufficient permissions to perform '${this.name}'.`);
    }

    // 3. Fetch current set of roles from stateStore
    const rolesList = await readRBACRolesObject(stateStore)

    if (!rolesList) {
			throw new Error("ERR: no roles list in database");
    }

    // 4. Verify that role with the sent id does exist
    const roleRecord = rolesList.roles.find(elem =>  asset.id === elem.id);
    if (!roleRecord) {
      throw new Error(`Role with id '${asset.id}' does not exist. Role can not be deleted.`);
    }

    // 5. Do nothing when role is already deactived / removed
    if (roleRecord.lifecycle === RBAC_ROLE_LIFECYCLE_INACTIVE) {
      throw new Error(`Role with id '${asset.id}' has already been deleted.`);
    }

    // 6. Don't allow deletion of default roles
    if (DEFAULT_ROLES.roles.find(elem => elem.id === roleRecord.id)) {
      throw new Error(`Role with id '${asset.id}' is a default role. Default roles can not be deleted.`);
    }
    
    // 7. Schedule role item for removal from RBAC solver by setting it inactive
    roleRecord.lifecycle = RBAC_ROLE_LIFECYCLE_INACTIVE
    
    // 8. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles.filter(elem => elem.id !== asset.id), roleRecord]
    rolesList.roles = rolesList.roles.sort((a, b)=> parseInt(a.id, 10)-parseInt(b.id, 10));

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
