import { serve } from "https://deno.land/std@0.120.0/http/server.ts";
import urlcat from 'https://deno.land/x/urlcat@v2.0.4/src/index.ts';
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const MOODLE_TOKEN = Deno.env.get("MOODLE_TOKEN");
const FACEBOOK_TOKEN = Deno.env.get("FACEBOOK_TOKEN");
if (!FACEBOOK_TOKEN || !MOODLE_TOKEN) throw new Error("token not found");

const BASE_URL = "http://e-learning.hcmut.edu.vn";
const API_PATH = "/webservice/rest/server.php";
const DEFAULT_ARGS = {
  moodlewsrestformat: "json",
  wstoken: MOODLE_TOKEN,
} as const;


const USERID = "7177809602236804";

const COURSEIDS = [
  115347,
  115338,
  113383,
  111266,
  115353,
  111305,
  116485,
  116483,
  113405,
  111319,
  116488,
  115364,
  113411,
  111323,
  116960,
  116943,
  112546,
  112506
]

async function handler(req: Request): Promise<Response> {
  if (req.url.endsWith("hola")) return other_handler(req);

  const timestamp = Math.round(+new Date() / 1000 - 60 * 60);
  let res = await Promise.allSettled(COURSEIDS.map(courseid =>
    fetch(urlcat(BASE_URL, API_PATH, {
      ...DEFAULT_ARGS,
      wsfunction: "core_course_get_updates_since",
      courseid,
      since: timestamp
    })).then(res => res.json()).then(json => ({ ...json, courseid }))
  ))
  res = res.flatMap(json => {
    if (json.status == "rejected") return undefined;
    let instances = json.value.instances;
    if (instances.length != 0) {
      instances.push(json.value.courseid);
    }
    return instances;
  });
  if (res.length != 0) {
    const body = {
      recipient: {
        id: USERID,
      },
      message: {
        text: JSON.stringify(res)
      }
    }
    return await fetch(urlcat("https://graph.facebook.com/v12.0/me/messages", {
      access_token: FACEBOOK_TOKEN,
    }), {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify(body),
    });
  }
  return new Response("all is well");
}

async function other_handler(req: Request): Promise<Response> {
  return fetch(urlcat(BASE_URL, API_PATH, {
    ...DEFAULT_ARGS,
    wsfunction: "get_courses_by_field",
    id: 116485,
  }))
}

console.log("Listening on http://localhost:8000");

await serve(handler);
