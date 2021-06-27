import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { UpdateRoleAssetProps, updateRoleAssetPropsSchema } from '../../schemas'
import { readDefaultRBACRolesObject, readRBACRolesObject, writeRBACRolesObject } from '../../rbac_db';
import { RBAC_PREFIX } from '../../constants';

export class UpdateRoleAsset extends BaseAsset<UpdateRoleAssetProps> {
  public name = 'roles:update';
  public id = 2;
  public scopes = [{ resource: "roles", operation: "update"}];

  // Define schema for asset
  public schema = updateRoleAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<UpdateRoleAssetProps>): void {
    if (asset.name === "") {
      throw new Error("No name for new role included. Setting a name is required when creating a new role.");
    }

    if (asset.id === "") {
      throw new Error("No role id provided.");
    }

    if (typeof asset.id !== 'string') {
      throw new Error("Role id needs to be of type 'string'.");
    }

    const regex = new RegExp("^[a-zA-Z0-9._%+-]{3,64}$");

    if (!regex.test(asset.name)) {
      throw new Error("The role name is violating at least one rule: min/max length of 3/64 characters, supported special characters are '.', '-' and '_'.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<UpdateRoleAssetProps>): Promise<void> {

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
    const roleRecord = rolesList.roles.find(elem =>  asset.id === elem.id);
    if (!roleRecord) {
      throw new Error(`Role with id '${asset.id}' does not exist. Role update can not be performed.`);
    }

    // 5. Don't allow update of default roles
    const defaultRolesList = await readDefaultRBACRolesObject(stateStore)

    if (!defaultRolesList) {
      throw new Error("ERR: no default roles list in database");
    }

    if (defaultRolesList.roles.find(elem => elem.id === roleRecord.id)) {
      throw new Error(`Role with id '${asset.id}' is a default role. Default roles can not be updated.`);
    }

    // 6. Update role item
    roleRecord.name = asset.name.toLowerCase();
    roleRecord.description = asset.description ? asset.description : "";
    roleRecord.inheritance = asset.inheritance;
    roleRecord.transactionId = transaction.id;
    
    // 7. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles.filter(elem => elem.id !== asset.id), roleRecord]
    rolesList.roles = rolesList.roles.sort((a, b)=> parseInt(a.id, 10)-parseInt(b.id, 10));

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
