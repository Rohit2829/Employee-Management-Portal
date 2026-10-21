import { Employee } from './src/models/employeeModels/employee';
import { sequelize } from './src/database/db';

const seed = async () => {
  await sequelize.sync();
  
  const dummyData = [
    { empId: 'EMP-001', firstName: 'Rohit', lastName: 'Yadav', email: 'rohit.yadav@hzl.com', phone: '+919876543210', department: 'Engineering', designation: 'Software Engineer', salary: 75000, joiningDate: new Date('2024-01-15'), status: 1 },
    { empId: 'EMP-002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@hzl.com', phone: '+919876543211', department: 'HR', designation: 'HR Manager', salary: 65000, joiningDate: new Date('2023-06-01'), status: 1 },
    { empId: 'EMP-003', firstName: 'Amit', lastName: 'Verma', email: 'amit.verma@hzl.com', phone: '+919876543212', department: 'Finance', designation: 'Financial Analyst', salary: 60000, joiningDate: new Date('2023-09-20'), status: 1 },
    { empId: 'EMP-004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@hzl.com', phone: '+919876543213', department: 'Marketing', designation: 'Marketing Lead', salary: 70000, joiningDate: new Date('2024-03-10'), status: 1 },
    { empId: 'EMP-005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@hzl.com', phone: '+919876543214', department: 'Engineering', designation: 'Senior Developer', salary: 90000, joiningDate: new Date('2022-11-05'), status: 1 }
  ];

  for (const emp of dummyData) {
    try {
      await Employee.create(emp);
      console.log(`Inserted ${emp.firstName}`);
    } catch (e) {
      console.log(`Skipped ${emp.firstName} (maybe already exists)`);
    }
  }
  console.log("Done seeding!");
};

seed();
