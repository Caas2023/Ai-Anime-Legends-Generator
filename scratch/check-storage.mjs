import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStorage() {
  console.log("Checking Supabase Storage...");
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  
  if (bError) {
    console.error("Error listing buckets:", bError.message);
    return;
  }
  
  console.log("Buckets found:", buckets.map(b => b.name).join(", "));
  
  for (const b of buckets) {
      const { data: files, error: fError } = await supabase.storage.from(b.name).list('', { limit: 5 });
      if (fError) {
          console.error(`Bucket ${b.name} is likely private or inaccessible:`, fError.message);
      } else {
          console.log(`Bucket ${b.name} has ${files.length} files (first 5 shown).`);
      }
  }
}

checkStorage();
