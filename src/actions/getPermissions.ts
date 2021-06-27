import { BaseModuleDataAccess, codec } from 'lisk-sdk';
import { RBAC_PERMISSIONS_STATESTORE_KEY } from '../constants';
import { RBACPermissionsProps, rbacPermissionsPropsSchema } from '../schemas';

export const getPermissionsAction = async (chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  const permissionsBuffer = await chainGetter.getChainState(RBAC_PERMISSIONS_STATESTORE_KEY);

  if (!permissionsBuffer) {
    return Promise.reject(new Error("No permissions list available in stateStore."));
  }

  const permissions = codec.decode<RBACPermissionsProps>(rbacPermissionsPropsSchema, permissionsBuffer)

  return Promise.resolve(codec.toJSON(rbacPermissionsPropsSchema, permissions));
}