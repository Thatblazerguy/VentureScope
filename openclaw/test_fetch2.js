async function test() {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch("https://api.github.com/search/repositories?q=underwater robotics&per_page=5");
    const json = await res.json();
    console.log("Success Github:", json.total_count);
  } catch (e) {
    console.error("Error Github:", e.message);
  }
}
test();
