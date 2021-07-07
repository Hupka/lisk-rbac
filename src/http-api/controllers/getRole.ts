/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { HTTPAPIRoleRecord, RBACRoleRecord } from '../../schemas';

export const getRole = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;
	const { fields } = req.query

	try {
		const role = await channel.invoke<RBACRoleRecord>('rbac:getRole', { id });

		if (fields && fields === "full") {
			res.status(200).send(role);
		} else {
			res.status(200).send({
				id: role.id,
				name: role.name,
				description: role.description,
			} as HTTPAPIRoleRecord);
		}
	} catch (err) {
		if ((err as Error).message.startsWith('Role with id')) {
			res.status(404).send({
				errors: [{ message: `Role with id '${id}' was not found` }],
			});
		} else {
			next(err);
		}
	}
};
