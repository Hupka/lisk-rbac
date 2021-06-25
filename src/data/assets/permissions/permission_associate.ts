export interface PermissionAsset {
  resourceName: string;
  operationName: string;
  description: string;
}

export interface AssociatePermissionsAssetProps {
  roleId: string;
  permissions: PermissionAsset[];
}

export const permissionAssetSchema = {
  $id: 'rbac/assets/permissions/record',
  type: "object",
  required: ["resourceName", "operationName", "description"],
  properties: {
    resourceName: {
      dataType: "string",
      fieldNumber: 1,
    },
    operationName: {
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