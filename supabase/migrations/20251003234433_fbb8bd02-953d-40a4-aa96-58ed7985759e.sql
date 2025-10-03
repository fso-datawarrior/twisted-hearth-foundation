-- Add display_name column to potluck_items table
-- This will store the contributor's chosen display name at the time of contribution
ALTER TABLE potluck_items 
ADD COLUMN display_name TEXT;