/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RoleAccounts } from '../../schemas';

interface getRoleAccountsResponse {
	address: string;
}

export const getRoleAccounts = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const {id} = req.params;

	try {
		const roleAccounts = await channel.invoke<RoleAccounts>('rbac:getRoleAccounts', { id });

		const rbacRolesResponse: getRoleAccountsResponse[] = [];
		for (const address of roleAccounts.addresses) {
			rbacRolesResponse.push({
				address: address.toString('hex')
			})
		}

		res.status(200).json(rbacRolesResponse);
	} catch (err) {
		if ((err as Error).message.startsWith('Role with id')) {
			res.status(404).send({
				errors: [{ message: `Role with id '${id }' was not found.` }],
			});
		} else if ((err as Error).message.endsWith('has been removed.')) {
			res.status(410).send({
				errors: [{ message: `Role with id '${id }' has been removed.` }],
			});
		} else {
			next(err);
		}
	}
};
