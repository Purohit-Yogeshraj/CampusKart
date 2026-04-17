import { request } from "./api";

export async function fetchColleges() {
  const data = await request("/colleges");
  return data.colleges || [];
}
