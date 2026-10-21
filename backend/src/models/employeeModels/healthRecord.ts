import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/db";
import { Employee } from "./employee";

export class EmployeeHealthRecord extends Model {
  public id!: number;
  public empId!: string;
  public location!: string;
  public symptom!: string;
  public status!: string;
  public createdOn!: Date;

  // Relation typing
  public readonly employee?: Employee;
}

EmployeeHealthRecord.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    empId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "emp_id",
      references: {
        model: "employees",
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    symptom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Active",
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_on",
    },
  },
  {
    sequelize,
    modelName: "EmployeeHealthRecord",
    tableName: "health_records",
    timestamps: false,
  }
);
