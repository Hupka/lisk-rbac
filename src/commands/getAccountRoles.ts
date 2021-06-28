import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacGetAccountRolesCommand extends BaseIPCClientCommand {
	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address to fetch roles from.',
		},
	];

	static examples = ['rbac:account <hex-address>', 'rbac:account d04699e57c4a3846c988f3c15306796f8eae5c1c'];

	public async run(): Promise<void> {
		const { args } = this.parse(RbacGetAccountRolesCommand);
		const { address } = args as { address: string };

		if (address !== Buffer.from(address, 'hex').toString('hex')) {
			this.error('Invalid address format. Should be a hex string.');
		}

		const result = await this._client?.invoke('rbac:getAccountRoles', { address });

		if (result) {
			return this.printJSON(result);
		}

		return this.log(`Can not find account with address "${address}"`);
	}
}
