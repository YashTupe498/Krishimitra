const url = "https://akncanaoamjgkjjlxfzn.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbmNhbmFvYW1qZ2tqamx4ZnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTY1NjYsImV4cCI6MjEwMzQ5MjU2Nn0.z08OZgpyDZULTvFWwFptasgOveHZm73ZBNTMkl-ZGQQ";

async function fetchSupabase() {
  const lotsRes = await fetch(`${url}/rest/v1/lots?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const lots = await lotsRes.json();
  console.log("LOTS RAW:", JSON.stringify(lots, null, 2));

  const reqsRes = await fetch(`${url}/rest/v1/buyer_demands?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const reqs = await reqsRes.json();
  console.log("REQS RAW:", JSON.stringify(reqs, null, 2));
}

fetchSupabase();
