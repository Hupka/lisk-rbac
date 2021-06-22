export interface UpdateRoleAssetProps {
	id: string;
  name: string;
  description: string;
  inheritance: string[];
}

export const updateRoleAssetPropsSchema = {
	$id: 'rbac/assets/update-role',
	title: 'Transaction asset to update an existing role for the rbac module',
	type: 'object',
	required: ['id','name'],
	properties: {
		id: {
			fieldNumber: 1,
			dataType: "string",
    },
    name: {
			fieldNumber: 2,
			dataType: "string",
    },
    description: {
			fieldNumber: 3,
			dataType: "string",
    },
    inheritance: {
      type: "array",
      fieldNumber: 4,
      items: {
        dataType: "string",
      }
    }
	}
}