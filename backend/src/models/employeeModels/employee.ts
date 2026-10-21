import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/db";
import BaseResponse from "../common/baseResponse";
import CommonRequestModel from "../common/commonRequestModel";

export class EmployeeDTO extends BaseResponse {
  public filterModel: CommonRequestModel | undefined;
}

export class Employee extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public empId!: string;
  public email!: string;
  public phone!: string;
  public department!: string;
  public designation!: string;
  public salary!: number;
  public joiningDate!: Date;
  public status!: number;
  public createdOn!: Date;
  public createdBy!: number;
  public updatedOn!: Date | null;
  public updatedBy!: number;
  public isDeleted!: number;
  public deletedOn!: Date | null;
  public deletedBy!: number;
  public password!: string;
  public location!: string;
}

Employee.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    empId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "emp_id",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    joiningDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "joining_date",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_on",
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "created_by",
    },
    updatedOn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_on",
    },
    updatedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "updated_by",
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: "is_deleted",
    },
    deletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_on",
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "deleted_by",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null initially for old records before we seed them
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: false,
  }
);

export default Employee;
