export interface PermissionAsset {
  resource: string;
  operation: string;
  description: string;
}

export interface AssociatePermissionsAssetProps {
  roleId: string;
  permissions: PermissionAsset[];
}

export const permissionAssetSchema = {
  $id: 'rbac/assets/permissions/record',
  type: "object",
  required: ["resource", "operation", "description"],
  properties: {
    resource: {
      dataType: "string",
      fieldNumber: 1,
    },
    operation: {
      dataType: "string",
      fieldNumber: 2,
    },
    description: {
      dataType: "string",
      fieldNumber: 3,
    },
  }
}

export const associatePermissionsAssetPropsSchema = {
  $id: 'rbac/assets/permissions/associate',
	title: 'Transaction asset of the rbac module to associate a set of permissions with a role',
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