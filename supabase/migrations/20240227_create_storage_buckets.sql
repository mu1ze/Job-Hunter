-- Create storage buckets (adjusted for Supabase storage v2)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
    ('resumes', 'resumes', true, 5242880),
    ('user-content', 'user-content', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes
DROP POLICY IF EXISTS "Public access to resumes" ON storage.objects;
CREATE POLICY "Public access to resumes"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'resumes' );

DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
CREATE POLICY "Users can upload resumes"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

DROP POLICY IF EXISTS "Users can delete their resumes" ON storage.objects;
CREATE POLICY "Users can delete their resumes"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Storage policies for user-content (avatars)
DROP POLICY IF EXISTS "Public access to user-content" ON storage.objects;
CREATE POLICY "Public access to user-content"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'user-content' );

DROP POLICY IF EXISTS "Users can upload user-content" ON storage.objects;
CREATE POLICY "Users can upload user-content"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1] );

DROP POLICY IF EXISTS "Users can delete their user-content" ON storage.objects;
CREATE POLICY "Users can delete their user-content"
    ON storage.objects FOR DELETE
    USING ( bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1] );
