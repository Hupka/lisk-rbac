import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { UpdateRoleAssetProps, updateRoleAssetPropsSchema } from '../data'
import { readRBACRolesObject, writeRBACRolesObject } from '../utils';
import { RBAC_PREFIX } from '../constants';

export class UpdateRoleAsset extends BaseAsset<UpdateRoleAssetProps> {
  public name = 'roles:update';
  public id = 2;

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

    const regex = new RegExp('[a-zA-Z0-9._%+-]{3,64}$');

    if (!regex.test(asset.name)) {
      throw new Error("The role name is violating at least one rule: min/max length of 3/64 characters, supported special characters are '.', '-' and '_'.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<UpdateRoleAssetProps>): Promise<void> {

    // 1. Verify that sender has permission to perform transaction
    let hasPermission = false;
    if (await reducerHandler.invoke(`${RBAC_PREFIX}:hasPermission`, {
      address: transaction.senderAddress,
      resource: "roles",
      operation: "update"
    }).then((result) => result)) {
      hasPermission = true;
    }

    // 2. Do nothing when sender account does not have role with permission roles:update
    if (!hasPermission) {
      throw new Error(`Account "${transaction.senderAddress.toString('hex')}" does not have sufficient permissions.`);
    }

    // 3. Fetch current set of roles from stateStore
    const rolesList = await readRBACRolesObject(stateStore)

    if (!rolesList) {
			throw new Error("ERR: no roles list in database");
    }

    // 4. Verify that role with the sent id does exist
    const roleRecord = rolesList.roles.find(elem =>  asset.id === elem.id);
    if (!roleRecord) {
      throw new Error("Role does not exist. Role update can not be performed.");
    }
    
    // 5. Update role item
    roleRecord.name = asset.name.toLowerCase();
    roleRecord.description = asset.description ? asset.description : "";
    roleRecord.inheritance = asset.inheritance;
    roleRecord.transactionId = transaction.id;
    
    // 6. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles.filter(elem => elem.id !== asset.id), roleRecord]
    rolesList.roles = rolesList.roles.sort((a, b)=> parseInt(a.id, 10)-parseInt(b.id, 10));

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
