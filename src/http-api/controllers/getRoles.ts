/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RBACRolesProps } from '../../schemas';

interface getRolesResponse {
	id: string;
	name: string;
	description: string;
}

export const getRoles = (channel: BaseChannel) => async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const rbacRoles = await channel.invoke<RBACRolesProps>('rbac:getRoles');

		const rbacRolesResponse: getRolesResponse[] = [];
		for (const role of rbacRoles.roles) {
			rbacRolesResponse.push({
				id: role.id,
				name: role.name,
				description: role.description,
			})
		}

		res.status(200).send(rbacRolesResponse);
	} catch (err) {
		next(err);
	}
};
