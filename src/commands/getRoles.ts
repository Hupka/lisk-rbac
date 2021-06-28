import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacGetRolesCommand extends BaseIPCClientCommand {

	static examples = ['rbac:roles'];

	public async run(): Promise<void> {
		const result = await this._client?.invoke('rbac:getRoles');

		if (result) {
			return this.printJSON(result);
		}

		return this.log(`No roles registered on the blockchain app.`);
	}
}
