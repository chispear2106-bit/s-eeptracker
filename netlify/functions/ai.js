const https = require("https");

exports.handler = async function(event) {

  const API_KEY = process.env.HF_API_KEY;

  const body = JSON.parse(event.body || "{}");

  const userMsg =
    body.messages?.slice(-1)[0]?.content ||
    "beri saran tidur";

  const payload = JSON.stringify({
    inputs: userMsg,
    parameters: {
      max_new_tokens: 120
    }
  });

  const options = {
    hostname: "api-inference.huggingface.co",
    path: "/models/mistralai/Mistral-7B-Instruct-v0.2",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
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

  const json = JSON.parse(response);

  const text =
    json?.[0]?.generated_text ||
    "AI tidak memberi jawaban.";

  return {
    statusCode: 200,
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      content:[{type:"text",text}]
    })
  };

};
