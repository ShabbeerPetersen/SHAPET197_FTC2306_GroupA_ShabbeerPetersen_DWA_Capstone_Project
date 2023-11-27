import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://myknotsmpelltdofcrpi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a25vdHNtcGVsbHRkb2ZjcnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA1OTQzMjAsImV4cCI6MjAxNjE3MDMyMH0.gx1Sfs0JM9IRHNMCrDSFsM71LP3IZs_HiGX69wWBAg0";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
