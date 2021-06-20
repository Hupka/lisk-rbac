import { RBACPermissionsProps, RBACRolesProps } from "./data";

export const RBAC_RULESETS_STATESTORE_KEY = "rbac:rbac_rulesets"; 
export const RBAC_ROLES_STATESTORE_KEY = "rbac:roles";
export const RBAC_PERMISSIONS_STATESTORE_KEY = "rbac:permissions";

export const DEFAULT_ROLES: RBACRolesProps = {
  roles: [
    {
      id: "1",
      name: "rbac_admin",
      description: "Role has permissions to change the RBAC ruleset.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: []
    },
    {
      id: "2",
      name: "role_membership_admin",
      description: "Role has permissions to assign and remove roles from accounts.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: []
    },
    {
      id: "3",
      name: "super_admin",
      description: "Role inherits permissions from the two roles rbac_admin and role_membership_admin.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [
        "1",
        "2"
      ]
    }
  ],
  latest: 3
}

export const DEFAULT_PERMISSIONS: RBACPermissionsProps = {
  permissions: [
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "create",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "update",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "delete",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "create",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "delete",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      roleId: "2",
      resourceName: "roles",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    }
  ]
}



