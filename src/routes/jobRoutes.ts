// src/routes/jobRoutes.ts
import { Router, Request, Response } from 'express';
import db from '../../db/index';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import redisClient from '../config/redisClient';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// GET /jobs - Fetch open jobs (with caching)
router.get('/', async (req: Request, res: Response) => {
  const cachedJobs = await redisClient.get("openJobs");
  if (cachedJobs) {
    console.log("Returning cached jobs");
    res.json(JSON.parse(cachedJobs));
    return;
  }
  try {
    const connection = await db;
    const openJobs = await connection
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.isOpen, true));
    await redisClient.setEx("openJobs", 60, JSON.stringify(openJobs));
    res.json(openJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /jobs/:id - Fetch a single job by ID
router.get('/:id', async (req: any, res: any) => {
  const jobId = Number(req.params.id);
  try {
    const connection = await db;
    const jobResult = await connection
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.id, jobId))
      .limit(1);
    if (jobResult.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(jobResult[0]);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /jobs/:id/apply - Apply for a job
router.post('/:id/apply', authenticate, async (req: any, res: any) => {
  const jobId = Number(req.params.id);
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ message: "Application reason is required" });
  }
  try {
    const connection = await db;
    const jobResult = await connection
      .select()
      .from(schema.jobs)
      .where(and(eq(schema.jobs.id, jobId), eq(schema.jobs.isOpen, true)))
      .limit(1);
    if (jobResult.length === 0) {
      return res.status(404).json({ message: "Job not found or not open for applications" });
    }
    await connection.insert(schema.applications).values({
      userId: req.user!.id,
      jobId,
      reason,
      status: "applied"
    });
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
