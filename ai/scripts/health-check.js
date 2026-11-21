const { healthCheck } = require("../src/client/geminiClient");
healthCheck().then((r) => console.log(r));