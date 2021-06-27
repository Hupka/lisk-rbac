import {
  BaseModuleDataAccess,
  codec
} from 'lisk-sdk';
import { RBAC_ROLES_STATESTORE_KEY } from '../constants';
import {
  rbacRoleRecordSchema,
  RBACRolesProps,
  rbacRolesPropsSchema
} from '../schemas';



export const getRoleAction = async (id: string, chainGetter: BaseModuleDataAccess): Promise<Record<string, unknown>> => {
  const rolesListBuffer = await chainGetter.getChainState(RBAC_ROLES_STATESTORE_KEY);

  if (!rolesListBuffer) {
    return Promise.reject(new Error("No roles list available in stateStore."));
  }

  const rolesList = codec.decode<RBACRolesProps>(rbacRolesPropsSchema, rolesListBuffer)

  // 1. Verify that role with the sent id does exist
  const roleRecord = rolesList.roles.find(elem => id === elem.id);
  if (!roleRecord) {
    throw new Error(`Role with id '${id}' does not exist.`);
  }

  return Promise.resolve(codec.toJSON(rbacRoleRecordSchema, roleRecord));
}