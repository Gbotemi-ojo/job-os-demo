// src/routes/applicationRoutes.ts
import { Router, Response } from 'express';
import db from '../../db/index';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// GET /applications - List applications for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await db;
    const apps = await connection
      .select({
        applicationId: schema.applications.id,
        reason: schema.applications.reason,
        status: schema.applications.status,
        applied_at: schema.applications.applied_at,
        jobId: schema.jobs.id,
        title: schema.jobs.title,
        description: schema.jobs.description,
        isOpen: schema.jobs.isOpen
      })
      .from(schema.applications)
      .innerJoin(schema.jobs, eq(schema.jobs.id, schema.applications.jobId))
      .where(eq(schema.applications.userId, req.user!.id));
    res.json(apps);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
