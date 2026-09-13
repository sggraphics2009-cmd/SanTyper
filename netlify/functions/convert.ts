import type { Handler, HandlerEvent } from "@netlify/functions";
import { unicodeToDlManel, dlManelToUnicode } from "../../src/lib/converterLogic";

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  let text = "";
  let mode = "unicode-to-legacy";
  let format = "json";
  let profile: "DL_SERIES" | "FM_SERIES" = "DL_SERIES";

  if (event.httpMethod === "POST" && event.body) {
    try {
      const parsed = JSON.parse(event.body);
      text = parsed.text || "";
      mode = parsed.mode || mode;
      format = parsed.format || format;
      if (parsed.profile === "FM_SERIES" || (parsed.font && parsed.font.toLowerCase().includes("fm"))) {
        profile = "FM_SERIES";
      }
    } catch {
      text = event.body;
    }
  }

  const q = event.queryStringParameters || {};
  if (!text && q.text) text = q.text;
  if (q.mode) mode = q.mode;
  if (q.format) format = q.format;
  if (q.profile === "FM_SERIES" || (q.font && q.font.toLowerCase().includes("fm"))) {
    profile = "FM_SERIES";
  }

  if (!text) {
    if (format === "plain") {
      return { statusCode: 400, headers, body: "Error: Text parameter is required." };
    }
    return {
      statusCode: 400,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Text parameter is required." }),
    };
  }

  try {
    let converted = "";
    if (mode === "unicode-to-legacy") {
      converted = unicodeToDlManel(text, [], profile);
    } else {
      converted = dlManelToUnicode(text, [], profile);
    }

    if (format === "plain") {
      return {
        statusCode: 200,
        headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
        body: converted,
      };
    }

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ converted, mode, profile }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Conversion failed" }),
    };
  }
};
