export interface RemoveRoleMembershipAssetProps {
	addresses: string[];
	roles: string[];
}

export const removeRoleMembershipAssetPropsSchema = {
	$id: 'rbac/assets/remove-rolemembership',
	title: 'Transaction asset to assign a set of roles to a set of addresses',
	type: 'object',
	required: ['addresses','roles'],
	properties: {
		addresses: {
			fieldNumber: 1,
			type: 'array',
      items: {
        dataType: 'string'
      }
		},
		roles: {
			fieldNumber: 2,
			type: 'array',
			items: {
				dataType: 'string',
			}
		}
	},
}