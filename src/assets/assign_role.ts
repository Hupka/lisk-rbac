import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { AssignRoleAssetProps, assignRoleAssetPropsSchema, RBACAccountProps } from '../data'

export class AssignRoleAsset extends BaseAsset<AssignRoleAssetProps> {
	public name = 'assignrole';
	public id = 1;

	// Define schema for asset
	public schema = assignRoleAssetPropsSchema;

	public validate({ asset }: ValidateAssetContext<AssignRoleAssetProps>): void {
		if (asset.roles === []) {
			throw new Error(`No role is included. Include at least one role for assignment.`);
		}
	}

	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<AssignRoleAssetProps>): Promise<void> {

		const sender = await stateStore.account.get<RBACAccountProps>(transaction.senderAddress);
		sender.rbac.roles = [...sender.rbac.roles, ...asset.roles];
		await stateStore.account.set(sender.address, sender);

	}
}
