const https = require("https");

exports.handler = async function (event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        content:[{type:"text",text:"Method not allowed"}]
      })
    };
  }

  const API_KEY = process.env.GROQ_API_KEY;

  try {

    const body = JSON.parse(event.body || "{}");

    let userMsg = "";

    if (body.messages && body.messages.length) {
      userMsg = body.messages[body.messages.length - 1].content;
    }

    if (!userMsg) userMsg = "beri saran tidur sehat";

    const payload = JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role
