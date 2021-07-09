/*
 * Copyright © 2020 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import { NextFunction, Request, Response } from 'express';
import { BaseChannel } from 'lisk-framework';

export const getNodeInfo = (channel: BaseChannel) => async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const nodeStatusAndInfo = await channel.invoke('app:getNodeInfo');
    res.status(200).send({ data: nodeStatusAndInfo, meta: {} });
  } catch (err) {
    next(err);
  }
};