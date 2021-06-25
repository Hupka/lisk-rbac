import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { RBAC_PREFIX } from '../../constants';
import { AssociatePermissionsAssetProps, associatePermissionsAssetPropsSchema } from '../../data'
import { readRBACPermissionsObject, readRBACRolesObject, writeRBACPermissionsObject } from '../../rbac_db';

export class AssociatePermissionsAsset extends BaseAsset<AssociatePermissionsAssetProps> {
  public name = 'permissions:associate';
  public id = 4;
  public scopes = [{ resource: "roles", operation: "update" }];

  // Define schema for asset
  public schema = associatePermissionsAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<AssociatePermissionsAssetProps>): void {
    if (asset.roleId === "") {
      throw new Error("No role id provided.");
    }

    if (typeof asset.roleId !== 'string') {
      throw new Error("Role id needs to be of type 'string'.");
    }

    // validate that permissions' resource and operation names have the right format
    const regex = new RegExp("^[a-zA-Z0-9]{3,64}$");

    for (const permission of asset.permissions) {
      if (!regex.test(permission.resourceName)) {
        throw new Error(`The resource name in '${permission.resourceName}:${permission.operationName}' is violating at least one rule: min/max length of 3/64 characters, no special characters supported.`);
      }
      if (!regex.test(permission.operationName)) {
        throw new Error(`The operation name in '${permission.resourceName}:${permission.operationName}' is violating at least one rule: min/max length of 3/64 characters, no special characters supported.`);
      }
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<AssociatePermissionsAssetProps>): Promise<void> {

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

    // 3. Fetch current set of roles from stateStore
    const rolesList = await readRBACRolesObject(stateStore)

    if (!rolesList) {
      throw new Error("ERR: no roles list in database");
    }

    // 4. Verify that role with the sent id does exist
    const roleRecord = rolesList.roles.find(elem => asset.roleId === elem.id);
    if (!roleRecord) {
      throw new Error(`Role with id '${asset.roleId}' does not exist. Permissions can't be assigned.`);
    }

    // 5. Fetch current set of permissions from stateStore
    const permissionsList = await readRBACPermissionsObject(stateStore)

    if (!permissionsList) {
      throw new Error("ERR: no permissions list in database");
    }

    // 6. Associate permissions with roles
    for (const permission of asset.permissions) {
      const permissionIndex = permissionsList.permissions.findIndex(elem => elem.resourceName === permission.resourceName && elem.operationName === permission.operationName)
      if (permissionIndex >= 0) {
        permissionsList.permissions[permissionIndex].associatedRoleIds.push(asset.roleId)
        // Remove duplicated associations
        permissionsList.permissions[permissionIndex].associatedRoleIds = [...new Set(permissionsList.permissions[permissionIndex].associatedRoleIds)]
      } else {
        permissionsList.permissions.push({
          id: (permissionsList.latest+1).toString(),
          associatedRoleIds: [asset.roleId],
          resourceName: permission.resourceName,
          operationName: permission.resourceName,
          transactionId: transaction.id,
        })
        permissionsList.latest+=1; 
      }
    }

    // 7. Write new set of permissions to stateStore
    await writeRBACPermissionsObject(stateStore, permissionsList);
  }
}
