/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RBACRolesProps } from '../../schemas';

interface getRolesResponse {
	id: string;
	name: string;
	description: string;
}

export const getRoles = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { fields } = req.query

	try {
		const rbacRoles = await channel.invoke<RBACRolesProps>('rbac:getRoles');

		if (fields && fields === "full") {
			res.status(200).send(rbacRoles.roles);
		} else {
			const rbacRolesResponse: getRolesResponse[] = [];
			for (const role of rbacRoles.roles) {
				rbacRolesResponse.push({
					id: role.id,
					name: role.name,
					description: role.description,
				})
			}

			res.status(200).send(rbacRolesResponse);
		}

	} catch (err) {
		next(err);
	}
};
