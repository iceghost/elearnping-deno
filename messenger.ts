import { urlcat } from "./deps.ts";

const FACEBOOK_TOKEN = Deno.env.get("FACEBOOK_TOKEN");
if (!FACEBOOK_TOKEN) throw new Error("facebook token not found");
const USERID = "7177809602236804";

export async function sendMessage(message: string): Promise<void> {
  const body = {
    recipient: {
      id: USERID,
    },
    message: {
      text: message,
    },
    messaging_type: "MESSAGE_TAG",
    tag: "ACCOUNT_UPDATE",
  };
  await fetch(
    urlcat("https://graph.facebook.com/v12.0/me/messages", {
      access_token: FACEBOOK_TOKEN,
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}
