import { BaseIPCClientCommand } from 'lisk-commander';

export class RbacGetRulesetCommand extends BaseIPCClientCommand {

	static examples = ['rbac:ruleset'];

	public async run(): Promise<void> {
		const result = await this._client?.invoke('rbac:getRuleset');

		return this.printJSON(result);
	}
}
