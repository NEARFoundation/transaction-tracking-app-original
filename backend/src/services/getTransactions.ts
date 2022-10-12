import { type Request, type Response } from 'express';

import { getRangeFilter } from '../../../shared/helpers/datetime.js';
import { type TxActionRow, type TxActionsFilter } from '../../../shared/types';
import { respondWithServerError } from '../helpers/errors.js';
import { convertFromModelToTxActionRow, TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

// eslint-disable-next-line max-lines-per-function, complexity
export const getTransactions = async (request: Request, response: Response) => {
  try {
    const { body } = request;
    const datetimeRangeFilter = getRangeFilter(body.startDate, body.endDate);
    console.log({ datetimeRangeFilter });
    let filter: TxActionsFilter = {
      accountId: body.accountId,
      block_timestamp: datetimeRangeFilter,
    };
    if (body.types.length > 0) {
      filter = { ...filter, txType: body.types };
    }

    const transactions: TxActionRow[] = await TxActions.find(filter).sort({ block_timestamp: -1 });
    const task = await TxTasks.findOne({ accountId: body.accountId }).select({ _id: 0 });

    const cleanedTransactions: TxActionRow[] = [];
    // eslint-disable-next-line array-callback-return
    for (const transaction of transactions) {
      const txActionRow = convertFromModelToTxActionRow(transaction);
      cleanedTransactions.push(txActionRow);
    }

    response.send({ lastUpdate: task ? task.lastUpdate : null, transactions: cleanedTransactions });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
