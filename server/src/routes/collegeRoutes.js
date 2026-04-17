import { Router } from "express";
import { College } from "../models/College.js";

const router = Router();

const excludedCollegeNames = new Set([
  "SASCMA College",
  "D.R.B. College",
  "C.K. Pithawala College",
]);

router.get("/", async (_req, res) => {
  try {
    const colleges = await College.find({ active: true })
      .sort({ name: 1 })
      .select("name slug -_id");
    const seenNames = new Set();
    const uniqueColleges = [];

    for (const college of colleges) {
      if (excludedCollegeNames.has(college.name)) {
        continue;
      }
      if (!seenNames.has(college.name)) {
        seenNames.add(college.name);
        uniqueColleges.push(college);
      }
    }

    res.json({ success: true, colleges: uniqueColleges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
