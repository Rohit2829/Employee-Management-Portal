import { Employee } from './src/models/employeeModels/employee';
import { sequelize } from './src/database/db';

const run = async () => {
  try {
    await sequelize.authenticate();
    const employees = await Employee.findAll({ where: { isDeleted: 0 } });
    console.log('--- Current Active Database Employees ---');
    employees.forEach(emp => {
      console.log(`ID: ${emp.id} | Name: ${emp.firstName} ${emp.lastName} | Email: ${emp.email} | UPN/Phone: ${emp.phone}`);
    });
    console.log('-----------------------------------------');
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await sequelize.close();
  }
};

run();
