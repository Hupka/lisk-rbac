# Lisk RBAC Module

## What is the Lisk RBAC Module?

The Lisk RBAC Module provides a lightweight implementation of role-based access controls for a Lisk blockchain application. 

**Features:**
* Define a custom set of roles and permissions for your blockchain application.
* Assign / remove roles to user accounts using transactions.
* The module provides an API to validate a user account's permissions.
* Add and remove role on the running blockchain through transactions.
* Grant and revoke permissions for certain roles on the running blockchain through transactions.

## Motivation

The Lisk ecosystem encourages developers to run a custom blockchain to build their own blockchain application on top of it. For many use cases one of the very early challenges is to implement robust and secure mechanisms to authorize actions happening on the blockchain. The problem of *authorization* is usually very specific to a certain use case. That's why there are no all-on-one implementations out there - not even for regular web applications. 

With this module I hope to reduce the barrier of entry for new developers and teams by providing them with a slim & lightweight RBAC implementation to get them going more quickly. 
