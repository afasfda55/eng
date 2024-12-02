-- Set up initial admin user
DO $$
BEGIN
  -- Check if the user exists first
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'your-admin-email@example.com'
  ) THEN
    -- Update the user to be an admin
    UPDATE auth.users 
    SET is_admin = true 
    WHERE email = 'your-admin-email@example.com';
  END IF;
END
$$; 