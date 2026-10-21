import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/db";
import { Employee } from "./employee";

export class SickLeave extends Model {
  public id!: number;
  public empId!: string;
  public leaveDate!: string;
  public reason!: string;
  public createdOn!: Date;

  // Relation typing
  public readonly employee?: Employee;
}

SickLeave.init(
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
    leaveDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "leave_date",
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    modelName: "SickLeave",
    tableName: "sick_leaves",
    timestamps: false,
  }
);

export default SickLeave;
