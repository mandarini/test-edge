-- Remove foreign key constraint on todos.user_id for testing purposes
ALTER TABLE public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
