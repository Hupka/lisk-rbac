import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { RemovePermissionsAssetProps, removePermissionsAssetPropsSchema } from '../../data'
import { readRBACPermissionsObject, writeRBACPermissionsObject } from '../../rbac_db';
import { RBAC_PREFIX } from '../../constants';

export class RemovePermissionsAsset extends BaseAsset<RemovePermissionsAssetProps> {
  public name = 'permissions:remove';
  public id = 5;
  public scopes = [{ resource: "roles", operation: "update" }];

  // Define schema for asset
  public schema = removePermissionsAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<RemovePermissionsAssetProps>): void {
    if (asset.roleId === "") {
      throw new Error("No role id provided.");
    }

    if (typeof asset.roleId !== 'string') {
      throw new Error("Role id needs to be of type 'string'.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<RemovePermissionsAssetProps>): Promise<void> {

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

    // 2. Do nothing when sender account does not have role with permission roles:create
    if (!hasPermission.filter(elem => !elem).length) {
      throw new Error(`Account "${transaction.senderAddress.toString('hex')}" does not have sufficient permissions to perform '${this.name}'.`);
    }

    // 3. Fetch current set of permissions from stateStore
    const permissionsList = await readRBACPermissionsObject(stateStore)

    if (!permissionsList) {
      throw new Error("ERR: no permissions list in database");
    }

    // 4. Remove permission-to-role associations
    for (const permission of asset.permissions) {
      const permissionIndex = permissionsList.permissions.findIndex(elem => elem.resourceName === permission.resourceName && elem.operationName === permission.operationName)
      if (permissionIndex >= 0) {
        const roleIdIndex = permissionsList.permissions[permissionIndex].associatedRoleIds.indexOf(asset.roleId);
        permissionsList.permissions[permissionIndex].associatedRoleIds.splice(roleIdIndex,1);
      } 
      // Remove permissions without associations altogether
      if (permissionsList.permissions[permissionIndex].associatedRoleIds === []) {
        permissionsList.permissions.splice(permissionIndex, 1);
      }
    }

    // 7. Write new set of permissions to stateStore
    await writeRBACPermissionsObject(stateStore, permissionsList);
  }
}
