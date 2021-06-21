import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { AssignRoleAssetProps, assignRoleAssetPropsSchema, RBACAccountProps } from '../data'
import { isHexString } from '../utils';

export class AssignRoleAsset extends BaseAsset<AssignRoleAssetProps> {
	public name = 'assignrole';
	public id = 100;

	// Define schema for asset
	public schema = assignRoleAssetPropsSchema;

	public validate({ asset }: ValidateAssetContext<AssignRoleAssetProps>): void {
		if (asset.roles === []) {
			throw new Error(`No role is included. Include at least one role for assignment.`);
		}

		if (typeof asset.address === 'string' && !isHexString(asset.address)) {
			throw new Error('Address parameter should be a hex string.');
		}
	}

	public async apply({ asset, stateStore }: ApplyAssetContext<AssignRoleAssetProps>): Promise<void> {

		const account = await stateStore.account.get<RBACAccountProps>(Buffer.from(asset.address, 'hex'));

		account.rbac.roles = [...new Set([...account.rbac.roles, ...asset.roles])];
		await stateStore.account.set(account.address, account);

	}
}
