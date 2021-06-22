import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { CreateRoleAssetProps, createRoleAssetPropsSchema, RBACRoleRecord } from '../data'
import { readRBACRolesObject, writeRBACRolesObject } from '../utils';

export class CreateRoleAsset extends BaseAsset<CreateRoleAssetProps> {
  public name = 'role:create';
  public id = 1;

  // Define schema for asset
  public schema = createRoleAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<CreateRoleAssetProps>): void {
    if (asset.name === "") {
      throw new Error(`No name for new role included. Setting a name is required when creating a new role.`);
    }

    if (asset.name === "*") {
      throw new Error(`No wildcards for roles supported yet.`);
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<CreateRoleAssetProps>): Promise<void> {

    // 1. Verify that sender has permission to perform transaction
    let hasPermission = false;
    if (await reducerHandler.invoke("rbac:hasPermission", {
      address: transaction.senderAddress,
      resource: "roles",
      operation: "create"
    }).then((result) => result)) {
      hasPermission = true;
    }

    // 2. Do nothing when sender account does not have role with permission roles:create
    if (!hasPermission) {
      throw new Error(`Account "${transaction.senderAddress.toString('hex')}" does not have sufficient permissions.`);
    }

    // 3. Fetch current set of roles from stateStore
    const rolesList = await readRBACRolesObject(stateStore)

    if (!rolesList) {
			throw new Error("ERR: no roles list in database");
    }
    
    // 4. Verify that role with the same name does not exist yet
    if (rolesList.roles.find(elem =>  asset.name.toLowerCase() === elem.name.toLowerCase())) {
      throw new Error("Role already exists in database.");
    }
    
    // 5. Construct new role record object
    const newRoleId = rolesList.latest + 1;
    const roleRecord: RBACRoleRecord = {
      id: newRoleId.toString(),
      name: asset.name,
      description: asset.description ? asset.description : "",
      transactionId: transaction.id,
      inheritance: asset.inheritance,
    }

    // 6. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles, roleRecord]
    rolesList.latest = newRoleId;

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
