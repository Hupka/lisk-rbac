import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { AssignRoleAssetProps, assignRoleAssetPropsSchema } from '../data/assets/assign_role'
import { RBACAccountProps } from '../data/account_props'

export class AssignRoleAsset extends BaseAsset {
	public name = 'AssignRole';
	public id = 0;

	// Define schema for asset
	public schema = assignRoleAssetPropsSchema;

	public validate({ asset }: ValidateAssetContext<AssignRoleAssetProps>): void {
		if (asset.roles === []) {
			throw new Error(`No role is included. Include at least one role for assignment.`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<AssignRoleAssetProps>): Promise<void> {

		const sender = await stateStore.account.get<RBACAccountProps>(transaction.senderAddress);
		sender.rbac.roles = [...sender.rbac.roles, ...asset.roles];
		await stateStore.account.set(sender.address, sender);
	}
}
