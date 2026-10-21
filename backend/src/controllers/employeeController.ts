import { Request, Response } from "express";
import EmployeeManagement from "../services/employeeService";

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.getEmployeeList(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addEditEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.addEditEmployee(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSpecificEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.getSpecificEmployee(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.deleteEmployee(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.getDashboardStats(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDynamicChartData = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await EmployeeManagement.getDynamicChartData(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
