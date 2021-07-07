/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { isHexString } from '@liskhq/lisk-validator';
import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { HTTPAPIPermissionRecord, RBACPermissionRecord } from '../../schemas';

export const getAccountPermissions = (channel: BaseChannel) => async (
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
		const accountPermissions = await channel.invoke<RBACPermissionRecord[]>('rbac:getAccountPermissions', { address: accountAddress });

		if (fields && fields === "full") {
			res.status(200).send(accountPermissions);
		} else {
			const result: HTTPAPIPermissionRecord[] = [];
			for (const permission of accountPermissions) {
				result.push({
					resource: permission.resource,
					operation: permission.operation,
					description: permission.description
				})
			}

			res.status(200).send(result);
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
