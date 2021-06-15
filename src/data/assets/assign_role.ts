export interface AssignRoleAssetProps {
	roles: Buffer[];
}

export const assignRoleAssetPropsSchema = {
	$id: 'rbac/assets/assign-roles',
	title: 'Assign Roles transaction asset for rbac module',
	type: 'object',
	required: ['roles'],
	properties: {
		roles: {
			fieldNumber: 1,
			type: 'array',
			items: {
				dataType: 'bytes',
			}
		}
	},
}