-- Custom SQL migration file, put you code below! --
-- Enable Row-Level Security (RLS) on the users_table
ALTER TABLE users_table ENABLE ROW LEVEL SECURITY;

-- Create an RLS policy to allow users to read only their own records
CREATE POLICY "Allow user to read own record"
ON users_table
FOR SELECT
USING (auth_data->>'id' = current_setting('request.jwt.claims.user_id'));