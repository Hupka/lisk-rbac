export interface RBACAccountProps {
	rbac: {
		roles: Buffer[];
	};
}

export const rbacAccountPropsSchema = {
  $id: 'lisk/rbac',
  type: 'object',
  required: ['roles'],
  properties: {
    roles: {
      fieldNumber: 1,
      type: 'array',
      items: {
        dataType: 'bytes'
      }
    }
  },
  default: {
    roles: [],
  },
};