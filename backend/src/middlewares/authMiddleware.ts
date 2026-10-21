import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Employee } from "../models/employeeModels/employee";

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      dataResponse: { returnCode: 1, description: 'Unauthorized: No token provided' }
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if the user still exists in the database and is active/not deleted
    const employee = await Employee.findOne({ where: { id: decoded.id, isDeleted: 0, status: 1 } });
    if (!employee) {
      res.status(401).json({
        dataResponse: { returnCode: 1, description: 'Unauthorized: User is inactive or has been deleted' }
      });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      dataResponse: { returnCode: 1, description: 'Unauthorized: Invalid or expired token' }
    });
  }
};
