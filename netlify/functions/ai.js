const https = require("https");

exports.handler = async function(event) {

  const API_KEY = process.env.GEMINI_API_KEY;

  const body = JSON.parse(event.body || "{}");

  const prompt =
    body.messages?.[body.messages.length - 1]?.content ||
    "hello";

  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  });

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const response = await new Promise((resolve) => {

    const req = https.request(options, (res) => {

      let data = "";

      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));

    });

    req.write(payload);
    req.end();

  });

  return {
    statusCode: 200,
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Content-Type":"application/json"
    },
    body: response
  };

};
