/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { objects } from '@liskhq/lisk-utils';
import * as cors from 'cors';
import type { Express } from 'express';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import { Server } from 'http';
import type { ActionsDefinition, BaseChannel, EventsDefinition } from 'lisk-framework';
import { BasePlugin, PluginInfo } from 'lisk-framework';
import * as controllers from './controllers';
import * as config from './defaults';
import * as middlewares from './middlewares';
import { Options } from './types';

const pJSON = require('../../package.json');

export class RBACAPIPlugin extends BasePlugin {
	private _server!: Server;
	private _app!: Express;
	private _channel!: BaseChannel;

	public static get alias(): string {
		return 'rbacHttpApi';
	}

	public static get info(): PluginInfo {
		return {
			author: pJSON.author,
			version: pJSON.version,
			name: pJSON.name,
		};
	}

	public get defaults(): object {
		return config.defaultConfig;
	}

	public get events(): EventsDefinition {
		return [];
	}

	public get actions(): ActionsDefinition {
		return {};
	}

	public async load(channel: BaseChannel): Promise<void> {
		this._app = express();
		const options = objects.mergeDeep({}, config.defaultConfig.default, this.options) as Options;
		this._channel = channel;

		this._channel.once('app:ready', () => {
			this._registerMiddlewares(options);
			this._registerControllers();
			this._registerAfterMiddlewares(options);
			this._server = this._app.listen(options.port, options.host);
		});
	}

	public async unload(): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			this._server.close(err => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}

	private _registerMiddlewares(options: Options): void {
		// Register middlewares
		this._app.use(cors(options.cors));
		this._app.use(express.json());
		this._app.use(rateLimit(options.limits));
		this._app.use(middlewares.whiteListMiddleware(options));
	}

	private _registerAfterMiddlewares(_options: Options): void {
		this._app.use(middlewares.errorMiddleware());
	}

	private _registerControllers(): void {
		this._app.get('/rbac/roles/:id', controllers.getRole(this._channel));
		this._app.get('/rbac/roles', controllers.getRoles(this._channel));
		this._app.get('/rbac/permissions', controllers.getPermissions(this._channel));
		this._app.get('/rbac/roles/:id/accounts', controllers.getRoleAccounts(this._channel));
		this._app.post('/rbac/accounts/:address/hasPermission', controllers.hasPermission(this._channel));
		this._app.get('/rbac/accounts/:address/roles', controllers.getAccountRoles(this._channel));
		this._app.post('/rbac/roles');
		this._app.delete('/rbac/roles/:id');
		this._app.patch('/rbac/roles/:id');
		this._app.post('/rbac/roles/:id/permissions');
		this._app.delete('/rbac/roles/:id/permissions');
		this._app.post('/rbac/accounts/:address/roles');
		this._app.delete('/rbac/accounts/:address/roles');
	}
}
