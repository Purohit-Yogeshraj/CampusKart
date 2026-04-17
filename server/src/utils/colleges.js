import { College } from "../models/College.js";

const defaultColleges = [
  "C. K. Pithawala College of Engineering and Technology",
  "D. R. Patel and R. B. Patel Commerce College",
  "SDJ INTERNATIONAL COLLEGE",
  "SASCMA English Medium Commerce College",
  "Sir K. P. College of Commerce",
  "Udhna Citizen Commerce College",
];

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureDefaultColleges() {
  for (const name of defaultColleges) {
    await College.updateOne(
      { name },
      {
        $setOnInsert: {
          name,
          slug: toSlug(name),
          active: true,
        },
      },
      { upsert: true },
    );
  }
}

export async function getActiveCollegeNames() {
  const colleges = await College.find({ active: true })
    .sort({ name: 1 })
    .select("name -_id");
  return colleges.map((college) => college.name);
}

export async function isAllowedCollege(name) {
  if (!name) {
    return false;
  }

  const college = await College.findOne({
    name: name.trim(),
    active: true,
  }).select("_id");
  return Boolean(college);
}

export function normalizeCollegeName(name) {
  return String(name || "").trim();
}

export function createCollegeSlug(name) {
  return toSlug(name);
}
