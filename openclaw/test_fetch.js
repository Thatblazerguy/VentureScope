async function test() {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch("http://export.arxiv.org/api/query?search_query=underwater robotics&start=0&max_results=10");
    console.log("Success:", await res.text().then(t => t.slice(0, 100)));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
