import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacGetPermissionsCommand extends BaseIPCClientCommand {

	static examples = ['rbac:permissions'];

	public async run(): Promise<void> {
		const result = await this._client?.invoke('rbac:getPermissions');

		if (result) {
			return this.printJSON(result);
		}

		return this.log(`No Permissions registered on the blockchain app.`);
	}
}
