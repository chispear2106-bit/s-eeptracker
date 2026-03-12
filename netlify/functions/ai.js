const https = require("https");

exports.handler = async function (event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key tidak ditemukan di Netlify ENV" })
    };
  }

  const body = JSON.parse(event.body || "{}");

  const userMsg =
    body.messages?.[body.messages.length - 1]?.content ||
    "Hello";

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
      "Content-Type": "application/json"
    }
  };

  return new Promise((resolve) => {

    const req = https.request(options, (res) => {

      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {

        try {

          const json = JSON.parse(data);

          if (json.error) {
            return resolve({
              statusCode: 500,
              body: JSON.stringify(json.error)
            });
          }

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
              content: [
                { type: "text", text }
              ]
            })
          });

        } catch (err) {

          resolve({
            statusCode: 500,
            body: data
          });

        }

      });

    });

    req.on("error", err => {
      resolve({
        statusCode: 500,
        body: err.message
      });
    });

    req.write(postData);
    req.end();

  });

};
