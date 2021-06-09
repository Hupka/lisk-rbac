export interface AssignRoleAssetProps {
	roles: Buffer[];
}

export const assignRoleAssetPropsSchema = {
	$id: 'lisk/rbac/assets/assign-roles',
	title: 'Assign Roles transaction asset for rbac module',
	type: 'object',
	required: ['roles'],
	properties: {
		roles: {
			type: 'array',
			fieldNumber: 1,
			items: {
				dataType: 'bytes',
			}
		}
	},
}