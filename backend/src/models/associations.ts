import { Employee } from "./employeeModels/employee";
import { EmployeeHealthRecord } from "./employeeModels/healthRecord";
import { SickLeave } from "./employeeModels/sickLeave";
import { RotationLog } from "./employeeModels/rotationLog";

/**
 * setupAssociations - Configure relationships for Employee, Health Records, Sick Leaves, and Rotation Logs
 */
const setupAssociations = () => {
  Employee.hasMany(EmployeeHealthRecord, {
    foreignKey: "empId",
    sourceKey: "empId",
    as: "healthRecords",
  });
  
  EmployeeHealthRecord.belongsTo(Employee, {
    foreignKey: "empId",
    targetKey: "empId",
    as: "employee",
  });

  Employee.hasMany(SickLeave, {
    foreignKey: "empId",
    sourceKey: "empId",
    as: "sickLeaves",
  });

  SickLeave.belongsTo(Employee, {
    foreignKey: "empId",
    targetKey: "empId",
    as: "employee",
  });

  Employee.hasMany(RotationLog, {
    foreignKey: "candidateEmpId",
    sourceKey: "empId",
    as: "candidateRotations",
  });

  Employee.hasMany(RotationLog, {
    foreignKey: "counterpartEmpId",
    sourceKey: "empId",
    as: "counterpartRotations",
  });

  RotationLog.belongsTo(Employee, {
    foreignKey: "candidateEmpId",
    targetKey: "empId",
    as: "candidateEmployee",
  });

  RotationLog.belongsTo(Employee, {
    foreignKey: "counterpartEmpId",
    targetKey: "empId",
    as: "counterpartEmployee",
  });
};

export default setupAssociations;
