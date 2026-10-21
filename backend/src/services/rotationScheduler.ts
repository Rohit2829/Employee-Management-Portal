import { Employee } from "../models/employeeModels/employee";
import { EmployeeHealthRecord } from "../models/employeeModels/healthRecord";
import { SickLeave } from "../models/employeeModels/sickLeave";
import { RotationLog } from "../models/employeeModels/rotationLog";
import { Op } from "sequelize";
import logger from "../logger";

/**
 * Runs the rotation evaluation scheduler to generate pending recommendations
 * and check for expired temporary swaps to revert.
 */
export async function runRotationSchedulerSimulation(): Promise<void> {
  try {
    logger.info("Starting Temporal Job Rotation Scheduler evaluation...");

    // 1. Revert expired temporary swaps
    const now = new Date();
    const activeTempSwaps = await RotationLog.findAll({
      where: {
        status: "Active",
        swapType: "Temporary",
      },
    });

    for (const swap of activeTempSwaps) {
      if (swap.durationMonths) {
        const expiryDate = new Date(swap.createdOn);
        expiryDate.setMonth(expiryDate.getMonth() + swap.durationMonths);

        if (now >= expiryDate) {
          logger.info(`Temporary swap ID ${swap.id} has expired (duration: ${swap.durationMonths} months). Reverting automatically...`);
          await revertTemporarySwapAction(swap.id);
        }
      }
    }

    // 2. Scan and create pending recommendations
    const allEmployees = await Employee.findAll({
      where: { isDeleted: 0 },
    });

    const activeHealthRecords = await EmployeeHealthRecord.findAll({
      where: { status: "Active" },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSickLeaves = await SickLeave.findAll({
      where: {
        leaveDate: {
          [Op.gte]: thirtyDaysAgo.toISOString().split("T")[0],
        },
      },
    });

    // Maps
    const symptomsMap = new Map<string, string[]>();
    activeHealthRecords.forEach((r) => {
      if (!symptomsMap.has(r.empId)) {
        symptomsMap.set(r.empId, []);
      }
      symptomsMap.get(r.empId)!.push(r.symptom);
    });

    const sickLeavesMap = new Map<string, number>();
    recentSickLeaves.forEach((l) => {
      sickLeavesMap.set(l.empId, (sickLeavesMap.get(l.empId) || 0) + 1);
    });

    // Evaluate candidates
    for (const employee of allEmployees) {
      const activeSymptoms = symptomsMap.get(employee.empId) || [];
      const sickLeaveCount = sickLeavesMap.get(employee.empId) || 0;

      const isCandidate = activeSymptoms.length > 2 || sickLeaveCount > 3;

      if (!isCandidate) continue;

      // Check if employee already has a pending or active swap recommendation as a candidate or counterpart
      const existingSwap = await RotationLog.findOne({
        where: {
          [Op.or]: [
            { candidateEmpId: employee.empId },
            { counterpartEmpId: employee.empId },
          ],
          status: {
            [Op.in]: ["Pending", "Active"],
          },
        },
      });

      if (existingSwap) continue;

      // Find a counterpart
      const counterparts = allEmployees
        .filter((emp) => 
          emp.empId !== employee.empId &&
          emp.location !== employee.location &&
          emp.department === employee.department
        )
        .map((emp) => {
          const symptoms = symptomsMap.get(emp.empId) || [];
          const leaves = sickLeavesMap.get(emp.empId) || 0;
          return {
            emp,
            symptoms,
            leaves,
          };
        })
        // Filter out counterparts who are high-risk themselves
        .filter((c) => c.symptoms.length < 2 && c.leaves <= 3);

      if (counterparts.length === 0) continue;

      // Sort by active symptoms (healthiest counterpart first)
      const sortedCounterparts = counterparts.sort((a, b) => a.symptoms.length - b.symptoms.length);
      const bestCounterpart = sortedCounterparts[0].emp;

      // Draft pending recommendation
      const reason = activeSymptoms.length > 2
        ? `Candidate has ${activeSymptoms.length} active symptoms (${activeSymptoms.join(", ")}).`
        : `Candidate has ${sickLeaveCount} sick leaves in past 30 days.`;

      await RotationLog.create({
        candidateEmpId: employee.empId,
        counterpartEmpId: bestCounterpart.empId,
        candidateOldLocation: employee.location,
        counterpartOldLocation: bestCounterpart.location,
        swapType: "Temporary",
        durationMonths: 3,
        reason,
        activeSymptomCount: activeSymptoms.length,
        sickLeaveCount,
        status: "Pending",
        isAutomated: true,
        createdOn: new Date(),
      });

      logger.info(`Drafted pending job rotation recommendation: Candidate ${employee.empId} ➜ Counterpart ${bestCounterpart.empId}`);
    }

    logger.info("Job Rotation Scheduler evaluation completed successfully.");
  } catch (error) {
    logger.error(`Error in runRotationSchedulerSimulation: ${(error as Error).message}`);
  }
}

/**
 * Reverts a temporary swap action (internally used by scheduler or controller).
 */
export async function revertTemporarySwapAction(logId: number): Promise<boolean> {
  const transaction = await Employee.sequelize!.transaction();
  try {
    const log = await RotationLog.findByPk(logId, { transaction });
    if (!log || log.status !== "Active") {
      await transaction.rollback();
      return false;
    }

    const candidate = await Employee.findOne({ where: { empId: log.candidateEmpId }, transaction });
    const counterpart = await Employee.findOne({ where: { empId: log.counterpartEmpId }, transaction });

    if (!candidate || !counterpart) {
      await transaction.rollback();
      return false;
    }

    // Restore original locations
    candidate.location = log.candidateOldLocation;
    counterpart.location = log.counterpartOldLocation;

    await candidate.save({ transaction });
    await counterpart.save({ transaction });

    // Swap locations in active Health Records
    await EmployeeHealthRecord.update(
      { location: log.candidateOldLocation },
      { where: { empId: log.candidateEmpId, status: "Active" }, transaction }
    );

    await EmployeeHealthRecord.update(
      { location: log.counterpartOldLocation },
      { where: { empId: log.counterpartEmpId, status: "Active" }, transaction }
    );

    // Update log status to Reverted
    log.status = "Reverted";
    await log.save({ transaction });

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error reverting temporary swap ${logId}: ${(error as Error).message}`);
    return false;
  }
}
