/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextFunction, type Request, type Response } from 'express'
import { 
  fetchWalletBalance, 
  depositFunds, 
  transferFunds, 
  fetchAccountSummary 
} from '../services/wallet.service'
import { fetchTransactionHistory } from '../services/wallet.service'
import { Utils } from '../utils'
import { Transaction } from '../interfaces'
import Logger from '../config/logger';


export const walletBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    Logger.info(`[WALLET_BALANCE] by ${userId}`)

    const result = await fetchWalletBalance(userId);
    const { status, message, code, data } = result;
    Utils.responseProvider(res, status, message, code, data);
  } catch (error) {
    Logger.error(
      `[WALLET_BALANCE] failed `,
      (error as Error).message,
    );
    next(error);
  }
};





/**
 * deposit money into account
 * @date 1/18/2024 - 23:17:55 pM
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns JSON object as response data
 */

export const fundWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const userId = (req as any).userId;
    
    const { amount, wallet } = req.body


    let transactionType;
    Logger.info(`[FUND_WALLET] by ${userId}`)
    const result = await depositFunds(
      userId ,
      amount, 
      wallet, 
      transactionType = 'Wallet Deposit'
      )

    return res.status(result.code).json(result)
  } catch (error) {
    Logger.error(
      `[FUND_WALLET] failed failed`,
      (error as Error).message,
    );
    next(error)
  }
}


/**
 * transfer money into another account 
 * @date 1/21/2024 - 14:21:10 pM
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns JSON object as response data
 */

export const transferWalletFunds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const userId = (req as any).userId;


    const {
      receiverAccountNumber, 
      amount, 
      wallet,
      pin 
    } = req.body
    
      let transactionType;

      Logger.info(`[TRANSFER_FUND] by ${userId}`)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await transferFunds(
      amount, 
      userId,
      receiverAccountNumber, 
      transactionType = 'Wallet Transfer', 
      wallet,
      pin
      )

    return res.status(result!.code).json(result)
  } catch (error) {
    Logger.error(
      `[TRANSFER_FUND] failed`,
      (error as Error).message,
    );
    next(error)
  }
}


export const accountSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    Logger.info(`[ACCOUNT_SUMMARY] by ${userId}`)
    const result = await fetchAccountSummary(userId)
    const responseStatus =  Utils.formatResponseStatus(result)
    const userAccountDetails = Utils.formatUserAccountSummary( result)
    const transactions =  Utils.formatTransactionHistory(result)

    const responseData = {
      ... responseStatus,
      ... userAccountDetails,
      ... transactions 
    }

    return res.status(result.code).json(responseData)
  } catch (error) {
    Logger.error(
      `[ACCOUNT_SUMMARY] failed`,
      (error as Error).message,
    );
    next(error)
  }
}



export const transactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const userId = (req as any).userId;

    const page = Number(req.query.page) || 1
    const limit  = Number(req.query.limit) || 6

    Logger.info(`[TRANSACTION_HISTORY] by ${userId}`)

    const result = await fetchTransactionHistory(userId, page, limit)

    const responseStatus =  Utils.formatResponseStatus(result)
    
    const metadata = Utils.formatMetaData(result)

    const transactions =  Utils.formatTransactionHistory(result)

    const responseData = {
      ... responseStatus,
      ... metadata,
      ... transactions 
    }

    return res.status(result.code).json(responseData)
  } catch (error) {
    Logger.error(
      `[TRANSACTION_HISTORY] failed`,
      (error as Error).message,
    );
    next(error)
  }
}
