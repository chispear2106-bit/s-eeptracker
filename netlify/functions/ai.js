const https = require("https");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  const body = JSON.parse(event.body);
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
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          const text =
            json.candidates?.[0]?.content?.parts?.[0]?.text ||
            "AI tidak memberi jawaban.";

          resolve({
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              content: [{ type: "text", text }]
            })
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: data })
          });
        }
      });
    });

    req.on("error", (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      });
    });

    req.write(postData);
    req.end();
  });
};
