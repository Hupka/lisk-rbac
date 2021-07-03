import { BaseModuleDataAccess, codec } from 'lisk-sdk';
import { RBAC_PERMISSIONS_STATESTORE_KEY } from '../constants';
import { RBACEngine } from '../rbac_algorithm';
import { RBACPermissionRecord, RBACPermissionsProps, rbacPermissionsPropsSchema } from '../schemas';

export const getRolePermissionsAction = async (id: string, chainGetter: BaseModuleDataAccess, solver: RBACEngine): Promise<RBACPermissionRecord[]> => {
  const permissionsBuffer = await chainGetter.getChainState(RBAC_PERMISSIONS_STATESTORE_KEY);

  if (!permissionsBuffer) {
    return Promise.reject(new Error("No permissions list available in stateStore."));
  }

  const permissionsArray = codec.decode<RBACPermissionsProps>(rbacPermissionsPropsSchema, permissionsBuffer)
  const permissionsObject = Object.fromEntries(permissionsArray.permissions.map(elem=> [elem.id,elem]))

  const rolePermissionsIds: string[] = solver.getRolePermissions(id);

  const result: RBACPermissionRecord[] = [];
  for (const permissionId of rolePermissionsIds) {
    result.push(permissionsObject[permissionId]);
  }

  return Promise.resolve(result);
}