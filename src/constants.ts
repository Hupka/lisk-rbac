import { RBACPermissionsProps, RBACRolesProps } from "./schemas";

export const RBAC_PREFIX = "rbac"
export const RBAC_RULESET_STATESTORE_KEY = `${RBAC_PREFIX}:ruleset`;
export const RBAC_RULESET_VERSIONS_STATESTORE_KEY = `${RBAC_PREFIX}:ruleset/versions`;
export const RBAC_ROLES_STATESTORE_KEY = `${RBAC_PREFIX}:roles`;
export const RBAC_PERMISSIONS_STATESTORE_KEY = `${RBAC_PREFIX}:permissions`;
export const RBAC_ROLE_ACCOUNTS_STATESTORE_KEY = `${RBAC_PREFIX}:roleAccounts`;

export const RBAC_DEFAULT_ROLES_STATESTORE_KEY = `${RBAC_PREFIX}:roles/default`;
export const RBAC_DEFAULT_PERMISSIONS_STATESTORE_KEY = `${RBAC_PREFIX}:permissions/default`;

export const RBAC_ROLE_LIFECYCLE_ACTIVE = "active";
export const RBAC_ROLE_LIFECYCLE_INACTIVE = "inactive";

// Default roles are only being loaded when mining the genesisBlock, default roles & permissions will never be loaded again
export const DEFAULT_ROLES: RBACRolesProps = {
  roles: [
    {
      id: "1",
      name: "rbac_admin",
      description: "Role has permissions to change the RBAC ruleset.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [],
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE,
      minAccounts: 1
    },
    {
      id: "2",
      name: "role_membership_admin",
      description: "Role has permissions to assign and remove roles from accounts.",
      transactionId: Buffer.from("genesis", "utf-8"),
      inheritance: [],
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE,
      minAccounts: 1
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
      lifecycle: RBAC_ROLE_LIFECYCLE_ACTIVE,
      minAccounts: 1
    }
  ],
  latest: 3
}

export const DEFAULT_PERMISSIONS: RBACPermissionsProps = {
  permissions: [
    {
      id: "1",
      associatedRoleIds: ["1"],
      resource: "roles",
      operation: "create",
      description: "Grants permission to create new roles.",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "2",
      associatedRoleIds: ["1"],
      resource: "roles",
      operation: "update",
      description: "Grants permission to update existing roles. This includes adding and removing permissions from roles.",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "3",
      associatedRoleIds: ["1"],
      resource: "roles",
      operation: "delete",
      description: "Grants permission to delete existing roles.",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "4",
      associatedRoleIds: ["2"],
      resource: "role_membership",
      operation: "assign",
      description: "Grants permission to assign an account a role.",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "5",
      associatedRoleIds: ["2"],
      resource: "role_membership",
      operation: "remove",
      description: "Grants permission to remove a role from an account.",
      transactionId: Buffer.from("genesis", "utf-8")
    },
    {
      id: "6",
      associatedRoleIds: ["3"],
      resource: "rulesets",
      operation: "setversion",
      description: "Grants permission to restore a previous ruleset version.",
      transactionId: Buffer.from("genesis", "utf-8")
    }
  ],
  latest: 6
}