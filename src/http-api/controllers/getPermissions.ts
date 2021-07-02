/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';
import { RBACPermissionsProps } from '../../schemas';

interface getPermissionsResponse {
	resource: string;
	operation: string;
	description: string;
}

export const getPermissions = (channel: BaseChannel) => async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const rbacPermissions = await channel.invoke<RBACPermissionsProps>('rbac:getPermissions');

		const rbacPermissionsResponse: getPermissionsResponse[] = [];
		for (const permission of rbacPermissions.permissions) {
			rbacPermissionsResponse.push({
				resource: permission.resource,
				operation: permission.operation,
				description: permission.description,
			})
		}

		res.status(200).send(rbacPermissionsResponse);
	} catch (err) {
		next(err);
	}
};
