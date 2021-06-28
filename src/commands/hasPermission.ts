import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacHasPermissionCommand extends BaseIPCClientCommand {
	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address to check permission on.',
		},
		{
			name: 'resource',
			required: true,
			description: "Resource for which it should be checked if 'address' has appropriate permissions to perform 'operation' on.",
		},
		{
			name: 'operation',
			required: true,
			description: "",
		},
	];

	static examples = ['rbac:hasPermission <hex-address> <resource> <operation>', 'rbac:hasPermission afe179fa12a988c1244444479c roles_membership assign'];

	public async run(): Promise<void> {
		const { args } = this.parse(RbacHasPermissionCommand);
		const { address, resource, operation } = args as { address: string; resource: string; operation: string };

		if (address !== Buffer.from(address, 'hex').toString('hex')) {
			this.error('Invalid address format. Should be a hex string.');
		}

		const result = await this._client?.invoke('rbac:hasPermission', { address, resource, operation });

		return this.printJSON(result);
	}
}
