import { urlcat } from "./deps.ts";

const MOODLE_TOKEN = Deno.env.get("MOODLE_TOKEN");
if (!MOODLE_TOKEN) throw new Error("moodle token not found");

const BASE_URL = "http://e-learning.hcmut.edu.vn";
const API_PATH = "/webservice/rest/server.php";
const DEFAULT_ARGS = {
  moodlewsrestformat: "json",
  wstoken: MOODLE_TOKEN,
} as const;

async function callFunction<T>(
  wsfunction: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(urlcat(BASE_URL, API_PATH, {
    ...DEFAULT_ARGS,
    wsfunction,
    ...args,
  }));
  const json = await res.json();
  return json;
}

export async function getEnrolledCourses(
  classification: string,
): Promise<Course[]> {
  const res = await callFunction<{ courses: Course[] }>(
    "core_course_get_enrolled_courses_by_timeline_classification",
    {
      classification,
    },
  );
  return res.courses;
}

export async function getCourseModule(
  cmid: number,
): Promise<Module> {
  const res = await callFunction<{ cm: Module }>(
    "core_course_get_course_module",
    { cmid },
  );
  return res.cm;
}

export async function getUpdatesSince(
  courseid: number,
  since: number,
): Promise<UpdateInstance[]> {
  const res = await callFunction<UpdateResponse>(
    "core_course_get_updates_since",
    { courseid, since },
  );
  return res.instances;
}

interface UpdateResponse {
  instances: UpdateInstance[];
  warnings: UpdateWarning[];
}

interface UpdateWarning {
  item: string;
  itemid: number;
  warningcode: string;
  message: string;
}

interface UpdateInstance {
  contextlevel: string;
  id: number;
  updates: UpdateDetail[];
}

interface UpdateDetail {
  name: string;
  timeupdated: number;
}

interface Module {
  id: number;
  name: string;
  modname: string;
}

export function getModuleUrl(module: Module): string {
  return urlcat(BASE_URL, "/mod/:modname/view.php", {
    id: module.id,
    modname: module.modname,
  });
}

export function getCourseUrl(courseid: number): string {
  return urlcat(BASE_URL, "/course/view.php", {
    id: courseid,
  });
}

interface Course {
  id: number;
  fullname: string;
  coursecategory: string;
}
