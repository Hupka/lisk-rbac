import { RBACPermissionsProps, RBACRolesProps } from "./data";

export const DEFAULT_ROLES: RBACRolesProps = {
  roles: [
    {
      id: "1",
      name: "rbac_admin",
      description: "Role has permissions to change the RBAC ruleset.",
      transactionId: "genesis"
    },
    {
      id: "2",
      name: "role_membership_admin",
      description: "Role has permissions to assign and remove roles from accounts.",
      transactionId: "genesis"
    },
    {
      id: "3",
      name: "super_admin",
      description: "Role inherits permissions from the two roles rbac_admin and role_membership_admin.",
      transactionId: "genesis",
      inheritance: [
        "1",
        "2"
      ]
    }
  ]
}

export const DEFAULT_PERMISSIONS: RBACPermissionsProps = {
  permissions: [
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "read",
      transactionId: "genesis"
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "create",
      transactionId: "genesis"
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "update",
      transactionId: "genesis"
    },
    {
      roleId: "1",
      resourceName: "roles",
      operationName: "delete",
      transactionId: "genesis"
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "read",
      transactionId: "genesis"
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "create",
      transactionId: "genesis"
    },
    {
      roleId: "2",
      resourceName: "role_membership",
      operationName: "delete",
      transactionId: "genesis"
    },
    {
      roleId: "2",
      resourceName: "roles",
      operationName: "read",
      transactionId: "genesis"
    }
  ]
}



