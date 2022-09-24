import { serve, sleep } from "./deps.ts";
import { sendMessage } from "./messenger.ts";
import * as moodle from "./moodle.ts";

// const CATEGORIES = [
//   "Học kỳ II năm học 2021-2022 (Semester 2 - Academic year 2021-2022)",
//   "Học kỳ I năm học 2021-2022 (Semester 1 - Academic year 2021-2022)",
//   "Hoạt động Sinh viên  (Student Activities)",
// ];

const IntlDate = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh"
});
const IntlList = new Intl.ListFormat("vi-VN");

async function handler(_: Request): Promise<Response> {
  // previous hours
  const timestamp = Math.round(+new Date() / 1000 - 60 * 60);
  let courses = await moodle.getEnrolledCourses("inprogress");
  courses.push(...await moodle.getEnrolledCourses("future"));
  // courses = courses.filter((course) =>
  //   CATEGORIES.includes(course.coursecategory)
  // );
  const checked_courses: number[] = [];
  // console.log(courses.length);

  for (const course of courses) {
    if (checked_courses.includes(course.id)) continue;
    checked_courses.push(course.id);

    console.log("Examining course", course.id);

    const courseid = course.id;
    const instances = await moodle.getUpdatesSince(courseid, timestamp);
    // console.log(JSON.stringify(instances, null, 2));
    for (const instance of instances) {
      console.log("Found instance", instance.id);
      if (instance.contextlevel == "module") {
        const module = await moodle.getCourseModule(instance.id);

        const timestamp = instance.updates.map((detail) =>
          detail.timeupdated
            ? IntlDate.format(new Date(detail.timeupdated * 1000))
            : ""
        );

        const message = `- ${module.name}\n\nModule: ${moodle.getModuleUrl(module)
          }\n\nCourse: ${moodle.getCourseUrl(courseid)}\n\n${IntlList.format(timestamp)
          }`;
        await sendMessage(message);
      } else {
        await sendMessage(`- unknown instance, ${JSON.stringify(instance)}`);
      }
      console.log("Sent message for instance", instance.id);
    }
    await sleep(0.333);
  }
  console.log("Done checking");
  return new Response("hello world");
}

console.log("Listening on http://localhost:8000");

await serve(handler);
