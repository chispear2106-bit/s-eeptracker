exports.handler = async function () {

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
          text: "AI TEST BERHASIL"
        }
      ]
    })
  };

};
