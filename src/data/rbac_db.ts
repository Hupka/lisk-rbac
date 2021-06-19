// Interfaces and Lisk Schemas for roles

export interface RBACRoleRecord {
  id: string;
  name: string;
  description: string;
  transactionId: string;
  inheritance?: string[];
}

export interface RBACRolesProps {
  roles: RBACRoleRecord[];
}

export const RBACRoleRecordSchema = {
  $id: 'rbac/chainstate/roles/record',
  type: "object",
  required: ["id", "name", "description", "transaction_id"],
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
    transaction_id: {
      dataType: "string",
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
    }
  }
}

// Interfaces and Lisk Schemas for role permissions

export interface RBACPermissionRecord {
  roleId: string;
  resourceName: string;
  operationName: string;
  transactionId: string;
}

export interface RBACPermissionsProps {
  permissions: RBACPermissionRecord[];
}

export const RBACPermissionRecordSchema = {
  $id: 'rbac/chainstate/permissions/record',
  type: "object",
  required: ["role_id", "resource_name", "operation_name", "transaction_id"],
  properties: {
    role_id: {
      dataType: "string",
      fieldNumber: 1,
    },
    resource_name: {
      dataType: "string",
      fieldNumber: 2,
    },
    operation_name: {
      dataType: "string",
      fieldNumber: 3,
    },
    transaction_id: {
      dataType: "string",
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
  inherits?: string[];
}

export interface RBACRulesetRecord {
  roles: RBACRulesetRoleRecord[];
  version: BigInt;
  transactionId: string;
}

export interface RBACRulesets {
  rulesets: RBACRulesetRecord[];
  activeVersion: BigInt;
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
  required: ["role_id","can"],
  properties: {
    role_id: {
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
  required: ["roles", "version", "transaction_id"],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACRulesetRoleRecordSchema,
      }
    },
    version: {
      dataType: "sint64",
      fieldNumber: 2,
    },
    transaction_id: {
      dataType: "string",
      fieldNumber: 3,
    }
  }
}

export const RBACRulesetsSchema = {
  $id: 'rbac/chainstate/rulesets',
  type: "object",
  required: ["rulesets"],
  properties: {
    rulesets: {
      type: "array",
      fieldNumber: 1,
      items: {
        ...RBACRulesetRecordSchema,
      }
    },
    active_version: {
      dataType: "sint64",
      fieldNumber: 2,
    }
  }
}