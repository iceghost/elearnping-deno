import { serve, sleep } from "./deps.ts";
import { sendMessage } from "./messenger.ts";
import * as moodle from "./moodle.ts";

const FACEBOOK_TOKEN = Deno.env.get("FACEBOOK_TOKEN");
if (!FACEBOOK_TOKEN) throw new Error("facebook token not found");

const CATEGORIES = [
  "Học kỳ II năm học 2021-2022 (Semester 2 - Academic year 2021-2022)",
  "Học kỳ I năm học 2021-2022 (Semester 1 - Academic year 2021-2022)",
  "Hoạt động Sinh viên  (Student Activities)",
];

async function handler(_: Request): Promise<Response> {
  // previous hours FIXME:
  const timestamp = Math.round(+new Date() / 1000 - 60 * 60);
  let courses = await moodle.getEnrolledCourses("inprogress");
  courses.push(...await moodle.getEnrolledCourses("future"));
  courses = courses.filter((course) => CATEGORIES.includes(course.coursecategory));
  console.log(courses.length);
  for (const course of courses) {
    const courseid = course.id;
    const instances = await moodle.getUpdatesSince(courseid, timestamp);
    for (const instance of instances) {
      if (instance.contextlevel == "module") {
        const module = await moodle.getCourseModule(instance.id);
        const message = `- ${module.name} at ${moodle.getModuleUrl(module)
          } from ${moodle.getCourseUrl(courseid)}`;
        await sendMessage(message);
      } else {
        await sendMessage(`- unknown instance, ${JSON.stringify(instance)}`);
      }
    }
    sleep(1);
  }

  return new Response("hello world");
}

console.log("Listening on http://localhost:8000");

await serve(handler);
