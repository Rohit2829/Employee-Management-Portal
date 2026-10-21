import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database/db";
import { Employee } from "./employee";

export class RotationLog extends Model {
  public id!: number;
  public candidateEmpId!: string;
  public counterpartEmpId!: string;
  public candidateOldLocation!: string;
  public counterpartOldLocation!: string;
  public swapType!: "Temporary" | "Permanent";
  public durationMonths!: number | null;
  public reason!: string;
  public activeSymptomCount!: number;
  public sickLeaveCount!: number;
  public status!: "Pending" | "Active" | "Completed" | "Dismissed" | "Reverted";
  public isAutomated!: boolean;
  public createdOn!: Date;

  // Relation typing
  public readonly candidateEmployee?: Employee;
  public readonly counterpartEmployee?: Employee;
}

RotationLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    candidateEmpId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "candidate_emp_id",
      references: {
        model: "employees",
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
    counterpartEmpId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "counterpart_emp_id",
      references: {
        model: "employees",
        key: "emp_id",
      },
      onDelete: "CASCADE",
    },
    candidateOldLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "candidate_old_location",
    },
    counterpartOldLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "counterpart_old_location",
    },
    swapType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "swap_type",
    },
    durationMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "duration_months",
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    activeSymptomCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "active_symptom_count",
    },
    sickLeaveCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sick_leave_count",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Pending",
    },
    isAutomated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_automated",
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
    modelName: "RotationLog",
    tableName: "rotation_logs",
    timestamps: false,
  }
);

export default RotationLog;
