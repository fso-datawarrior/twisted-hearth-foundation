-- Create function for soft deleting potluck items
-- This bypasses RLS but implements its own authorization
CREATE OR REPLACE FUNCTION public.soft_delete_potluck_item(p_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_user_id UUID;
BEGIN
  -- Get the user_id of the item
  SELECT user_id INTO v_item_user_id
  FROM public.potluck_items
  WHERE id = p_item_id AND deleted_at IS NULL;
  
  -- Check if item exists
  IF v_item_user_id IS NULL THEN
    RAISE EXCEPTION 'Item not found or already deleted';
  END IF;
  
  -- Check authorization: must be owner or admin
  IF auth.uid() != v_item_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized to delete this item';
  END IF;
  
  -- Perform soft delete
  UPDATE public.potluck_items
  SET deleted_at = NOW()
  WHERE id = p_item_id;
END;
$$;