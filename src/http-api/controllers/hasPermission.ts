/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { isHexString, LiskValidationError, validator } from '@liskhq/lisk-validator';
import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';

const hasPermissionInputSchema = {
	type: 'object',
	required: ['resource', 'operation'],
	properties: {
		resource: {
			type: 'string',
			description: 'Resource identifier of the permissions string.\n',
		},
		operation: {
			type: 'string',
			description: 'Operation identifier of the permissions string.\n',
		}
	},
};

interface HasPermissionInput {
	resource: string;
	operation: string;
}

export const hasPermission = (channel: BaseChannel) => async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const errors = validator.validate(hasPermissionInputSchema, req.body);

	// 400 - Malformed query or parameters
	if (errors.length) {
		res.status(400).send({
			errors: [{ message: new LiskValidationError([...errors]).message }],
		});
		return;
	}

	const accountAddress = req.params.address;
	
	if (!isHexString(accountAddress)) {
		res.status(400).send({
			errors: [{ message: 'The Address parameter should be a hex string.' }],
		});
		return;
	}
	
	try {
		const reqBody: HasPermissionInput = req.body as HasPermissionInput;
		const hasPermissionResponse = await channel.invoke<boolean>('rbac:hasPermission', {address: accountAddress, resource: reqBody.resource, operation: reqBody.operation});

		res.status(200).send(hasPermissionResponse);
	} catch (err) {
		next(err);
	}
};
