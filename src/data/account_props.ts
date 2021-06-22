export interface RBACAccountRoleItem {
  id: string;
  name: string;
}

export interface RBACAccountProps {
	rbac: {
		roles: RBACAccountRoleItem[];
	};
}

export const rbacAccountRoleItemSchema = {
  $id: 'lisk/rbac/role',
  type: "object",
  required: ["id", "name"],
  properties: {
    id: {
      dataType: "string",
      fieldNumber: 1,
    },
    name: {
      dataType: "string",
      fieldNumber: 2,
    }
  }
}

export const rbacAccountPropsSchema = {
  $id: 'lisk/rbac',
  type: 'object',
  required: ['roles'],
  properties: {
    roles: {
      type: "array",
      fieldNumber: 2,
      items: {
        ...rbacAccountRoleItemSchema,
      }
    }
  },
  default: {
    roles: [],
  },
};