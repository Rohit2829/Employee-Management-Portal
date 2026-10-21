import logger from "../logger";
import dayjs from "dayjs";
const { Op } = require("sequelize");
import CommonUtils from "../utils/common";
import { eReturnCodes } from "../enums/commonEnums";
import RequestModel from "../models/common/requestModel";
import CommonRequestModel from "../models/common/commonRequestModel";
import { Employee, EmployeeDTO } from "../models/employeeModels/employee";
import CryptoJS from "crypto-js";

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || '0123456789COSTSHEET';

class EmployeeManagement {
  /**
   * Retrieves a paginated list of employees with optional search.
   * @param req - Request object containing filter criteria.
   * @returns Promise of EmployeeDTO containing the employee list.
   */
  public async getEmployeeList(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    const filterModel: CommonRequestModel = { ...req.data };
    const offset = (filterModel.currentPage - 1) * filterModel.pageSize;
    const limit = filterModel.pageSize;

    try {
      let whereCondition: any = { isDeleted: 0 };

      // Add search filter if searchText is provided
      if (filterModel.searchText) {
        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            { empId: { [Op.like]: `%${filterModel.searchText}%` } },
            { firstName: { [Op.like]: `%${filterModel.searchText}%` } },
            { lastName: { [Op.like]: `%${filterModel.searchText}%` } },
            { email: { [Op.like]: `%${filterModel.searchText}%` } },
            { department: { [Op.like]: `%${filterModel.searchText}%` } },
            { designation: { [Op.like]: `%${filterModel.searchText}%` } },
          ],
        };
      }

      const list = await Employee.findAndCountAll({
        where: whereCondition,
        attributes: [
          "id",
          "empId",
          "firstName",
          "lastName",
          "email",
          "phone",
          "department",
          "designation",
          "location",
          "salary",
          "joiningDate",
          "status",
        ],
        offset,
        limit,
        order: [["id", "DESC"]],
      });

      filterModel.totalRows = list.count;
      filterModel.filterRowsCount = list.rows.length;
      dto.filterModel = filterModel;
      dto.data = list;
      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : getEmployeeList API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }

  /**
   * Add a new employee or update an existing one.
   * If id is present and > 0, it updates; otherwise it creates.
   * @param req - Request object containing employee data.
   * @returns Promise of EmployeeDTO indicating success or error.
   */
  public async addEditEmployee(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    const { id, empId, joiningDate } = req.data;

    // Validate Emp ID Format
    const empIdRegex = /^EMP-\d+$/;
    if (empId && !empIdRegex.test(empId)) {
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
      dto.dataResponse.description = "Emp ID must be in the format EMP-XXX (e.g., EMP-001)";
      return dto;
    }

    // Validate joiningDate is not in the future
    if (joiningDate) {
      if (dayjs(joiningDate).isAfter(dayjs(), 'day')) {
        dto.data = [];
        dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
        dto.dataResponse.description = "Joining date cannot be in the future";
        return dto;
      }
    }

    try {
      if (!id) {
        // --- CREATE ---
        // Check uniqueness
        const duplicate = await Employee.findOne({
          where: {
            isDeleted: 0,
            [Op.or]: [
              { empId: req.data.empId },
              { email: req.data.email },
              { phone: req.data.phone },
            ],
          },
        });

        if (duplicate) {
          dto.data = [];
          dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DUPLICATE_DATA);
          let errorMsg = "Emp ID already exists";
          if (duplicate.email === req.data.email) errorMsg = "Email already exists";
          if (duplicate.phone === req.data.phone) errorMsg = "Phone number already exists";
          
          dto.dataResponse.description = errorMsg;
          return dto;
        }

        const newEmployee = await Employee.create({
          empId: req.data.empId,
          firstName: req.data.firstName,
          lastName: req.data.lastName,
          email: req.data.email,
          phone: req.data.phone,
          department: req.data.department,
          designation: req.data.designation,
          salary: req.data.salary,
          joiningDate: req.data.joiningDate,
          status: req.data.status ?? 1,
          password: req.data.password || null,
          location: req.data.location,
        });

        dto.data = newEmployee;
      } else {
        // --- UPDATE ---
        const existing = await Employee.findOne({
          where: { isDeleted: 0, id: id },
        });

        if (!existing) {
          dto.data = [];
          dto.dataResponse = CommonUtils.getDataResponse(
            eReturnCodes.R_NOT_FOUND
          );
          return dto;
        }

        // Check uniqueness excluding current user
        const duplicate = await Employee.findOne({
          where: {
            isDeleted: 0,
            id: { [Op.ne]: id },
            [Op.or]: [
              { empId: req.data.empId },
              { email: req.data.email },
              { phone: req.data.phone },
            ],
          },
        });

        if (duplicate) {
          dto.data = [];
          dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DUPLICATE_DATA);
          let errorMsg = "Emp ID already exists";
          if (duplicate.email === req.data.email) errorMsg = "Email already exists";
          if (duplicate.phone === req.data.phone) errorMsg = "Phone number already exists";
          
          dto.dataResponse.description = errorMsg;
          return dto;
        }

        const updateData: any = {
          empId: req.data.empId,
          firstName: req.data.firstName,
          lastName: req.data.lastName,
          email: req.data.email,
          phone: req.data.phone,
          department: req.data.department,
          designation: req.data.designation,
          salary: req.data.salary,
          joiningDate: req.data.joiningDate,
          status: req.data.status,
          location: req.data.location,
          updatedOn: new Date(),
        };

        if (req.data.password) {
          updateData.password = req.data.password;
        }

        await existing.update(updateData);

        dto.data = "Employee updated successfully";
      }

      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : addEditEmployee API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }

  /**
   * Fetches a single employee by ID.
   * @param req - Request object containing { id }.
   * @returns Promise of EmployeeDTO with the employee details.
   */
  public async getSpecificEmployee(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    try {
      const employee = await Employee.findOne({
        where: {
          isDeleted: 0,
          id: req.data.id,
        },
      });

      if (!employee) {
        dto.data = [];
        dto.dataResponse = CommonUtils.getDataResponse(
          eReturnCodes.R_NOT_FOUND
        );
        return dto;
      }

      let plainPassword = '';
      if (employee.password) {
        try {
          const bytes = CryptoJS.AES.decrypt(employee.password, ENCRYPT_KEY);
          plainPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          // Ignore decryption error
        }
      }

      const empData = employee.toJSON();
      empData.password = plainPassword;

      dto.data = empData;
      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : getSpecificEmployee API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }

  /**
   * Soft-deletes an employee by setting isDeleted = 1.
   * @param req - Request object containing { id }.
   * @returns Promise of EmployeeDTO indicating success or error.
   */
  public async deleteEmployee(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    try {
      const employee = await Employee.findOne({
        where: {
          isDeleted: 0,
          id: req.data.id,
        },
      });

      if (!employee) {
        dto.data = [];
        dto.dataResponse = CommonUtils.getDataResponse(
          eReturnCodes.R_NOT_FOUND
        );
        return dto;
      }

      await employee.update({
        isDeleted: 1,
        deletedOn: new Date(),
        empId: `DEL-${employee.id}`,
        email: `del_${employee.id}@deleted.com`,
        phone: `del_${employee.id}`
      });

      dto.data = "Employee deleted successfully";
      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : deleteEmployee API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }

  /**
   * Fetches aggregated stats for the dashboard.
   */
  public async getDashboardStats(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    try {
      const { EmployeeHealthRecord } = require("../models/employeeModels/healthRecord");

      // 1. Total Employees
      const totalEmployees = await Employee.count({ where: { isDeleted: 0 } });

      // 2. Active vs Inactive
      const activeCount = await Employee.count({ where: { isDeleted: 0, status: 1 } });
      const inactiveCount = totalEmployees - activeCount;

      // 3. Department Distribution
      const departmentGroups: any = await Employee.findAll({
        where: { isDeleted: 0 },
        attributes: [
          'department',
          [Employee.sequelize!.fn('COUNT', Employee.sequelize!.col('id')), 'count']
        ],
        group: ['department']
      });

      // 4. Total Salary
      const totalSalaryResult: any = await Employee.findAll({
        where: { isDeleted: 0 },
        attributes: [
          [Employee.sequelize!.fn('SUM', Employee.sequelize!.col('salary')), 'totalSalary']
        ]
      });
      const totalSalary = totalSalaryResult[0]?.dataValues.totalSalary || 0;

      // 5. Active Health Cases
      const activeHealthCases = await EmployeeHealthRecord.count({
        where: { status: 'Active' }
      });

      // 6. Top Reported Active Symptom (Checking for ties)
      const topSymptomResult = await EmployeeHealthRecord.findAll({
        where: { status: 'Active' },
        attributes: [
          'symptom',
          [EmployeeHealthRecord.sequelize!.fn('COUNT', EmployeeHealthRecord.sequelize!.col('id')), 'count']
        ],
        group: ['symptom'],
        order: [[EmployeeHealthRecord.sequelize!.literal('count'), 'DESC']]
      });

      let topSymptom = 'None';
      if (topSymptomResult && topSymptomResult.length > 0) {
        const maxCount = parseInt(topSymptomResult[0].dataValues.count || '0', 10);
        if (maxCount > 0) {
          const topSymptoms = topSymptomResult.filter(
            (r: any) => parseInt(r.dataValues.count || '0', 10) === maxCount
          );
          if (topSymptoms.length === 1) {
            topSymptom = `${topSymptoms[0].symptom} (${maxCount} Cases)`;
          } else {
            const names = topSymptoms.map((r: any) => r.symptom).join(', ');
            topSymptom = `${names} (${maxCount} Cases each)`;
          }
        }
      }

      dto.data = {
        totalEmployees,
        activeCount,
        inactiveCount,
        departmentDistribution: departmentGroups.map((g: any) => ({
          department: g.department || 'Unassigned',
          count: parseInt(g.dataValues.count, 10)
        })),
        totalSalary: parseFloat(totalSalary),
        activeHealthCases,
        topSymptom
      };

      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : getDashboardStats API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }

  /**
   * Fetches dynamic aggregated data based on generic parameters.
   * @param req - Request containing { groupBy: string, metric: string }
   */
  public async getDynamicChartData(req: RequestModel): Promise<EmployeeDTO> {
    const dto: EmployeeDTO = new EmployeeDTO(
      CommonUtils.getDataResponse(eReturnCodes.R_SUCCESS)
    );

    if (!req.data) {
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
      dto.dataResponse.description = "Missing request data";
      return dto;
    }

    const { groupBy, metric } = req.data;

    // Validate inputs to prevent SQL injection or bad queries
    const allowedGroupBys = ['department', 'designation', 'status'];
    const allowedMetrics = ['count', 'sum_salary', 'avg_salary'];

    if (!allowedGroupBys.includes(groupBy) || !allowedMetrics.includes(metric)) {
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_VALIDATION_ERROR);
      dto.dataResponse.description = "Invalid groupBy or metric parameter";
      return dto;
    }

    try {
      let aggFunction: any;
      
      if (metric === 'count') {
        aggFunction = [Employee.sequelize!.fn('COUNT', Employee.sequelize!.col('id')), 'value'];
      } else if (metric === 'sum_salary') {
        aggFunction = [Employee.sequelize!.fn('SUM', Employee.sequelize!.col('salary')), 'value'];
      } else if (metric === 'avg_salary') {
        aggFunction = [Employee.sequelize!.fn('AVG', Employee.sequelize!.col('salary')), 'value'];
      }

      const results: any = await Employee.findAll({
        where: { isDeleted: 0 },
        attributes: [
          [groupBy, 'label'],
          aggFunction
        ],
        group: [groupBy],
        raw: true
      });

      // Format results safely
      dto.data = results.map((row: any) => {
        let labelStr = row.label;
        if (groupBy === 'status') {
          labelStr = row.label === 1 ? 'Active' : 'Inactive';
        } else if (!row.label) {
          labelStr = 'Unassigned';
        }

        return {
          label: labelStr,
          value: metric === 'count' ? parseInt(row.value, 10) : parseFloat(row.value || '0')
        };
      });

      return dto;
    } catch (error: any) {
      logger.info(
        `Error Occurred in employeeService : getDynamicChartData API - ${(error as Error).message}`
      );
      dto.data = [];
      dto.dataResponse = CommonUtils.getDataResponse(eReturnCodes.R_DB_ERROR);
      return dto;
    }
  }
}

export default new EmployeeManagement();
