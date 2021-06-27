import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';

import { 
  RBAC_PREFIX, 
  RBAC_ROLE_ACCOUNTS_STATESTORE_KEY, 
  RBAC_ROLE_LIFECYCLE_ACTIVE 
} from '../../constants';

import { 
  CreateRoleAssetProps, 
  createRoleAssetPropsSchema, 
  RBACRoleRecord, 
  RoleAccounts, 
  roleAccountsSchema 
} from '../../schemas'

import { 
  readRBACRolesObject, 
  writeRBACRolesObject 
} from '../../rbac_db';

export class CreateRoleAsset extends BaseAsset<CreateRoleAssetProps> {
  public name = 'roles:create';
  public id = 1;
  public scopes = [{ resource: "roles", operation: "create" }];

  // Define schema for asset
  public schema = createRoleAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<CreateRoleAssetProps>): void {
    if (asset.name === "") {
      throw new Error("No name for new role included. Setting a name is required when creating a new role.");
    }

    const regex = new RegExp("^[a-zA-Z0-9._%+-]{3,64}$");

    if (!regex.test(asset.name)) {
      throw new Error(`Role name '${asset.name}' is violating at least one rule: min/max length of 3/64 characters, supported special characters are '.', '-' and '_'.`);
    }

    if (asset.inheritance.filter(elem => elem === "").length > 0) {
      throw new Error("Role inheritance includes element referencing role id \"\". This is not a valid role id.");
    }
  }

  public async apply({ asset, stateStore, reducerHandler, transaction }: ApplyAssetContext<CreateRoleAssetProps>): Promise<void> {

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

    // 4. Verify that role with the same name does not exist yet
    if (rolesList.roles.find(elem => asset.name.toLowerCase() === elem.name.toLowerCase())) {
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
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE,
      minAccounts: 0
    }

    // 6. Create empty RoleAccounts table
    const roleAccounts: RoleAccounts = {
      id: roleRecord.id,
      accounts: [],
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE
    }
    await stateStore.chain.set(`${RBAC_ROLE_ACCOUNTS_STATESTORE_KEY}:${roleRecord.id}`, codec.encode(roleAccountsSchema, roleAccounts));

    // 7. Write new set of roles to stateStore
    rolesList.roles = [...rolesList.roles, roleRecord]
    rolesList.latest = newRoleId;

    await writeRBACRolesObject(stateStore, rolesList);
  }
}
