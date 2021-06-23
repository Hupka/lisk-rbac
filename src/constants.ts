import { RBACPermissionsProps, RBACRolesProps } from "./data";

export const RBAC_PREFIX = "rbac"
export const RBAC_RULESET_STATESTORE_KEY = `${RBAC_PREFIX}:ruleset`; 
export const RBAC_RULESET_VERSIONS_STATESTORE_KEY = `${RBAC_PREFIX}:ruleset/versions`; 
export const RBAC_ROLES_STATESTORE_KEY = `${RBAC_PREFIX}:roles`;
export const RBAC_PERMISSIONS_STATESTORE_KEY = `${RBAC_PREFIX}:permissions`;

// Default roles are only being loaded when mining the genesisBlock, default roles & permissions will never be loaded again
export const DEFAULT_ROLES: RBACRolesProps = {
  roles: [
    {
      id: "1",
      name: "rbac_admin",
      description: "Role has permissions to change the RBAC ruleset.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [],
      lifecycle: "active"
    },
    {
      id: "2",
      name: "role_membership_admin",
      description: "Role has permissions to assign and remove roles from accounts.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [],
      lifecycle: "active"
    },
    {
      id: "3",
      name: "super_admin",
      description: "Role inherits permissions from the two roles rbac_admin and role_membership_admin.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [
        "1",
        "2"
      ],
      lifecycle: "active"
    }
  ],
  latest: 3
}

export const DEFAULT_PERMISSIONS: RBACPermissionsProps = {
  permissions: [
    {
      id: "1",
      associatedRoleIds: ["1","2"],
      resourceName: "roles",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "2",
      associatedRoleIds: ["1"],
      resourceName: "roles",
      operationName: "create",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "3",
      associatedRoleIds: ["1"],
      resourceName: "roles",
      operationName: "update",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "4",
      associatedRoleIds: ["1"],
      resourceName: "roles",
      operationName: "delete",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "5",
      associatedRoleIds: ["2"],
      resourceName: "role_membership",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "6",
      associatedRoleIds: ["2"],
      resourceName: "role_membership",
      operationName: "create",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "7",
      associatedRoleIds: ["2"],
      resourceName: "role_membership",
      operationName: "delete",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "8",
      associatedRoleIds: ["2"],
      resourceName: "roles",
      operationName: "read",
      transactionId: Buffer.from("genesis", "utf-8")
    }
  ],
  latest: 8
}



