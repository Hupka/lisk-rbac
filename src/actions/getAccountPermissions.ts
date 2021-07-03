import { Account } from '@liskhq/lisk-chain';
import { isHexString } from '@liskhq/lisk-validator';
import { BaseModuleDataAccess, codec } from 'lisk-sdk';
import { RBAC_PERMISSIONS_STATESTORE_KEY } from '../constants';
import { RBACEngine } from '../rbac_algorithm';
import { RBACAccountProps, RBACPermissionRecord, RBACPermissionsProps, rbacPermissionsPropsSchema } from '../schemas';

export const getAccountPermissionsAction = async (address: string | Buffer, chainGetter: BaseModuleDataAccess, solver: RBACEngine): Promise<RBACPermissionRecord[]> => {
  if (typeof address === 'string' && !isHexString(address)) {
    throw new Error('Address parameter should be a hex string.');
  }

  let account: Account<RBACAccountProps>;
  if (Buffer.isBuffer(address)) {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(address);
  } else {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(Buffer.from(address, 'hex'));
  }

  // Load all permissions
  const permissionsBuffer = await chainGetter.getChainState(RBAC_PERMISSIONS_STATESTORE_KEY);
  if (!permissionsBuffer) {
    return Promise.reject(new Error("No permissions list available in stateStore."));
  }
  const permissionsArray = codec.decode<RBACPermissionsProps>(rbacPermissionsPropsSchema, permissionsBuffer)
  const permissionsObject = Object.fromEntries(permissionsArray.permissions.map(elem=> [elem.id,elem]))
  
  // Load permissions from all roles
  const result: RBACPermissionRecord[] = [];
  for (const role of account.rbac.roles) {
    const rolePermissionsIds: string[] = solver.getRolePermissions(role.id);
  
    for (const permissionId of rolePermissionsIds) {
      result.push(permissionsObject[permissionId]);
    }
  }

  return result;
}