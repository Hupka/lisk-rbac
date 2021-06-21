export interface AssignRoleAssetProps {
	address: string;
	roles: string[];
}

export const assignRoleAssetPropsSchema = {
	$id: 'rbac/assets/assign-roles',
	title: 'Assign Roles transaction asset for rbac module',
	type: 'object',
	required: ['roles'],
	properties: {
		address: {
			fieldNumber: 1,
			dataType: 'string',
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