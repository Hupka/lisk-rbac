// Interfaces and Lisk Schemas for roles

export interface RBACRoleRecord {
  id: string;
  name: string;
  description: string;
  transactionId: Buffer;
  inheritance: string[];
  lifecycle: string;
}

export interface RBACRolesProps {
  roles: RBACRoleRecord[];
  latest: number;
}

export const RBACRoleRecordSchema = {
  $id: 'rbac/chainstate/roles/record',
  type: "object",
  required: ["id", "name", "description", "transactionId", "inheritance", "lifecycle"],
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
  }
}

export const RBACRolesPropsSchema = {
  $id: 'rbac/chainstate/roles',
  type: "object",
  required: ["roles", "latest"],
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
  id: string;
  associatedRoleIds: string[];
  resourceName: string;
  operationName: string;
  transactionId: Buffer;
}

export interface RBACPermissionsProps {
  permissions: RBACPermissionRecord[];
  latest: number;
}

export const RBACPermissionRecordSchema = {
  $id: 'rbac/chainstate/permissions/record',
  type: "object",
  required: ["id", "associatedRoleIds", "resourceName", "operationName", "transactionId"],
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
    resourceName: {
      dataType: "string",
      fieldNumber: 3,
    },
    operationName: {
      dataType: "string",
      fieldNumber: 4,
    },
    transactionId: {
      dataType: "bytes",
      fieldNumber: 5,
    }
  }
}

export const RBACPermissionsPropsSchema = {
  $id: 'rbac/chainstate/permissions',
  type: "object",
  required: ["permissions", "latest"],
  properties: {
    permissions: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACPermissionRecordSchema,
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

export const RBACRulesetRoleRecordSchema = {
  $id: 'rbac/chainstate/ruleset/role/record',
  type: "object",
  required: ["role", "permissions"],
  properties: {
    role: {
      fieldNumber: 1,
      ...RBACRoleRecordSchema,

    },
    permissions: {
      type: "array",
      fieldNumber: 2,
      items: {
        ...RBACPermissionRecordSchema,
      }
    },
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

export const RBACRulesetSchema = {
  $id: 'rbac/chainstate/rulesets',
  type: "object",
  required: ["ruleset", "activeVersion", "latestVersion"],
  properties: {
    ruleset: {
      fieldNumber: 1,
      ...RBACRulesetRecordSchema,
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