<h1> Lisk RBAC Module </h1>

A Fast and Flexible authorization standalone-module for blockchain applications developed with the Lisk SDK.

<hr>

**Table of Contents**
- [What is the Lisk RBAC Module?](#what-is-the-lisk-rbac-module)
- [Motivation](#motivation)
  - [The Authorization Problem & Blockchain](#the-authorization-problem--blockchain)
- [Installation](#installation)
- [Getting into using it](#getting-into-using-it)
- [How it actually works](#how-it-actually-works)
  - [Transactions to configure the RBAC rulesets](#transactions-to-configure-the-rbac-rulesets)
    - [1. CREATE Role](#1-create-role)
    - [2. UPDATE Role](#2-update-role)
    - [3. DELETE Role](#3-delete-role)
    - [4. ASSOCIATE Permissions](#4-associate-permissions)
    - [5. REMOVE Permissions](#5-remove-permissions)
  - [Transactions to manage Role Memberships](#transactions-to-manage-role-memberships)
    - [1. ASSIGN Role Membership](#1-assign-role-membership)
    - [2. REMOVE Role Membership](#2-remove-role-membership)
  - [List of Actions](#list-of-actions)
    - [1. HasPermissions Action](#1-haspermissions-action)
    - [2. GetAccountRoles Action](#2-getaccountroles-action)
    - [3. GetRole Action](#3-getrole-action)
    - [4. GetRoles Action](#4-getroles-action)
    - [5. GetPermissions Action](#5-getpermissions-action)
    - [6. GetRoleAccounts Action](#6-getroleaccounts-action)

## What is the Lisk RBAC Module?

The Lisk RBAC Module provides a lightweight implementation of role-based access controls for a Lisk blockchain application. This enables any custom application to conveniently integrate a robust and flexible authorization engine to control access to assets stored on the blockchain.

**Project contents**
* Lisk Module containing 7 transactions, 8 actions, 6 commands, 3 reducers
* HTTP Rest API plugin, including a [spec file](https://github.com/Hupka/lisk-rbac/blob/main/src/http-api/openapi_spec.yaml) in OpenAPI 3.0 format.
* Slim demo application including both, module and plugin

**Features:**
* Define custom sets of roles and permissions for your blockchain application.
* The module provides actions and reducers to validate every account's permissions. This API is designed to be extremely fast as this can be the Achilles' heel for any scaled-out authorization use case. 
* Assign / remove roles to user accounts using transactions. This can be done also in batches to not be required to submit a transaction for a single account-role assignment.
* Add and remove role and permissions on the running blockchain through transactions.
* Roles can inherit from each other without any performance loss when solving `hasPermission` requests for a given account.
* Grant and revoke permissions for certain roles on the running blockchain through transactions.
* The module provides an api to get all accounts which are assigned a certain role.
* The module includes various actions and reducers to fetch roles and permissions which allows other modules and plugins to build logic on top of this.
* All changes to the RBAC configuration is versioned on the chain and can be restored at any time.
* Very little integration effort to get going 🤓 🥳  

## Motivation

The Lisk ecosystem encourages developers to run a custom blockchain to build their own blockchain application on top of it. For many use cases one of the very early challenges is to implement robust and secure mechanisms to authorize actions happening on the blockchain. The problem of *authorization* is usually very specific to a certain use case. That's why there are no all-on-one implementations out there - not even for regular web applications. 

With this module I hope to reduce the barrier of entry for new developers and teams by providing them with a slim & lightweight RBAC implementation to get them going more quickly. 

### The Authorization Problem & Blockchain

In part the motivation for this project was the hypothesis that *authorization* as an IT challenge might benefit from the characteristics of a blockchain. 

When building distributed IT systems, while aiming for maximum independence and high velocity, it is often a good idea to enforce the same mechanisms for authentication (AuthN) and authorization (AuthZ) in every part of the system for security reasons. This can become a challenge when the business is scaling a lot or generally operating at scale. 

The downside when enforcing *one-way / one-system* for Authentication and Authorization is that one enacts a single-point-of-failure. Today this is generally accepted because it becomes increasingly easier to protect crucial the AuthN & AuthZ entities. But it is still very expensive to operate and comes with high risks by design. 

> But what if the single-point-of-failure is *not* a **single point**?

With a blockchain application and its concept of cheap interconnected nodes providing the same access to the data stored from anywhere, this seems like an inexpensive yet very robust and scalable solution for bringing AuthZ to every edge of a distributed system. 

## Installation

* Install the package using npm: `npm install lisk-rbac`
* In the application's `genesisConfig` add accounts to the module's default roles for configuring the RBAC engine while the blockchain is running. The accounts mentioned below are available in the Devnet Configuration in the Lisk SDK. 
  ```Typescript
  genesisConfig: {
    rbacConfig: {
      genesisAccounts: [{
        roles: ["1"],
        addresses: ["9cabee3d27426676b852ce6b804cb2fdff7cd0b5"],
      },
      {
        roles: ["2"],
        addresses: ["463e7e879b7bdc6a97ec02a2a603aa1a46a04c80"],
      },
      {
        roles: ["3"],
        addresses: ["d04699e57c4a3846c988f3c15306796f8eae5c1c"],
      }]
    }
  },
  ```
  Out of these number `3` is the Super Admin role which inherits the permission sets of the other two. This account can be used to do both: configure the RBAC engine as well as assign accounts certain roles. 
* Start the blockchain application and start interacting with the module's actions, reducers and transactions using the general Lisk Framework tooling. 

A great start is to either use the included commands or adding the Lisk Dashboard plugin to the application and start executing actions and submitting transactions from there. 

## Getting into using it

An easy way to start is to checkout the repository and execute `npm install` && `npm run start:host` to start a super slim host application which sits in the folder `./test/test-utils`. Once the chain runs, you can visit `http://localhost:4005` to open up Lisk Dashboard an start interacting with the module's apis right away.

When using the test application included in the package one can use the following Devnet Accounts:

```Typescript
// Devnet Account 'd04699e57c4a3846c988f3c15306796f8eae5c1c' passphrase
peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready
```
```Typescript
// Devnet Account '9cabee3d27426676b852ce6b804cb2fdff7cd0b5' passphrase
endless focus guilt bronze hold economy bulk parent soon tower cement venue
```

## How it actually works

At its core this module contains a very efficient implementation of a solver for RBAC rulesets. This solver is implemented in Typescript and contains a comprehensive suite of well-written automated tests. The project can be found here: https://github.com/SkeLLLa/fast-rbac. In the project included is also a benchmark to show off the solver's performance in various configurations. 

This module at any time stores all the configuration for the RBAC solver on the blockchain. When the node spins up, a certain version of the RBAC ruleset is loaded into the solver and the node can serve all API requests with low latency. Every time a block is confirmed which includes transactions of this module, a new version of a RBAC ruleset is generated and loaded by the solver. 

The main effort for the implementation up until this point was to come up with a good design for the blockchain's `stateStore` to allow a node to efficiently serve various API use cases. As a baseline for the provided use cases inspiration had been taken from the [Auth0 authorization API](https://auth0.com/docs/api/management/v2).

### Transactions to configure the RBAC rulesets

This block of transactions includes all operations to configure roles an their associated permissions. Both, roles and permissions, will always have the `transactionId` of the updating asset attached which allows for detailed investigation of the updating event and creates a solid audit trail.

Any transactions of this type will trigger a reload of the RBAC solver in the `afterBlockApply` lifecycle hook. Including in this reload is the creation of a new "RBAC ruleset" version that is stored on the blockchain and has the `blockId` attached. 

#### 1. CREATE Role

This transaction creates a new role in the database. The module adds additional information to the role, such as the `transactionId` and sets the role's `lifecycle = active`. 

**Properties:**
* Transaction Name: `rbac:roles:create`
* Required permissions: `roles:create`
* Default role holding this permission: 
  * `rbac_admin - "1"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:roles:create
{ 
  "name":"nft-artist", 
  "description":"This role is being assigned to registered NFT artists", 
  "inheritance":[]
}
```

**Rules for this transaction:**
* Every new role created gets an `id` assigned (an integer counting up with every added role).
* Role names need to be unique.
* Role names are stored in lower-case letters.
* Role names need to be at least 3 and at maximum 64 characters.
* Only the following special characters are allowed for role names: `"." "-" "_"`
* Inheritance accepts role `id`s as strings, e.g. `["1", "2"]`. Roles mentioned in the `inheritance` array need to exist on the blockchain. 

#### 2. UPDATE Role 

This transaction updates an existing role on the blockchain. 

**Properties:**
* Transaction Name: `rbac:roles:update`
* Required permissions: `roles:update`
* Default role holding this permission: 
  * `rbac_admin - "1"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:roles:update
{ 
  "id": "4",
  "name":"nft-artist-updated", 
  "description":"This role is being assigned to registered NFT artists, for real", 
  "inheritance":[]
}
```

**Rules for this transaction:**
* The same rules as for `roles:create` apply
* This transaction always updates all the keys `name`, `description` and `inheritance`
* Default roles can not be updated

#### 3. DELETE Role 

This transaction removes a role from the RBAC solver. It actually keeps the role in the database but setting its `lifecycle = inactive` in case a previous RBAC ruleset wants to be loaded at a later stage. 

**Properties:**
* Transaction Name: `rbac:roles:delete`
* Required permissions: `roles:delete`
* Default role holding this permission: 
  * `rbac_admin - "1"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:roles:delete
{ 
  "id": "4"
}
```

**Rules for this transaction:**
* Default roles can not be deleted.

#### 4. ASSOCIATE Permissions

This transaction associates a set of permissions to a role in the database. A permission is a combination of a `resource` and an `operation` to be performed on this resource.

**Properties:**
* Transaction Name: `rbac:permissions:associate`
* Required permissions: `roles:update`
* Default role holding this permission: 
  * `rbac_admin - "1"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:permissions:associate
{ 
  "roleId":"4", 
  "permissions": [
    {
      "resource":"artist-group", 
      "operation":"create",
      "description":"This permissions allows a role to register a new artist group on the blockchain."
    },
    {
      "resource":"nft", 
      "operation":"create",
      "description":"This permissions allows a role to submit new NFTs to the blockchain."
    },
  ]
}
```

**Rules for this transaction:**
* Both, `resource` and `operation`, need to be at least 3 and at maximum 64 characters long.
* Permissions can only be added to existing roles. 
* Submitting a transaction containing the same combination of `resource` and `operation` as an existing permission actually makes this a shared permission between two roles.
* Permissions can not be added to Default roles.

#### 5. REMOVE Permissions

This transaction removes a set of permissions from a role in the database. A permission is a combination of a `resource` and an `operation` to be performed on this resource.

**Properties:**
* Transaction Name: `rbac:permissions:remove`
* Required permissions: `roles:update`
* Default role holding this permission: 
  * `rbac_admin - "1"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:permissions:remove
{ 
  "roleId":"4", 
  "permissions": [
    {
      "resource":"artist-group", 
      "operation":"create",
    }
  ]
}
```

**Rules for this transaction:**
* Permissions can not be removed from Default roles.

### Transactions to manage Role Memberships

These transactions are expected to be the most often submitted transaction on any blockchain including this module. Role memberships are assigned and removed using transactions. It is guaranteed that all transactions submitted within one block are being processed without leading to inconsistencies.

These kinds of transactions do not trigger a reload of the RBAC ruleset.

#### 1. ASSIGN Role Membership

This transaction assigns a set of roles to a set of accounts registered on the blockchain. 

**Properties:**
* Transaction Name: `rbac:role_membership:assign`
* Required permissions: `role_membership:assign`
* Default role holding this permission: 
  * `role_membership_admin - "2"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:role_membership:assign
{ 
  "addresses":[
    "d04699e57c4a3846c988f3c15306796f8eae5c1c",
    "9cabee3d27426676b852ce6b804cb2fdff7cd0b5"
  ], 
  "roles": [
    "4" 
  ]
}
```

**Rules for this transaction:**
* Addresses need to submitted as `hex strings`.
* At this point, a maximum of 30 addresses and 30 roles can be included in one transaction. This number is chosen arbitrarily and will be adapted later, it had been tested.
* Only existing roles can be assigned, all attempted assignments of removed roles (`lifecycle = inactive`) will fail.

#### 2. REMOVE Role Membership

This transaction removes a set of roles from a set of accounts registered on the blockchain. Since the Default Roles are crucial to the continuing operation of the blockchain, all of them include a "minimum account number". If any transaction of this type would result in a too low number for `minAccount` it will be discarded.

**Properties:**
* Transaction Name: `rbac:role_membership:remove`
* Required permissions: `role_membership:remove`
* Default role holding this permission: 
  * `role_membership_admin - "2"`
  * `super_admin - "3"` 

```JSON
// Example transaction for rbac:role_membership:remove
{ 
  "addresses":[
    "9cabee3d27426676b852ce6b804cb2fdff7cd0b5",
  ], 
  "roles": [
    "1", 
    "4" 
  ]
}
```

**Rules for this transaction:**
* Default accounts have a `minAccounts` property. Any transaction that would lead to a role being assigned to a too small number of accounts will be discarded.
* Roles can actually be removed from any of the Default Accounts for the Default roles, *if* the `minAccounts` property is not violated. 

### List of Actions

The module contains a set of `Actions`. These include getters for the RBAC configuration as well as the crucial *hasPermission* action to check if an account can actually perform an operation on a given resource.

#### 1. HasPermissions Action

Checks if a given account with `address` has the permission to perform `operation` on `resource`. Returns a boolean. 

```JSON
// Action: rbac:hasPermission
{
  "resource":"role_membership", 
  "operation":"assign", 
  "address":"d04699e57c4a3846c988f3c15306796f8eae5c1c"
} // "true"
{
  "resource":"role_membership", 
  "operation":"assign", 
  "address":"9cabee3d27426676b852ce6b804cb2fdff7cd0b5"
} // "false"
```

```Typescript
// Implementation example of how to invoke the `hasPermission` reducer (which shared the logic with the `hasPermission` action): 
const accountAddress = Buffer.from("d04699e57c4a3846c988f3c15306796f8eae5c1c", 'hex')
const permissions = [
    { resource: "roles", operation: "create" },
    { resource: "roles", operation: "update" },
    { resource: "roles", operation: "delete" }
  ];

// 1. Verify that sender has ALL necessary permission to perform transaction
const hasPermission: boolean[] = [];
for (const permission of permissions) {
  if (await reducerHandler.invoke(`rbac:hasPermission`, {
    address: accountAddress,
    resource: permission.resource,
    operation: permission.operation
  }).then((result) => result)) {
    hasPermission.push(true);
  } else {
    hasPermission.push(false);
  }
}

// 2. Do nothing when account does not have role with sufficient permission
if (hasPermission.filter(elem => !elem).length) {
  throw new Error(`Account '${transaction.accountAddress.toString('hex')}' does not have sufficient permissions to perform '${this.name}'.`);
}
```

#### 2. GetAccountRoles Action

Returns all roles which are assigned to an account with `address`. 

```JSON
// Action: rbac:getAccountRoles
{
  "address": "d04699e57c4a3846c988f3c15306796f8eae5c1c"
} 
```
```JSON
// Result:
{
  "rbac": [
   {
     "id": "3",
     "name": "super_admin",
     "description": "Role inherits permissions from the two roles rbac_admin and role_membership_admin."
   }
  ]
}
```

#### 3. GetRole Action

Returns on object holding all properties for a registered role. Throws an error if role with `id` does not exist on the chain. Also returns removed roles which have their property `lifecycle = inactive`.

```JSON
// Action: rbac:getRole
{
  "id":"1", 
} 
```
```JSON
// Result:
{
  "id":"1",
  "name":"rbac_admin",
  "description":"Role has permissions to change the RBAC ruleset",
  "transactionId":"<transactionId>",
  "inheritance":[],
  "lifecycle":"active",
  "minAccounts":"1",
}
```

#### 4. GetRoles Action

Returns all roles registered on the blockchain. Also returns removed roles which have their property `lifecycle = inactive`.

```JSON
// Action: rbac:getRoles
{}
```
```JSON
// Result:
[
  {
    "id":"1",
    "name":"rbac_admin",
    "description":"Role has permissions to change the RBAC ruleset",
    "transactionId":"<transactionId>",
    "inheritance":[],
    "lifecycle":"active",
    "minAccounts":"1",
  }
]
```

#### 5. GetPermissions Action

Returns all permissions registered on the blockchain. 

```JSON
// Action: rbac:getPermissions
{}
```
```JSON
// Result:
[
  {
    "id": "1",
    "associatedRoleIds": ["1"],
    "resource": "roles",
    "operation": "create",
    "description": "Grants permission to create new roles.",
    "transactionId": "<transactionId>"
  }
]
```

#### 6. GetRoleAccounts Action

Returns all accounts which have a certain role assigned. Accounts are returned as type `Buffer`

```JSON
// Action: rbac:getRoleAccounts
{
  "id": "3"
}
```

```JSON
// Result:
{
  "id": "1",
  "addresses": [
    "<addressAsBuffer>",
    "<addressAsBuffer>"
  ],
  "lifecycle": "active"
}
```