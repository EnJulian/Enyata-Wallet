import express from "express";
import {
  createWalletUser,
  loginWalletUser,
} from "../controllers/user.controller";
import { forgotPassword, resetPassword } from "../controllers/auth.controller";
import {
  validateUserSignUpInput,
  validateLoginInput,
} from "../middlewares/validator.middleware";
import { authenticate } from "../middlewares/pin.middleware";
import { checkToken } from "../middlewares/authentication.middleware";
import {
  validateFundWalletFundInputs,
  validateTransferFundsInputs,
} from "../middlewares/validator.middleware";
import { getTransactions } from "../controllers/filter.controller";
import { searchUsers } from "../controllers/filter.controller";

import {
  walletBalance,
  fundWallet,
  transferWalletFunds,
  accountSummary,
  transactionHistory,
} from "../controllers/wallet.controller";
import { createPin } from "../services/user.service";
import { sendCustomizedEmail } from "../services/emailsender.service";
import { ResetPasswordEmail } from "../controllers/EmailSender.controller";

const router = express.Router();



/**
 * @openapi
 * '/api/v1/wallet/signup':
 *  post:
 *    tags:
 *      - User signup
 *    summary: Creates a user!
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/SignUpUserInput'
 *          
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SignUpResponse'
 *            
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BadRequestResponse'
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserExistsResponse'
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 * 
 */

router.post("/signup", validateUserSignUpInput, createWalletUser);

/**
 * @openapi
 * '/api/v1/wallet/login':
 *  post:
 *    tags:
 *      - User login
 *    summary: Gets the user logged in
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/LogInUserInput'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LogInUserResponse'
 *              
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BadLogInRequestResponse'
 * 
 * 
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */

router.post("/login", validateLoginInput, loginWalletUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-email", sendCustomizedEmail);
router.post("/resetemail-link", ResetPasswordEmail);

/**
 * @openapi
 * '/api/v1/wallet/account-balance':
 *  get:
 *    security:
 *      - ApiAuthentication: []
 *    tags:
 *      - Account balance
 *    summary: Gets the wallet balance
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccountBalanceResponse'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'        
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */

router.get("/account-balance", checkToken, walletBalance);

router.get("/filter", checkToken, getTransactions);
router.get("/search", searchUsers);


/**
 * @openapi
 * '/api/v1/wallet/deposit-funds':
 *  patch:
 *    tags:
 *      - Deposit Funds
 *    summary: deposit funds into wallet
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/DepositFundsInput'
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DepositFundsResponse'
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InvalidAmountResponse'               
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'        
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */
router.patch(
  "/deposit-funds",
  checkToken,
  validateFundWalletFundInputs,
  fundWallet
);

/**
 * @openapi
 * '/api/v1/wallet/transfer-funds':
 *  patch:
 *    tags:
 *      - Transfer Funds
 *    summary: transfer funds from wallet into another user's wallet
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/TransferFundsInput'
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TransferFundsResponse'
 * 
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InvalidAmountResponse'                  
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'        
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */
router.patch(
  "/transfer-funds",
  checkToken,
  validateTransferFundsInputs,
  transferWalletFunds
);

/**
 * @openapi
 * '/api/v1/wallet/account-summary':
 *  get:
 *    tags:
 *      - Account summary
 *    summary: Gets account summary
 *    requestBody:
 *      required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccountSummaryResponse'
 *               
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'        
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */

router.get("/account-summary", checkToken, accountSummary);

/**
 * @openapi
 * '/api/v1/wallet/transactions-history':
 *  get:
 *    tags:
 *      - Account Transaction History
 *    summary: Get wallet transaction history
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TransactionsHistoryResponse'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'        
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 */

router.get("/transactions-history", checkToken, transactionHistory);


/**
 * @openapi
 * '/api/v1/wallet/create-pin':
 *  post:
 *    tags:
 *      - Wallet user pin
 *    summary: Creates a  Wallet user pin
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePinInput'
 *          
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePinResponse'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnauthorizedErrorResponse'   
 *            
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BadRequestResponse'
 *
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServerErrorResponse'
 * 
 */

router.post("/create-pin", authenticate, createPin);

router.get("/health", (req, res) => res.status(200).json());

export default router;
