-- Create the test-uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'test-uploads',
  'test-uploads',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default

-- Policy to allow anyone to upload files to test-uploads bucket
CREATE POLICY "Allow public uploads to test-uploads bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'test-uploads');

-- Policy to allow anyone to read files from test-uploads bucket (since it's public)
CREATE POLICY "Allow public reads from test-uploads bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'test-uploads');

-- Policy to allow anyone to update files in test-uploads bucket
CREATE POLICY "Allow public updates to test-uploads bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'test-uploads')
WITH CHECK (bucket_id = 'test-uploads');

-- Policy to allow anyone to delete files from test-uploads bucket
CREATE POLICY "Allow public deletes from test-uploads bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'test-uploads');
