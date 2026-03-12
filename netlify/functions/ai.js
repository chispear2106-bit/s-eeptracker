const https = require("https");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  const body = JSON.parse(event.body || "{}");
  const userMsg = body.messages?.[body.messages.length - 1]?.content || "Hello";

  const postData = JSON.stringify({
    contents: [
      {
        parts: [{ text: userMsg }]
      }
    ]
  });

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
