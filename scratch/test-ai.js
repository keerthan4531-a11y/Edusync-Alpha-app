const { parseWorkerResponse, tryWorker, esChat } = require('../src/lib/es-engine');

async function runTest() {
  console.log("Testing esChat function...");
  try {
    const response = await esChat([
      { role: "system", content: "You are an English teacher." },
      { role: "user", content: "i is chennai - correct this sentence" }
    ]);
    console.log("SUCCESS! esChat returned:");
    console.log(response);
  } catch (err) {
    console.error("FAILED esChat:", err);
  }
}

runTest();
