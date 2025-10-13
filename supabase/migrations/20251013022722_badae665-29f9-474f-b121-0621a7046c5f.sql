-- Enable pg_cron extension for scheduling daily analytics aggregation
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily analytics aggregation to run at 1 AM UTC every day
SELECT cron.schedule(
  'daily-analytics-aggregation',
  '0 1 * * *',
  $$SELECT public.aggregate_daily_stats(CURRENT_DATE::TEXT)$$
);

-- Grant necessary permissions for the cron job
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;