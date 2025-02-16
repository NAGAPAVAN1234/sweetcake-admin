
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Get publishable key function started");

serve(async (req) => {
  console.log("Received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
    console.log("Retrieved publishable key:", publishableKey ? "Key found" : "Key not found");

    if (!publishableKey) {
      throw new Error("STRIPE_PUBLISHABLE_KEY not found in environment variables");
    }

    return new Response(
      JSON.stringify({
        secrets: {
          STRIPE_PUBLISHABLE_KEY: publishableKey,
        },
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-publishable-key:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    );
  }
});
