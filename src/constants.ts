import { AssignRoleMembershipAssetProps, RBACPermissionsProps, RBACRolesProps } from "./schemas";

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
      associatedRoleIds: ["1", "2"],
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
      associatedRoleIds: ["3"],
      resourceName: "rulesets",
      operationName: "setversion",
      transactionId: Buffer.from("genesis", "utf-8")
    }
  ],
  latest: 8
}

export const GENESIS_ACCOUNTS: AssignRoleMembershipAssetProps[] = [
  {
    roles: ["1"],
    accounts: ["9cabee3d27426676b852ce6b804cb2fdff7cd0b5"],
  },
  {
    roles: ["2"],
    accounts: ["463e7e879b7bdc6a97ec02a2a603aa1a46a04c80"],
  },
  {
    roles: ["3"],
    accounts: ["d04699e57c4a3846c988f3c15306796f8eae5c1c"],
  },
]


