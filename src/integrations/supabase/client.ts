// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzmsxhurhtexieeduqam.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXN4aHVyaHRleGllZWR1cWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwOTIyOTgsImV4cCI6MjA1NDY2ODI5OH0.1K6V6B4nhOqCGDvGPGuMgG-9qajJXUzZW1bE-q0HZrA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);