import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "healthy",
      service: "SanTyper Netlify Serverless API",
      timestamp: new Date().toISOString(),
    }),
  };
};
