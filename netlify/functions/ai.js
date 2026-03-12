const https = require("https");

exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }

  const body = JSON.parse(event.body);

  const systemText = body.system || "";
  const userMsg = body.messages?.[body.messages.length - 1]?.content || "";

  const prompt = systemText ? `${systemText}\n\n${userMsg}` : userMsg;

  const postData = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  });

  return new Promise((resolve) => {

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {

        try {

          const parsed = JSON.parse(data);

          let text = "AI tidak memberi jawaban.";

          if (parsed.candidates &&
              parsed.candidates[0] &&
              parsed.candidates[0].content &&
              parsed.candidates[0].content.parts &&
              parsed.candidates[0].content.parts[0] &&
              parsed.candidates[0].content.parts[0].text) {

            text = parsed.candidates[0].content.parts[0].text;

          }

          resolve({
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
              content: [{ text }]
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

    req.on("error", (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });

    req.write(postData);
    req.end();

  });

};
