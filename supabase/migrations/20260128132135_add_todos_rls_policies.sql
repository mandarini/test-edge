-- Enable RLS on todos table
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Allow all operations on todos for testing purposes
CREATE POLICY "Allow all operations on todos"
ON public.todos
FOR ALL
TO public
USING (true)
WITH CHECK (true);
