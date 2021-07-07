/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { HTTPAPIPermissionRecord, RBACPermissionsProps } from '../../schemas';

export const getPermissions = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { fields } = req.query

	try {
		const rbacPermissions = await channel.invoke<RBACPermissionsProps>('rbac:getPermissions');

		if (fields && fields === "full") {
			res.status(200).send(rbacPermissions.permissions);
		} else {
			const rbacPermissionsResponse: HTTPAPIPermissionRecord[] = [];
			for (const permission of rbacPermissions.permissions) {
				rbacPermissionsResponse.push({
					resource: permission.resource,
					operation: permission.operation,
					description: permission.description,
				})
			}

			res.status(200).send(rbacPermissionsResponse);
		}

	} catch (err) {
		next(err);
	}
};
