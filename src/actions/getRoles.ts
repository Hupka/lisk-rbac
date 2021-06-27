import {
  BaseModuleDataAccess,
  codec
} from 'lisk-sdk';
import { RBAC_ROLES_STATESTORE_KEY } from '../constants';
import {
  RBACRolesProps,
  rbacRolesPropsSchema
} from '../schemas';



export const getRolesAction = async (chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  const rolesBuffer = await chainGetter.getChainState(RBAC_ROLES_STATESTORE_KEY);

  if (!rolesBuffer) {
    return Promise.reject(new Error("No roles list available in stateStore."));
  }

  const roles = codec.decode<RBACRolesProps>(rbacRolesPropsSchema, rolesBuffer)

  return Promise.resolve(codec.toJSON(rbacRolesPropsSchema, roles));
}