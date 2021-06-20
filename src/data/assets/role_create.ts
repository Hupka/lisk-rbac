export interface CreateRoleAssetProps {
	name: string;
  description: string;
  inheritance: string[];
}

export const createRoleAssetPropsSchema = {
	$id: 'rbac/assets/create-role',
	title: 'Transaction asset to create a new role for the rbac module',
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			fieldNumber: 1,
			dataType: "string",
    },
    description: {
			fieldNumber: 2,
			dataType: "string",
    },
    inheritance: {
      type: "array",
      fieldNumber: 3,
      items: {
        dataType: "string",
      }
    }
	},
}