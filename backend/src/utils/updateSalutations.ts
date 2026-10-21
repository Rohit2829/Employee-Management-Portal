import { Employee } from "../models/employeeModels/employee";
import { RotationLog } from "../models/employeeModels/rotationLog";
import logger from "../logger";

const femaleNames = new Set([
  "priya", "neha", "ananya", "divya", "pooja", "kiran", "aditi", "meera", 
  "sunita", "ritu", "deepika", "shreya", "kriti", "sneha", "tanvi", 
  "preeti", "kavita", "swati", "nisha", "shalini", "aarti", "jyoti",
  "anjali", "ananya sen", "divya iyer", "priya sharma", "neha gupta"
]);

export async function applyExistingDataSalutations(): Promise<void> {
  try {
    logger.info("Starting database update to apply salutations to existing employees...");
    const employees = await Employee.findAll({ where: { isDeleted: 0 } });
    let updatedCount = 0;

    for (const emp of employees) {
      const currentFirstName = emp.firstName.trim();
      const cleanName = currentFirstName.replace(/^(Mr\.|Ms\.|Mrs\.)\s*/i, '');

      // Infer salutation
      const firstNameLower = cleanName.toLowerCase();
      let prefix = "Mr.";

      if (femaleNames.has(firstNameLower)) {
        prefix = "Ms.";
      }

      const correctName = `${prefix} ${cleanName}`;
      if (emp.firstName !== correctName) {
        emp.firstName = correctName;
        await emp.save();
        updatedCount++;
        logger.info(`Applied salutation to ${emp.empId}: ${emp.firstName}`);
      }
    }

    logger.info(`Completed database update. Applied/Corrected salutations for ${updatedCount} employees.`);

    // Migrate existing Completed logs (reverted swaps) to 'Reverted' status
    const revertedCount = await RotationLog.update(
      { status: "Reverted" },
      { where: { status: "Completed" } }
    );
    logger.info(`Successfully migrated ${revertedCount[0]} completed rotation logs to 'Reverted' status.`);

    // Clear old pending recommendations to regenerate them cleanly
    const deletedCount = await RotationLog.destroy({
      where: { status: "Pending" }
    });
    logger.info(`Successfully cleared ${deletedCount} old pending recommendations.`);
  } catch (error) {
    logger.error(`Error in applyExistingDataSalutations: ${(error as Error).message}`);
  }
}
