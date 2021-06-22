import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';

import { AssignRoleAssetProps, assignRoleAssetPropsSchema, RBACAccountProps } from '../data'
import { isHexString, readRBACRolesObject } from '../utils';

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

		const rolesList = await readRBACRolesObject(stateStore);

		if (!rolesList) {
			throw new Error("ERR: no roles list in database");
		}

		// Check which roles are included in rolesList
		const verifyAvailabilityMap = asset.roles.map(assetElem => ({ id: assetElem, bool: (!!rolesList.roles.find(x => x.id === assetElem))}))
		const missingRoles = verifyAvailabilityMap.filter(elem => !elem.bool);
		
		if (missingRoles.length) {
			const rolesString = missingRoles.map(elem2 => elem2.id);
			throw new Error(`The roles with id(s) [${rolesString.join()}] are unknown. None of the provided roles were assigned.`);
		}

		// Remove duplicated roles
		const uniqueIdList = [...new Set([...account.rbac.roles.map(elem => elem.id), ...asset.roles])];

		// Sort 
		const sortedUniqueIdList = uniqueIdList.sort((a, b)=> parseInt(a, 10)-parseInt(b, 10));

		account.rbac.roles = [...sortedUniqueIdList.map(elem => ({id: elem, name: (rolesList.roles.find(x => x.id === elem))?.name as string}))]
		await stateStore.account.set(account.address, account);
	}
}
