import { permissionAssetSchema, PermissionAsset } from './permission_associate'

export interface RemovePermissionsAssetProps {
	roleId: string;
  permissions: PermissionAsset[];
}

export const removePermissionsAssetPropsSchema = {
  $id: 'rbac/assets/permissions/remove',
	title: 'Transaction asset of the rbac module to remove association of a set of permissions with a role',
  type: "object",
  required: ["roleId", "permissions"],
  properties: {
    roleId: {
      dataType: "string",
      fieldNumber: 1,
    },
    permissions: {
      type: "array",
      fieldNumber: 2,
      items: {
        ...permissionAssetSchema,
      }
    },
  }
}