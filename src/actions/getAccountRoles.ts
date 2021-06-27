import { Account } from '@liskhq/lisk-chain';
import { isHexString } from '@liskhq/lisk-validator';
import { BaseModuleDataAccess } from 'lisk-sdk';
import { RBACAccountProps, RBACAccountRoleItem } from '../schemas';

export const getAccountRolesAction = async (address: string | Buffer, chainGetter: BaseModuleDataAccess): Promise<RBACAccountRoleItem[]> => {
  if (typeof address === 'string' && !isHexString(address)) {
    throw new Error('Address parameter should be a hex string.');
  }

  let account: Account<RBACAccountProps>;
  if (Buffer.isBuffer(address)) {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(address);
  } else {
    account = await chainGetter.getAccountByAddress<RBACAccountProps>(Buffer.from(address, 'hex'));
  }

  return account.rbac.roles;
}