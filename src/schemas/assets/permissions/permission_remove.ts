export interface PermissionAssetRed {
  resource: string;
  operation: string;
}

export interface RemovePermissionsAssetProps {
	roleId: string;
  permissions: PermissionAssetRed[];
}

export const permissionAssetRedSchema = {
  $id: 'rbac/assets/permissions/redRecord',
  type: "object",
  required: ["resource", "operation"],
  properties: {
    resource: {
      dataType: "string",
      fieldNumber: 1,
    },
    operation: {
      dataType: "string",
      fieldNumber: 2,
    }
  }
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
        ...permissionAssetRedSchema,
      }
    },
  }
}