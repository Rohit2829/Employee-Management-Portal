import { Request, Response } from "express";
import { Employee } from "../models/employeeModels/employee";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import CommonUtils from "../utils/common";
import { eReturnCodes } from "../enums/commonEnums";

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || '0123456789COSTSHEET';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
      res.status(400).json(CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR));
      return;
    }

    // 2. Fetch User (ensure not deleted AND is active)
    const user = await Employee.findOne({ where: { email, isDeleted: 0 } });
    if (!user) {
      res.status(401).json({
        dataResponse: { returnCode: 1, description: 'Employee is not registered' }
      });
      return;
    }

    if (user.status === 0) {
      res.status(403).json({
        dataResponse: { returnCode: 1, description: 'Account is inactive. Please contact your administrator.' }
      });
      return;
    }

    // 3. Decrypt the password sent from frontend
    let decryptedFrontendPassword = '';
    try {
      const bytes = CryptoJS.AES.decrypt(password, ENCRYPT_KEY);
      decryptedFrontendPassword = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      res.status(400).json({
        dataResponse: { returnCode: 1, description: 'Invalid password format' }
      });
      return;
    }

    // 4. Decrypt the password stored in DB
    let decryptedDBPassword = '';
    try {
      const dbBytes = CryptoJS.AES.decrypt(user.password, ENCRYPT_KEY);
      decryptedDBPassword = dbBytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      res.status(500).json({
        dataResponse: { returnCode: 1, description: 'Database configuration error' }
      });
      return;
    }

    // 5. Compare
    if (decryptedFrontendPassword !== decryptedDBPassword) {
      res.status(401).json({
        dataResponse: { returnCode: 1, description: 'Password is incorrect' }
      });
      return;
    }

    // 6. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, empId: user.empId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json(CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR));
  }
};
