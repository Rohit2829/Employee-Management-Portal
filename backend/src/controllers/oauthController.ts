import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const oauthCallback = (req: Request, res: Response): void => {
  try {
    const user = req.user as any;
    
    if (!user) {
      res.redirect(`${FRONTEND_URL}/login?error=Unauthorized`);
      return;
    }

    // Generate JWT for the matched employee
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Redirect to frontend with the token
    res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=ServerError`);
  }
};
