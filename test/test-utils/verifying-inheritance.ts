/* eslint-disable no-console */

import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from "../../src/constants";
import { createRuleset, loadRBACRuleset } from "../../src/utils";

const a = loadRBACRuleset(createRuleset(DEFAULT_ROLES, DEFAULT_PERMISSIONS, "genesis", BigInt(1)))

console.log(a.can('1', 'roles', 'create')); // true
console.log(a.can('2', 'roles', 'create')); // true
console.log(a.can('3', 'roles', 'create')); // true

console.log(a.getRules());

