/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { isHexString } from '@liskhq/lisk-validator';
import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RBACRoleRecord, RBACRolesProps } from '../../schemas';

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
	const { fields } = req.query

	if (!isHexString(accountAddress)) {
		res.status(400).send({
			errors: [{ message: 'The Address parameter should be a hex string.' }],
		});
		return;
	}

	try {
		const accountRolesResponse = await channel.invoke<RBACAccountRoleItem[]>('rbac:getAccountRoles', { address: accountAddress, });
		const rbacRoles = await channel.invoke<RBACRolesProps>('rbac:getRoles');

		if (fields && fields === "full") {
			const accountRoles: RBACRoleRecord[] = [];

			for (const accountRole of accountRolesResponse) {
				const role = rbacRoles.roles.find(elem => elem.id === accountRole.id)
				if (role) {
					accountRoles.push(role)
				}

			}

			res.status(200).send(accountRoles);
		} else {
			const accountRoles: GetAccountRolesResponse[] = [];
			for (const role of accountRolesResponse) {
				accountRoles.push({
					id: role.id,
					name: role.name,
					description: rbacRoles.roles.find(elem => elem.id === role.id)?.description ?? ""
				})
			}

			res.status(200).send(accountRoles);
		}

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
