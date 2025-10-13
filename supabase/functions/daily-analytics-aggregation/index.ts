import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get date to aggregate (default to yesterday)
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const targetDate = dateParam || new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    console.log(`Starting daily aggregation for ${targetDate}`);

    // Call the aggregate_daily_stats function
    const { data, error } = await supabase.rpc('aggregate_daily_stats', {
      p_date: targetDate
    });

    if (error) {
      console.error('Aggregation error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Successfully aggregated data for ${targetDate}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: targetDate,
        message: 'Daily aggregation completed successfully'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
