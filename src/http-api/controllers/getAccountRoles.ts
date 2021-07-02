/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { isHexString } from '@liskhq/lisk-validator';
import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RBACRolesProps } from '../../schemas';

interface RBACAccountRoleItem {
	id: string;
	name: string;
}

type GetAccountRolesResponse = { id: string; name: string; description: string }

export const getAccountRoles = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const accountAddress = req.params.address;

	if (!isHexString(accountAddress)) {
		res.status(400).send({
			errors: [{ message: 'The Address parameter should be a hex string.' }],
		});
		return;
	}

	try {
		const accountRolesResponse = await channel.invoke<RBACAccountRoleItem[]>('rbac:getAccountRoles', { address: accountAddress, });
		const rbacRoles = await channel.invoke<RBACRolesProps>('rbac:getRoles');

		const accountRoles: GetAccountRolesResponse[] = [];
		for (const role of accountRolesResponse) {
			accountRoles.push({
				id: role.id,
				name: role.name,
				description: rbacRoles.roles.find(elem => elem.id === role.id)?.description ?? ""
			})
		}

		res.status(200).send(accountRoles);
	} catch (err) {
		if ((err as Error).message.startsWith('Specified key accounts:address')) {
			res.status(404).send({
				errors: [{ message: `Account with address '${accountAddress}' was not found` }],
			});
		} else {
			next(err);
		}
	}
};
