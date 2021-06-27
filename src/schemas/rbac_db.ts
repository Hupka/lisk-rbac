// Interfaces and Lisk Schemas for roles

export interface RBACRoleRecord {
  id: string;
  name: string;
  description: string;
  transactionId: Buffer;
  inheritance: string[];
  lifecycle: string;
  minAccounts: number;
}

export interface RBACRolesProps {
  roles: RBACRoleRecord[];
  latest: number;
}

export const rbacRoleRecordSchema = {
  $id: 'rbac/chainstate/roles/record',
  type: "object",
  required: ["id", "name", "description", "transactionId", "inheritance", "lifecycle", "minAccounts"],
  properties: {
    id: {
      dataType: "string",
      fieldNumber: 1,
    },
    name: {
      dataType: "string",
      fieldNumber: 2,
    },
    description: {
      dataType: "string",
      fieldNumber: 3,
    },
    transactionId: {
      dataType: "bytes",
      fieldNumber: 4,
    },
    inheritance: {
      type: "array",
      fieldNumber: 5,
      items: {
        dataType: "string",
      }
    },
    lifecycle: {
      dataType: "string",
      fieldNumber: 6,
    },
    minAccounts: {
      dataType: "sint32",
      fieldNumber: 7,
    }
  }
}

export const rbacRolesPropsSchema = {
  $id: 'rbac/chainstate/roles',
  type: "object",
  required: ["roles", "latest"],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...rbacRoleRecordSchema,
      },
    },
    latest: {
      dataType: "sint32",
      fieldNumber: 2,
    }
  }
}

// Interfaces and Lisk Schemas for role permissions

export interface RBACPermissionRecord {
  id: string;
  associatedRoleIds: string[];
  resource: string;
  operation: string;
  description: string;
  transactionId: Buffer;
}

export interface RBACPermissionsProps {
  permissions: RBACPermissionRecord[];
  latest: number;
}

export const rbacPermissionRecordSchema = {
  $id: 'rbac/chainstate/permissions/record',
  type: "object",
  required: ["id", "associatedRoleIds", "resource", "operation", "description", "transactionId"],
  properties: {
    id: {
      dataType: "string",
      fieldNumber: 1,
    },
    associatedRoleIds: {
      type: "array",
      fieldNumber: 2,
      items: {
        dataType: "string",
      }
    },
    resource: {
      dataType: "string",
      fieldNumber: 3,
    },
    operation: {
      dataType: "string",
      fieldNumber: 4,
    },
    description: {
      dataType: "string",
      fieldNumber: 5,
    },
    transactionId: {
      dataType: "bytes",
      fieldNumber: 6,
    }
  }
}

export const rbacPermissionsPropsSchema = {
  $id: 'rbac/chainstate/permissions',
  type: "object",
  required: ["permissions", "latest"],
  properties: {
    permissions: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...rbacPermissionRecordSchema,
      }
    },
    latest: {
      dataType: "sint32",
      fieldNumber: 2,
    }
  }
}

// Interfaces and Lisk Schemas for the RBAC ruleset which is used by the RBAC validation engine

export interface RBACRulesetRuleRecord {
  role: RBACRoleRecord;
  permissions: RBACPermissionRecord[];
}

export interface RBACRulesetRecord {
  roles: RBACRulesetRuleRecord[];
  version: number;
  blockId: Buffer;
}

export interface RBACRuleset {
  ruleset: RBACRulesetRecord;
  activeVersion: number;
  latestVersion: number;
}

export const rbacRulesetRoleRecordSchema = {
  $id: 'rbac/chainstate/ruleset/role/record',
  type: "object",
  required: ["role", "permissions"],
  properties: {
    role: {
      fieldNumber: 1,
      ...rbacRoleRecordSchema,

    },
    permissions: {
      type: "array",
      fieldNumber: 2,
      items: {
        ...rbacPermissionRecordSchema,
      }
    },
  }
}

export const rbacRulesetRecordSchema = {
  $id: 'rbac/chainstate/rulesets/record',
  type: "object",
  required: ["roles", "version", "blockId"],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...rbacRulesetRoleRecordSchema,
      }
    },
    version: {
      dataType: "sint32",
      fieldNumber: 2,
    },
    blockId: {
      dataType: "bytes",
      fieldNumber: 3,
    }
  }
}

export const rbacRulesetSchema = {
  $id: 'rbac/chainstate/rulesets',
  type: "object",
  required: ["ruleset", "activeVersion", "latestVersion"],
  properties: {
    ruleset: {
      fieldNumber: 1,
      ...rbacRulesetRecordSchema,
    },
    activeVersion: {
      dataType: "sint32",
      fieldNumber: 2,
    },
    latestVersion: {
      dataType: "sint32",
      fieldNumber: 3,
    }
  }
}

// Interfaces and Lisk Schemas for 

export interface RoleAccounts {
  id: string;
  addresses: Buffer[];
  lifecycle: string;
}

export const roleAccountsSchema = {
  $id: 'rbac/chainstate/roleAccounts',
  type: "object",
  required: ["id", "addresses", "lifecycle"],
  properties: {
    id: {
      fieldNumber: 1,
      dataType: "string",
    },
    addresses: {
      fieldNumber: 2,
      type: "array",
      items: {
        dataType: "bytes",
      }
    },
    lifecycle: {
      fieldNumber: 3,
      dataType: "string",
    },
  }
}