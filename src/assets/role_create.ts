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

    // TODO Validate if role with name already exists

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
      throw new Error(`Account "${transaction.senderAddress.toString()}" does not have sufficient permissions.`);
    }
    // 3. Fetch current set of roles from stateStore
    const roleset = await readRBACRolesObject(stateStore)

    if (!roleset) {
      return;
    }
    const newRoleId = roleset.latest + 1;

    // 4. Construct new role record object
    const roleRecord: RBACRoleRecord = {
      id: newRoleId.toString(),
      name: asset.name,
      description: asset.description ? asset.description : "",
      transactionId: transaction.id,
      inheritance: asset.inheritance,
    }

    // 5. Write new set of roles to stateStore
    roleset.roles = [...roleset.roles, roleRecord]
    roleset.latest = newRoleId;

    await writeRBACRolesObject(stateStore, roleset);
  }
}
