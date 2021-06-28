import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacGetRoleAccountsCommand extends BaseIPCClientCommand {
	static args = [
		{
			name: 'id',
			required: true,
			description: 'Role id to lookup.',
		},
	];

	static examples = ['rbac:role <role-id>', 'rbac:role 1'];

	public async run(): Promise<void> {
		const { args } = this.parse(RbacGetRoleAccountsCommand);
		const { id } = args as { id: string };

		const result = await this._client?.invoke('rbac:getRole', { id });

		if (result) {
			return this.printJSON(result);
		}

		return this.log(`Can not find role with id "${id}"`);
	}
}
