# Lisk RBAC Module

## What is the Lisk RBAC Module?

The Lisk RBAC Module provides a lightweight implementation of role-based access controls for a Lisk blockchain application. This enables any custom application to conveniently integrate a robust and flexible authorization engine to control access to assets stored on the blockchain.

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

### Authorization & Blockchain

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
* A second way to start is to checkout the repository and execute `npm install` && `npm run start:host` to start a super slim host application which sits in the folder `./test/test-utils`. Once the chain runs, you can visit `http://localhost:4005` to open up Lisk Dashboard an start interacting with the module's apis right away.

A great start is to either use the included commands or adding the Lisk Dashboard plugin to the application and start executing actions and submitting transactions from there. 

### List of Action Snippets examples

Accounts:
* Devnet Account `d04699e57c4a3846c988f3c15306796f8eae5c1c` passphrase
  ```
  peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready
  ```
* Devnet Account `9cabee3d27426676b852ce6b804cb2fdff7cd0b5` passphrase
  ```
  endless focus guilt bronze hold economy bulk parent soon tower cement venue
  ```

**HasPermissions Action**
```JSON
{
  "resource":"role_membership", 
  "operation":"assign", 
  "address":"d04699e57c4a3846c988f3c15306796f8eae5c1c"
} // true
{
  "resource":"role_membership", 
  "operation":"assign", 
  "address":"9cabee3d27426676b852ce6b804cb2fdff7cd0b5"
} // false

```