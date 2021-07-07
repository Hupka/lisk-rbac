/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { HTTPAPIPermissionRecord, RBACPermissionRecord } from '../../schemas';

export const getRolePermissions = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;
	const { fields } = req.query

	try {
		const rbacRolePermissions = await channel.invoke<RBACPermissionRecord[]>('rbac:getRolePermissions', { id });

		if (fields && fields === "full") {
			res.status(200).send(rbacRolePermissions);
		} else {
			const rbacRolePermissionsResponse: HTTPAPIPermissionRecord[] = [];
			for (const permission of rbacRolePermissions) {
				rbacRolePermissionsResponse.push({
					resource: permission.resource,
					operation: permission.operation,
					description: permission.description,
				})
			}

			res.status(200).send(rbacRolePermissionsResponse);
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
