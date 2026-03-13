exports.handler = async function(event) {

  try {

    const body = JSON.parse(event.body || "{}");
    const prompt = body.messages?.[0]?.content || "Hello";

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer HF_API_KEY_LU",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    const data = await response.json();

    let text = "AI tidak memberi jawaban.";

    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      text = data[0].generated_text;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          {
            type: "text",
            text: text
          }
        ]
      })
    };

  } catch (err) {

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          {
            type: "text",
            text: "Server error: " + err.message
          }
        ]
      })
    };

  }

};
