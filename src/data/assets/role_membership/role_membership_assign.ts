export interface AssignRoleMembershipAssetProps {
	accounts: string[];
	roles: string[];
}

export const assignRoleMembershipAssetPropsSchema = {
	$id: 'rbac/assets/assign-rolemembership',
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