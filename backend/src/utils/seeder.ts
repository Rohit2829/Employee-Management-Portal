import { Employee } from "../models/employeeModels/employee";
import { SickLeave } from "../models/employeeModels/sickLeave";
import { runRotationSchedulerSimulation } from "../services/rotationScheduler";
import { applyExistingDataSalutations } from "./updateSalutations";
import logger from "../logger";

export async function seedNewFeaturesData(): Promise<void> {
  try {
    // Apply salutations to existing database employees who don't have them
    await applyExistingDataSalutations();

    const sickLeavesCount = await SickLeave.count();
    if (sickLeavesCount === 0) {
      logger.info("No sick leaves found. Seeding initial sick leaves...");
      
      const employees = await Employee.findAll({ where: { isDeleted: 0 } });
      if (employees.length >= 2) {
        // Let's seed 3 sick leaves in the last 15 days for the first employee
        // to trigger the >= 3 leaves candidate flag
        const emp1 = employees[0];
        const date1 = new Date();
        date1.setDate(date1.getDate() - 3);
        const date2 = new Date();
        date2.setDate(date2.getDate() - 7);
        const date3 = new Date();
        date3.setDate(date3.getDate() - 12);

        await SickLeave.bulkCreate([
          {
            empId: emp1.empId,
            leaveDate: date1.toISOString().split("T")[0],
            reason: "Persistent fever and headache",
            createdOn: new Date()
          },
          {
            empId: emp1.empId,
            leaveDate: date2.toISOString().split("T")[0],
            reason: "Severe dust allergy & respiratory discomfort",
            createdOn: new Date()
          },
          {
            empId: emp1.empId,
            leaveDate: date3.toISOString().split("T")[0],
            reason: "High body temperature",
            createdOn: new Date()
          }
        ]);

        // Seed 1 sick leave for the second employee
        const emp2 = employees[1];
        const date4 = new Date();
        date4.setDate(date4.getDate() - 5);

        await SickLeave.create({
          empId: emp2.empId,
          leaveDate: date4.toISOString().split("T")[0],
          reason: "Minor skin rash",
          createdOn: new Date()
        });

        logger.info(`Successfully seeded sick leaves for ${emp1.empId} and ${emp2.empId}.`);
      } else {
        logger.warn("Not enough employees in database to seed sick leaves.");
      }
    }

    // Now run scheduler to populate initial recommendations
    await runRotationSchedulerSimulation();
  } catch (error) {
    logger.error(`Error in seedNewFeaturesData: ${(error as Error).message}`);
  }
}
