import { Request, Response } from "express";
import HealthService from "../services/healthService";
import { runRotationSchedulerSimulation } from "../services/rotationScheduler";

export const getHealthRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.getHealthRecords(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addHealthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.addHealthRecord(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteHealthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.deleteHealthRecord(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getJobRotationSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.getJobRotationSuggestions(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const executeJobRotation = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.executeJobRotation(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const revertTemporarySwap = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.revertJobRotation(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRotationAuditTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.getRotationAuditTrail(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const respondToAutomatedRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.respondToAutomatedRecommendation(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSickLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.getSickLeaves(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addSickLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.addSickLeave(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSymptomImpactTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await HealthService.getSymptomImpactTrend(req.body));
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const runSchedulerSimulation = async (req: Request, res: Response): Promise<void> => {
  try {
    await runRotationSchedulerSimulation();
    res.json({
      dataResponse: {
        returnCode: "1000",
        returnMessage: "Success",
        description: "Scheduler evaluation simulation triggered successfully."
      },
      data: true
    });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
