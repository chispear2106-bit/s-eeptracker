exports.handler = async function(event) {

  const body = JSON.parse(event.body || "{}");

  return {
    statusCode:200,
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      content:[
        {
          type:"text",
          text: JSON.stringify(body)
        }
      ]
    })
  }

};
