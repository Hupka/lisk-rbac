export interface RemoveRoleMembershipAssetProps {
	accounts: string[];
	roles: string[];
}

export const removeRoleMembershipAssetPropsSchema = {
	$id: 'rbac/assets/remove-rolemembership',
	title: 'Transaction asset to assign a set of roles to a set of accounts',
	type: 'object',
	required: ['accounts','roles'],
	properties: {
		accounts: {
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