import passport from 'passport';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Employee } from '../models/employeeModels/employee';
import { Op } from 'sequelize';

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Microsoft Strategy
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID || 'your_microsoft_client_id',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'your_microsoft_client_secret',
      callbackURL: '/api/auth/microsoft/callback',
      scope: ['openid', 'profile', 'email', 'user.read'],
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        console.log("Microsoft OAuth profile received:", JSON.stringify({
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          userPrincipalName: profile._json?.userPrincipalName
        }, null, 2));
        
        const email = profile.emails?.[0]?.value;
        const upn = profile._json?.userPrincipalName;
        console.log("Extracted values - Email:", email, "UPN:", upn);
        
        const emailsToSearch = [email, upn].filter(Boolean) as string[];
        
        if (emailsToSearch.length === 0) {
          console.warn("No email or UPN found in Microsoft profile:", profile);
          return done(null, false, { message: 'No email found in Microsoft profile' });
        }

        const employee = await Employee.findOne({
          where: {
            email: {
              [Op.in]: emailsToSearch
            },
            isDeleted: 0
          }
        });
        
        console.log("Employee query result from DB:", employee ? `${employee.firstName} ${employee.lastName} (ID: ${employee.empId}, Email: ${employee.email})` : "NOT FOUND");
        
        if (!employee) {
          return done(null, false, { message: 'Employee is not registered' });
        }

        return done(null, employee);
      } catch (error) {
        console.error("Error in MicrosoftStrategy callback:", error);
        return done(error, false);
      }
    }
  )
);

export default passport;
