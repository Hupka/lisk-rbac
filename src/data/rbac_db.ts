// Interfaces and Lisk Schemas for roles

export interface RBACRoleRecord {
  id: string;
  name: string;
  description: string;
  transactionId: Buffer;
  inheritance: string[];
}

export interface RBACRolesProps {
  roles: RBACRoleRecord[];
  latest: number;
}

export const RBACRoleRecordSchema = {
  $id: 'rbac/chainstate/roles/record',
  type: "object",
  required: ["id", "name", "description", "transactionId"],
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
    }
  }
}

export const RBACRolesPropsSchema = {
  $id: 'rbac/chainstate/roles',
  type: "object",
  required: ["roles"],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACRoleRecordSchema,
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
  roleId: string;
  resourceName: string;
  operationName: string;
  transactionId: Buffer;
}

export interface RBACPermissionsProps {
  permissions: RBACPermissionRecord[];
}

export const RBACPermissionRecordSchema = {
  $id: 'rbac/chainstate/permissions/record',
  type: "object",
  required: ["roleId", "resourceName", "operationName", "transactionId"],
  properties: {
    roleId: {
      dataType: "string",
      fieldNumber: 1,
    },
    resourceName: {
      dataType: "string",
      fieldNumber: 2,
    },
    operationName: {
      dataType: "string",
      fieldNumber: 3,
    },
    transactionId: {
      dataType: "bytes",
      fieldNumber: 4,
    }
  }
}

export const RBACPermissionsPropsSchema = {
  $id: 'rbac/chainstate/permissions',
  type: "object",
  required: ["permissions"],
  properties: {
    permissions: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACPermissionRecordSchema,
      },
    }
  }
}

// Interfaces and Lisk Schemas for the RBAC ruleset which is used by the RBAC validation engine

export interface RBACRulesetPermissionRecord {
  name: string;
  operation: string;
}

export interface RBACRulesetRoleRecord {
  roleId: string;
  can: RBACRulesetPermissionRecord[];
  inherits: string[];
}

export interface RBACRulesetRecord {
  roles: RBACRulesetRoleRecord[];
  version: number;
  blockId: Buffer;
}

export interface RBACRulesets {
  rulesets: RBACRulesetRecord[];
  activeVersion: number;
  latestVersion: number;
}

export const RBACRulesetPermissionRecordSchema = {
  $id: 'rbac/chainstate/rulesets/permissionrecord',
  type: "object",
  required: ["name", "operation"],
  properties: {
    name: {
      dataType: "string",
      fieldNumber: 1,
    },
    operation: {
      dataType: "string",
      fieldNumber: 2,
    }
  }
}

export const RBACRulesetRoleRecordSchema = {
  $id: 'rbac/chainstate/rulesets/roles/record',
  type: "object",
  required: ["roleId", "can"],
  properties: {
    roleId: {
      dataType: "string",
      fieldNumber: 1,
    },
    can: {
      type: "array",
      fieldNumber: 2,
      items: {
        ...RBACRulesetPermissionRecordSchema,
      }
    },
    inherits: {
      type: "array",
      fieldNumber: 3,
      items: {
        dataType: "string",
      }
    }
  }
}

export const RBACRulesetRecordSchema = {
  $id: 'rbac/chainstate/rulesets/record',
  type: "object",
  required: ["roles", "version", "blockId"],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACRulesetRoleRecordSchema,
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

export const RBACRulesetsSchema = {
  $id: 'rbac/chainstate/rulesets',
  type: "object",
  required: ["rulesets", "activeVersion", "latestVersion"],
  properties: {
    rulesets: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACRulesetRecordSchema,
      }
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