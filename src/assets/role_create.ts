import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { RBAC_PREFIX, RBAC_ROLE_LIFECYCLE_ACTIVE } from '../constants';
import { CreateRoleAssetProps, createRoleAssetPropsSchema, RBACRoleRecord } from '../data'
import { readRBACRolesObject, writeRBACRolesObject } from '../rbac_db';

export class CreateRoleAsset extends BaseAsset<CreateRoleAssetProps> {
  public name = 'roles:create';
  public id = 1;

  // Define schema for asset
  public schema = createRoleAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<CreateRoleAssetProps>): void {
    if (asset.name === "") {
      throw new Error("No name for new role included. Setting a name is required when creating a new role.");
    }

    const regex = new RegExp("^\b[a-zA-Z0-9._%+-]{3,64}\b$");

    if (!regex.test(asset.name)) {
      throw new Error("Role name is violating at least one rule: min/max length of 3/64 characters, supported special characters are '.', '-' and '_'.");
    }

    if (asset.inheritance.filter(elem => elem === "").length > 0) {
      throw new Error("Role inheritance includes element referencing role id \"\". This is not a valid role id.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<CreateRoleAssetProps>): Promise<void> {

    // 1. Verify that sender has permission to perform transaction
    let hasPermission = false;
    if (await reducerHandler.invoke(`${RBAC_PREFIX}:hasPermission`, {
      address: transaction.senderAddress,
      resource: "roles",
      operation: "create"
    }).then((result) => result)) {
      hasPermission = true;
    }

    // 2. Do nothing when sender account does not have role with permission roles:create
    if (!hasPermission) {
      throw new Error(`Account '${transaction.senderAddress.toString('hex')}' does not have sufficient permissions to perform '${this.name}'.`);
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
      name: asset.name.toLowerCase(),
      description: asset.description ? asset.description : "",
      transactionId: transaction.id,
      inheritance: asset.inheritance,
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE
    }

    // 6. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles, roleRecord]
    rolesList.latest = newRoleId;

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
