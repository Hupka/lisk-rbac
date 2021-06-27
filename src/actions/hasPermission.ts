import { Account } from '@liskhq/lisk-chain';
import { isHexString } from '@liskhq/lisk-validator';
import { BaseModuleDataAccess } from 'lisk-sdk';
import { RBACEngine } from '../rbac_algorithm';
import { RBACAccountProps } from '../schemas';
import { hasPermissionSolver } from '../utils';

export const hasPermissionAction = async (address: string | Buffer, resource: string, operation: string, chainGetter: BaseModuleDataAccess, solver: RBACEngine): Promise<boolean> => {
  if (typeof address === 'string' && !isHexString(address)) {
    throw new Error('Address parameter should be a hex string.');
  }

  if (typeof resource !== 'string' || typeof operation !== 'string') {
    throw new Error("Parameters 'resource' and 'operation' need to be of type string");
  }

  let account: Account<RBACAccountProps>;
  if (Buffer.isBuffer(address)) {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(address);
  } else {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(Buffer.from(address, 'hex'));
  }

  return hasPermissionSolver(account, resource, operation, solver);
}