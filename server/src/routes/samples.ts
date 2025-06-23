import { Router, Request, Response } from "express";
import sampleMap from "../data/sampleMap";

const router = Router();

router.get("/samples", (_req: Request, res: Response) => {
  res.json(sampleMap);
});

export default router;