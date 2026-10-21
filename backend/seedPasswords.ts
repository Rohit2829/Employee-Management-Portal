import { Employee } from './src/models/employeeModels/employee';
import { EmployeeHealthRecord } from './src/models/employeeModels/healthRecord';
import { sequelize } from './src/database/db';
import CryptoJS from 'crypto-js';

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || '0123456789COSTSHEET';

const seed = async () => {
  // force: true drops tables and re-creates them with new schema columns
  await sequelize.sync({ force: true });
  
  // Create a default AES-256 encrypted password for the seed users
  const defaultPassword = 'HindZinc!2026&Ltd';
  const encryptedPassword = CryptoJS.AES.encrypt(defaultPassword, ENCRYPT_KEY).toString();

  const dummyData = [
    { empId: 'EMP-001', firstName: 'Rohit', lastName: 'Yadav', email: 'HOITRYV@vedanta.co.in', phone: '+919876543210', department: 'Engineering', designation: 'Software Engineer', salary: 75000, joiningDate: new Date('2024-01-15'), status: 1, password: encryptedPassword, location: 'Udaipur' },
    { empId: 'EMP-002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@hzl.com', phone: '+919876543211', department: 'HR', designation: 'HR Manager', salary: 65000, joiningDate: new Date('2023-06-01'), status: 1, password: encryptedPassword, location: 'Chittorgarh' },
    { empId: 'EMP-003', firstName: 'Amit', lastName: 'Verma', email: 'amit.verma@hzl.com', phone: '+919876543212', department: 'Finance', designation: 'Financial Analyst', salary: 60000, joiningDate: new Date('2023-09-20'), status: 1, password: encryptedPassword, location: 'Bhilwara' },
    { empId: 'EMP-004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@hzl.com', phone: '+919876543213', department: 'Marketing', designation: 'Marketing Lead', salary: 70000, joiningDate: new Date('2024-03-10'), status: 1, password: encryptedPassword, location: 'Udaipur' },
    { empId: 'EMP-005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@hzl.com', phone: '+919876543214', department: 'Engineering', designation: 'Senior Developer', salary: 90000, joiningDate: new Date('2022-11-05'), status: 1, password: encryptedPassword, location: 'Rajsamand' },
    { empId: 'EMP-006', firstName: 'Anjali', lastName: 'Desai', email: 'anjali.desai@hzl.com', phone: '+919876543215', department: 'Sales', designation: 'Sales Executive', salary: 55000, joiningDate: new Date('2024-02-14'), status: 1, password: encryptedPassword, location: 'Ajmer' },
    { empId: 'EMP-007', firstName: 'Karan', lastName: 'Patel', email: 'karan.patel@hzl.com', phone: '+919876543216', department: 'IT', designation: 'System Administrator', salary: 62000, joiningDate: new Date('2023-08-11'), status: 1, password: encryptedPassword, location: 'Udaipur' },
    { empId: 'EMP-008', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@hzl.com', phone: '+919876543217', department: 'Operations', designation: 'Operations Manager', salary: 80000, joiningDate: new Date('2021-04-25'), status: 1, password: encryptedPassword, location: 'Bhilwara' },
    { empId: 'EMP-009', firstName: 'Rahul', lastName: 'Kumar', email: 'rahul.kumar@hzl.com', phone: '+919876543218', department: 'Admin', designation: 'Office Admin', salary: 45000, joiningDate: new Date('2023-12-01'), status: 1, password: encryptedPassword, location: 'Jaipur' }
  ];

  console.log("Seeding employees...");
  for (const emp of dummyData) {
    try {
      await Employee.create(emp);
      console.log(`Inserted ${emp.firstName} with location ${emp.location}.`);
    } catch (e) {
      console.log(`Error inserting ${emp.firstName}:`, e);
    }
  }

  const healthData = [
    { empId: 'EMP-001', location: 'Udaipur', symptom: 'BP', status: 'Active' },
    { empId: 'EMP-002', location: 'Chittorgarh', symptom: 'BP', status: 'Resolved' },
    { empId: 'EMP-003', location: 'Bhilwara', symptom: 'Sugar', status: 'Active' },
    { empId: 'EMP-004', location: 'Udaipur', symptom: 'Sugar', status: 'Resolved' },
    { empId: 'EMP-005', location: 'Rajsamand', symptom: 'Fever', status: 'Active' },
    { empId: 'EMP-006', location: 'Ajmer', symptom: 'Malaria', status: 'Active' },
    { empId: 'EMP-007', location: 'Udaipur', symptom: 'Fever', status: 'Active' },
    { empId: 'EMP-008', location: 'Bhilwara', symptom: 'BP', status: 'Active' },
    { empId: 'EMP-009', location: 'Jaipur', symptom: 'Sugar', status: 'Active' },
    { empId: 'EMP-009', location: 'Jaipur', symptom: 'Fever', status: 'Active' }
  ];

  console.log("Seeding health records...");
  for (const record of healthData) {
    try {
      await EmployeeHealthRecord.create(record);
      console.log(`Inserted health record for ${record.empId} (Symptom: ${record.symptom}).`);
    } catch (e) {
      console.log(`Error inserting health record for ${record.empId}:`, e);
    }
  }

  console.log("Done seeding database! Default password for all users is: HindZinc!2026&Ltd");
};

seed();
