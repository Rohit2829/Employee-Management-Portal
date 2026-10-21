import { Employee } from "../models/employeeModels/employee";
import { EmployeeHealthRecord } from "../models/employeeModels/healthRecord";
import { SickLeave } from "../models/employeeModels/sickLeave";
import { RotationLog } from "../models/employeeModels/rotationLog";
import { revertTemporarySwapAction } from "./rotationScheduler";
import CommonUtils from "../utils/common";
import { eReturnCodes } from "../enums/commonEnums";
import RequestModel from "../models/common/requestModel";
import logger from "../logger";

class HealthService {
  /**
   * Retrieves all active health records joined with employee names.
   * @param req - Request object.
   * @returns Promise containing the health records list.
   */
  public async getHealthRecords(req: RequestModel): Promise<any> {
    try {
      const list = await EmployeeHealthRecord.findAll({
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["firstName", "lastName", "email"],
            where: { isDeleted: 0 }
          }
        ],
        order: [["id", "DESC"]]
      });

      // Flatten employee details for easier frontend consumption
      const formattedList = list.map((record: any) => {
        const data = record.toJSON();
        return {
          id: data.id,
          empId: data.empId,
          location: data.location,
          symptom: data.symptom,
          status: data.status,
          createdOn: data.createdOn,
          employeeName: data.employee ? `${data.employee.firstName} ${data.employee.lastName}` : "Unknown",
          email: data.employee ? data.employee.email : ""
        };
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: formattedList
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : getHealthRecords - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }

  /**
   * Adds a new employee health record after performing business validations.
   * @param req - Request object containing record details.
   */
  public async addHealthRecord(req: RequestModel): Promise<any> {
    try {
      const { id, empId, location, symptom, status, statuses } = req.data;
      const { Op } = require("sequelize");

      const trimmedEmpId = String(empId || "").trim();
      const trimmedLocation = String(location || "").trim();
      const defaultStatus = String(status || "Active").trim();
      const statusesMap: Record<string, string> = statuses && typeof statuses === 'object' ? statuses : {};

      const rawSymptoms: string[] = Array.isArray(symptom)
        ? symptom
        : [String(symptom || "").trim()];
      const symptomsList: string[] = rawSymptoms
        .flatMap(s => s.split(','))
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (!trimmedEmpId || !trimmedLocation || symptomsList.length === 0) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Employee ID, Location, and Symptoms are required fields.";
        return { dataResponse: errResponse, data: [] };
      }

      // 1. Validate Emp ID Format
      const empIdRegex = /^EMP-\d+$/;
      if (!empIdRegex.test(trimmedEmpId)) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Emp ID must be in the format EMP-XXX (e.g., EMP-001)";
        return { dataResponse: errResponse, data: [] };
      }

      // 2. Validate that the employee exists in the portal database
      const employee = await Employee.findOne({ where: { empId: trimmedEmpId, isDeleted: 0 } });
      if (!employee) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = `Employee ID ${trimmedEmpId} is not registered in this portal.`;
        return { dataResponse: errResponse, data: [] };
      }

      // 3. Enforce single location per employee rule
      const otherLocationRecord = await EmployeeHealthRecord.findOne({
        where: { 
          empId: trimmedEmpId,
          location: { [Op.ne]: trimmedLocation }
        }
      });
      if (otherLocationRecord) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = `Employee is already registered in ${otherLocationRecord.location}.`;
        return { dataResponse: errResponse, data: [] };
      }

      // Helper function to capitalize title case
      const formatTitleCase = (str: string): string => {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
      };

      const formatSymptom = (str: string): string => {
        if (str.toLowerCase() === 'bp') return 'BP';
        return formatTitleCase(str);
      };

      // 1. Fetch current registered symptoms for this employee
      const currentRecords = await EmployeeHealthRecord.findAll({
        where: { empId: trimmedEmpId }
      });

      const newSymptoms = symptomsList.map(s => formatSymptom(s));

      // 2. Delete symptoms that are no longer selected in one database call
      await EmployeeHealthRecord.destroy({
        where: {
          empId: trimmedEmpId,
          symptom: { [Op.notIn]: newSymptoms }
        }
      });

      // 3. Create symptoms that are new, update existing ones in parallel
      const resultRecords = await Promise.all(
        newSymptoms.map(async (sym) => {
          const symStatus = statusesMap[sym] || defaultStatus;
          const location = formatTitleCase(trimmedLocation);
          const existing = currentRecords.find(r => r.symptom.toLowerCase() === sym.toLowerCase());

          return existing
            ? existing.update({ location, status: symStatus })
            : EmployeeHealthRecord.create({ empId: trimmedEmpId, symptom: sym, location, status: symStatus });
        })
      );

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: resultRecords
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : addHealthRecord - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }

  /**
   * Deletes health records.
   * @param req - Request containing the record ID or Emp ID.
   */
  public async deleteHealthRecord(req: RequestModel): Promise<any> {
    try {
      const { id, empId } = req.data;
      if (!id && !empId) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Record ID or Emp ID is required for deletion.";
        return { dataResponse: errResponse, data: [] };
      }

      if (empId) {
        await EmployeeHealthRecord.destroy({ where: { empId } });
      } else {
        await EmployeeHealthRecord.destroy({ where: { id } });
      }

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: true
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : deleteHealthRecord - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: false
      };
    }
  }

  /**
   * Identifies high-risk employees (>= 2 active symptoms OR >= 3 sick leaves in past 30 days) 
   * and suggests counterpart swaps in different locations with environmental suitability scores.
   */
  public async getJobRotationSuggestions(req: RequestModel): Promise<any> {
    try {
      const { Op } = require("sequelize");

      // 1. Fetch all active health records
      const healthRecords = await EmployeeHealthRecord.findAll({
        where: { status: 'Active' },
        include: [{ model: Employee, as: 'employee', where: { isDeleted: 0 } }]
      });

      // Fetch all sick leaves in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSickLeaves = await SickLeave.findAll({
        where: {
          leaveDate: {
            [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
          },
        },
      });

      // Map of empId -> active symptoms array
      const activeSymptomsMap = new Map<string, { employee: any, symptoms: string[] }>();
      healthRecords.forEach((record: any) => {
        const data = record.toJSON();
        if (data.employee) {
          if (!activeSymptomsMap.has(data.empId)) {
            activeSymptomsMap.set(data.empId, {
              employee: data.employee,
              symptoms: []
            });
          }
          activeSymptomsMap.get(data.empId)!.symptoms.push(data.symptom);
        }
      });

      // Map of empId -> sick leave count
      const sickLeavesMap = new Map<string, number>();
      recentSickLeaves.forEach((l) => {
        sickLeavesMap.set(l.empId, (sickLeavesMap.get(l.empId) || 0) + 1);
      });

      // 2. Find candidates (Active symptoms > 2 OR Sick leaves > 3)
      const candidates: any[] = [];
      const allEmployees = await Employee.findAll({
        where: { isDeleted: 0 }
      });

      allEmployees.forEach((employee) => {
        const healthInfo = activeSymptomsMap.get(employee.empId);
        const symptoms = healthInfo ? healthInfo.symptoms : [];
        const sickLeaveCount = sickLeavesMap.get(employee.empId) || 0;

        if (symptoms.length > 2 || sickLeaveCount > 3) {
          candidates.push({
            empId: employee.empId,
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            department: employee.department,
            location: employee.location,
            activeSymptoms: symptoms,
            sickLeaveCount
          });
        }
      });

      const suggestions = candidates.map(candidate => {
        // Find counterparts: same department, different location, and healthy (symptoms < 2 and leaves <= 3)
        const counterparts = allEmployees
          .filter(emp => 
            emp.empId !== candidate.empId &&
            emp.location !== candidate.location &&
            emp.department === candidate.department
          )
          .map(emp => {
            const healthInfo = activeSymptomsMap.get(emp.empId);
            const activeSymptoms = healthInfo ? healthInfo.symptoms : [];
            const sickLeaveCount = sickLeavesMap.get(emp.empId) || 0;
            return {
              empId: emp.empId,
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email,
              department: emp.department,
              location: emp.location,
              activeSymptoms,
              sickLeaveCount
            };
          })
          .filter(c => c.activeSymptoms.length < 2 && c.sickLeaveCount <= 3)
          // Sort counterparts: healthiest first
          .sort((a, b) => a.activeSymptoms.length - b.activeSymptoms.length);

        return {
          candidate,
          counterparts
        };
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: suggestions
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : getJobRotationSuggestions - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }

  /**
   * Executes a cross-plant swap of locations for two employees, creating audit trail logs.
   */
  public async executeJobRotation(req: RequestModel): Promise<any> {
    const transaction = await Employee.sequelize!.transaction();
    try {
      const { candidateEmpId, counterpartEmpId, swapType, durationMonths, pendingLogId } = req.data;
      if (!candidateEmpId || !counterpartEmpId) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = 'Missing candidate or counterpart ID.';
        return {
          dataResponse: errResponse
        };
      }

      const candidate = await Employee.findOne({ where: { empId: candidateEmpId, isDeleted: 0 }, transaction });
      const counterpart = await Employee.findOne({ where: { empId: counterpartEmpId, isDeleted: 0 }, transaction });

      if (!candidate || !counterpart) {
        await transaction.rollback();
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = 'Candidate or Counterpart employee not found.';
        return {
          dataResponse: errResponse
        };
      }

      const candidateOldLocation = candidate.location;
      const counterpartOldLocation = counterpart.location;

      // 1. Swap locations in Employees table
      candidate.location = counterpartOldLocation;
      counterpart.location = candidateOldLocation;

      await candidate.save({ transaction });
      await counterpart.save({ transaction });

      // 2. Swap locations in active Health Records (so location-based charts auto-update correctly)
      await EmployeeHealthRecord.update(
        { location: counterpartOldLocation }, // candidate's new location
        { where: { empId: candidateEmpId, status: 'Active' }, transaction }
      );

      await EmployeeHealthRecord.update(
        { location: candidateOldLocation }, // counterpart's new location
        { where: { empId: counterpartEmpId, status: 'Active' }, transaction }
      );

      // 3. Count current active symptoms and sick leaves for logging
      const activeSymptomCount = await EmployeeHealthRecord.count({
        where: { empId: candidateEmpId, status: 'Active' },
        transaction
      });

      const { Op } = require("sequelize");
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sickLeaveCount = await SickLeave.count({
        where: {
          empId: candidateEmpId,
          leaveDate: {
            [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0]
          }
        },
        transaction
      });

      const resolvedSwapType = swapType || "Permanent";
      const resolvedDuration = resolvedSwapType === "Temporary" ? (durationMonths || 3) : null;
      const reason = `Executed swap: ${candidate.firstName} ➜ ${counterpart.firstName}`;

      // 4. Update pending recommendation or create new rotation audit log
      if (pendingLogId) {
        const log = await RotationLog.findByPk(pendingLogId, { transaction });
        if (log) {
          log.status = "Active";
          log.swapType = resolvedSwapType;
          log.durationMonths = resolvedDuration;
          log.activeSymptomCount = activeSymptomCount;
          log.sickLeaveCount = sickLeaveCount;
          await log.save({ transaction });
        }
      } else {
        await RotationLog.create({
          candidateEmpId,
          counterpartEmpId,
          candidateOldLocation,
          counterpartOldLocation,
          swapType: resolvedSwapType,
          durationMonths: resolvedDuration,
          reason,
          activeSymptomCount,
          sickLeaveCount,
          status: "Active",
          isAutomated: false,
          createdOn: new Date()
        }, { transaction });
      }

      await transaction.commit();

      const successResponse = CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS);
      successResponse.description = `Successfully swapped ${candidate.firstName} ${candidate.lastName} (${candidateOldLocation} ➜ ${counterpartOldLocation}) with ${counterpart.firstName} ${counterpart.lastName} (${counterpartOldLocation} ➜ ${candidateOldLocation}).`;

      return {
        dataResponse: successResponse
      };
    } catch (error) {
      await transaction.rollback();
      logger.info(`Error Occurred in healthService : executeJobRotation - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR)
      };
    }
  }

  /**
   * Reverts a temporary swap restoration.
   */
  public async revertJobRotation(req: RequestModel): Promise<any> {
    try {
      const { logId } = req.data;
      if (!logId) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Log ID is required for reverting swap.";
        return { dataResponse: errResponse };
      }

      const success = await revertTemporarySwapAction(logId);
      if (!success) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Failed to revert temporary swap. Log not found or not in active state.";
        return { dataResponse: errResponse };
      }

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: true
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : revertJobRotation - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR)
      };
    }
  }

  /**
   * Gets the list of executed and pending rotation logs.
   */
  public async getRotationAuditTrail(req: RequestModel): Promise<any> {
    try {
      const logs = await RotationLog.findAll({
        include: [
          {
            model: Employee,
            as: "candidateEmployee",
            attributes: ["firstName", "lastName", "email"]
          },
          {
            model: Employee,
            as: "counterpartEmployee",
            attributes: ["firstName", "lastName", "email"]
          }
        ],
        order: [["id", "DESC"]]
      });

      const formattedLogs = logs.map((log: any) => {
        const data = log.toJSON();
        return {
          id: data.id,
          candidateEmpId: data.candidateEmpId,
          counterpartEmpId: data.counterpartEmpId,
          candidateName: data.candidateEmployee ? `${data.candidateEmployee.firstName} ${data.candidateEmployee.lastName}` : "Unknown",
          counterpartName: data.counterpartEmployee ? `${data.counterpartEmployee.firstName} ${data.counterpartEmployee.lastName}` : "Unknown",
          candidateOldLocation: data.candidateOldLocation,
          counterpartOldLocation: data.counterpartOldLocation,
          swapType: data.swapType,
          durationMonths: data.durationMonths,
          reason: data.reason,
          activeSymptomCount: data.activeSymptomCount,
          sickLeaveCount: data.sickLeaveCount,
          status: data.status,
          isAutomated: data.isAutomated,
          createdOn: data.createdOn
        };
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: formattedLogs
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : getRotationAuditTrail - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }

  /**
   * Responds to an automated suggestion by approving or dismissing it.
   */
  public async respondToAutomatedRecommendation(req: RequestModel): Promise<any> {
    try {
      const { logId, action } = req.data; // action is either 'Approve' or 'Dismiss'
      if (!logId || !action) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Log ID and action are required.";
        return { dataResponse: errResponse };
      }

      const log = await RotationLog.findByPk(logId);
      if (!log || log.status !== "Pending") {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Recommendation not found or not in pending state.";
        return { dataResponse: errResponse };
      }

      if (action === "Dismiss") {
        log.status = "Dismissed";
        await log.save();
        return {
          dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
          data: true
        };
      } else if (action === "Approve") {
        const executeReq = {
          data: {
            candidateEmpId: log.candidateEmpId,
            counterpartEmpId: log.counterpartEmpId,
            swapType: log.swapType,
            durationMonths: log.durationMonths,
            pendingLogId: log.id
          }
        } as RequestModel;
        
        return await this.executeJobRotation(executeReq);
      }

      const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
      errResponse.description = "Invalid action. Must be Approve or Dismiss.";
      return { dataResponse: errResponse };
    } catch (error) {
      logger.info(`Error Occurred in healthService : respondToAutomatedRecommendation - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR)
      };
    }
  }

  /**
   * Gets sick leaves log.
   */
  public async getSickLeaves(req: RequestModel): Promise<any> {
    try {
      const list = await SickLeave.findAll({
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["firstName", "lastName", "email"]
          }
        ],
        order: [["leaveDate", "DESC"]]
      });

      const formattedList = list.map((record: any) => {
        const data = record.toJSON();
        return {
          id: data.id,
          empId: data.empId,
          leaveDate: data.leaveDate,
          reason: data.reason,
          createdOn: data.createdOn,
          employeeName: data.employee ? `${data.employee.firstName} ${data.employee.lastName}` : "Unknown",
          email: data.employee ? data.employee.email : ""
        };
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: formattedList
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : getSickLeaves - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }

  /**
   * Logs a new sick leave.
   */
  public async addSickLeave(req: RequestModel): Promise<any> {
    try {
      const { empId, leaveDate, reason } = req.data;
      if (!empId || !leaveDate) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = "Employee ID and Leave Date are required.";
        return { dataResponse: errResponse };
      }

      // Check if employee exists
      const employee = await Employee.findOne({ where: { empId, isDeleted: 0 } });
      if (!employee) {
        const errResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        errResponse.description = `Employee ID ${empId} is not registered.`;
        return { dataResponse: errResponse };
      }

      const record = await SickLeave.create({
        empId,
        leaveDate,
        reason: reason || "Sick Leave",
        createdOn: new Date()
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: record
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : addSickLeave - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR)
      };
    }
  }

  /**
   * Retrieves daily active symptoms, resolved symptoms, and rotations over the last 30 days.
   */
  public async getSymptomImpactTrend(req: RequestModel): Promise<any> {
    try {
      const dates: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }

      const healthRecords = await EmployeeHealthRecord.findAll();
      const rotations = await RotationLog.findAll({
        where: {
          status: ["Active", "Completed"]
        }
      });

      const trendData = dates.map(dateStr => {
        let activeCount = 0;
        let resolvedCount = 0;

        healthRecords.forEach((record: any) => {
          const createdDateStr = record.createdOn.toISOString().split('T')[0];

          if (createdDateStr <= dateStr) {
            if (record.status === "Active") {
              activeCount++;
            } else {
              // Assume resolved 5 days after creation
              const createdDate = new Date(record.createdOn);
              const resolutionDate = new Date(createdDate);
              resolutionDate.setDate(resolutionDate.getDate() + 5);
              const resolutionDateStr = resolutionDate.toISOString().split('T')[0];

              if (dateStr >= resolutionDateStr) {
                resolvedCount++;
              } else {
                activeCount++;
              }
            }
          }
        });

        const rotationCount = rotations.filter((r: any) => {
          const rotationDateStr = r.createdOn.toISOString().split('T')[0];
          return rotationDateStr === dateStr;
        }).length;

        return {
          date: dateStr,
          active: activeCount,
          resolved: resolvedCount,
          rotations: rotationCount
        };
      });

      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS),
        data: trendData
      };
    } catch (error) {
      logger.info(`Error Occurred in healthService : getSymptomImpactTrend - ${(error as Error).message}`);
      return {
        dataResponse: CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR),
        data: []
      };
    }
  }
}

export default new HealthService();
