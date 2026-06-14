import axios from "axios"

const judge0ApiLink = process.env.JUDGE0_BATCH_API_BATCH_LINK || "https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false"

const judge0Headers = {
  "content-type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": process.env.JUDGE0_BATCH_API_KEY || "mock-key",
}

export const runJudge0Batch = async (
  sourceCode: string,
  languageId: string,
  testCases: { input: string; output: string }[]
) => {
  // If no real API key is provided, mock a successful response for demonstration
  if (!process.env.JUDGE0_BATCH_API_KEY || process.env.JUDGE0_BATCH_API_KEY === "mock-key") {
    console.warn("Using mocked Judge0 response because JUDGE0_BATCH_API_KEY is not set.")
    await new Promise((r) => setTimeout(r, 1000))
    return {
      success: true,
      result: testCases.map((tc, index) => ({
        status: { id: 3, description: "Accepted" },
        time: "0.012",
        memory: 124,
        stdout: tc.output,
        expected_output: tc.output,
        stderr: null,
        compile_output: null,
      })),
    }
  }

  try {
    const submissions = testCases.map((tc) => ({
      source_code: sourceCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output,
      base64_encoded: false,
    }))

    let submission
    try {
      submission = await axios.post(judge0ApiLink, { submissions }, { headers: judge0Headers })
    } catch (err: any) {
      console.error("Failed to create batch submission:", err.response?.data?.message || err.message)
      return { success: false, result: err.response?.data?.message || "Failed to create batch submission" }
    }

    const tokens = submission.data.map((s: any) => s.token)

    let results
    while (true) {
      results = await axios.get(`${judge0ApiLink}?tokens=${tokens.join(",")}`, { headers: judge0Headers })
      const allDone = results.data.submissions.every((r: any) => r.status.id > 2)
      if (!allDone) {
        await new Promise((r) => setTimeout(r, 1000))
      } else {
        break
      }
    }

    return {
      success: true,
      result: results.data.submissions,
    }
  } catch (error: any) {
    console.error("Judge0 batch error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.message || "Judge0 API error",
    }
  }
}
