const url3 = "https://curly-hill-3303.aegonat29.workers.dev/v1/chat/completions";

async function test(url) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: "hi" }]
      })
    });
    console.log(url, res.status, await res.text().then(t => t.slice(0, 100)));
  } catch (e) {
    console.log(url, "Error:", e.message);
  }
}

test(url3);
