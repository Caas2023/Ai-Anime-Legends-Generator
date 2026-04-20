const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://sevnboibounhxwbbgwea.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldm5ib2lib3VuaHh3YmJnd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTQyMjIsImV4cCI6MjA5MjIzMDIyMn0.2HAwGGU5WCK7mC74yIfO5naAJ0AcJ7ezD3P7Elx7lNg');

async function run() {
  console.log("--- BUCKETS ---");
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log(buckets);

  console.log("--- TABLE (Latest 3) ---");
  const { data: feed } = await supabase.from('community_feed').select('*').order('created_at', {ascending:false}).limit(3);
  console.log(JSON.stringify(feed, null, 2));
}

run();
