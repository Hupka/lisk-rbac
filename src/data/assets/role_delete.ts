export interface DeleteRoleAssetProps {
	id: string;
}

export const deleteRoleAssetPropsSchema = {
	$id: 'rbac/assets/roles/delete',
	title: 'Transaction asset to delete an existing role for the rbac module',
	type: 'object',
	required: ['id'],
	properties: {
		id: {
			fieldNumber: 1,
			dataType: "string",
    }
	}
}