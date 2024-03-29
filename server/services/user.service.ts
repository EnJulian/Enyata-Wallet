import User from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Utils, ErrorResponseProvider } from '../utils'
import { UserDataType, CustomRequest } from '../interfaces'
import config from '../config/env/index'
import { Request, Response } from 'express'

/**
 * register new wallet user
 * @date 1/15/2024 - 9:50:35 AM
 *
 * @async
 * @returns
 * @param firstname
 * @param surname
 * @param othernames
 * @param email
 * @param password
 * @param phonenumber
 */

export const registerNewUser = async (
  firstname: string,
  surname: string,
  othernames: string,
  email: string,
  password: string,
  phonenumber: string
) => {
  // check if the email exists in the db
  const duplicate = await User.findOne({ email }).exec()
  // if duplicate is not empty
  // return response
  if (duplicate !== null) {
    throw new ErrorResponseProvider(
      409,
      'failed',
      'user already exists!'
    )
  }

  // encrypt the password with a new salt
  const salt = bcrypt.genSaltSync(10);
  const hashedPwd = await bcrypt.hash(password, salt)

  // get accountNumber
  const accountNumber: string = Utils.accountNumbers()
  
  // create and store the new wallet user
  const newWalletUser: UserDataType = {
    firstname,
    surname,
    othernames,
    email,
    password: hashedPwd,
    phonenumber,
    accountNumber
  }

  const createUserResult = await User.create(newWalletUser)
  
  if (!createUserResult){
    throw new ErrorResponseProvider(
      500,
      'failed',
      'create wallet user failed'
    )
  }

  return {
    code: 201,
    status: 'success',
    message: 'wallet user created'
  }
}

export const loginUser = async (email: string, password: string ) => {

  // Check if that user is registered
  const registeredUser = await User.findOne({ email }).exec()

  // if the user is not registered throw an error
  if (!registeredUser) {
    throw new ErrorResponseProvider(
      400,
      'failed',
      'invalid email or password'
    )
  }

  // Compare user passwords
  const {
    password: dbPassword,
    _id, 
    accountNumber,
    firstname,
    surname,
    phonenumber,
  } = registeredUser


  const userPassword = await bcrypt.compare(password, dbPassword);
  if (!userPassword) {
    return {
      code: 401,
      status: 'failed',
      message: 'invalid email or password'
    }
  }

  const options = {
    expiresIn: process.env.JWT_EXPIRATION_TIME
  }

  // create token for authentication
  const token = jwt.sign(
    {
      _id,
      email
    },
    config.JWT_SECRET_KEY,
    options
  )

  return Utils.provideResponse(
    200,
    'success',
    'login success',
    {
      _id,
      email,
      token,
      accountNumber,
      firstname,
      surname,
      phonenumber
    }
  )
}

export const createPin = async (req: Request, res: Response) => {
  const { pin } = req.body;
  const pinRegex = /^\d{4}$/;

  if (!pinRegex.test(pin)) {
    return res.status(400).json({
      message: "invalid pin. kindly enter a valid pin",
      status: "error",
    });
  }
  const saltRounds=10;
  const hashedPin = bcrypt.hashSync(pin,saltRounds)
  const userData = (req as any).data;
  await User.updateOne({_id: userData._id}, {pin: hashedPin})
  const result= await User.findOne({_id: userData._id}) 
  
  return res.status(200).json(result!.email)
};

