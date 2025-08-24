-- HK Job Pro - Step 6: Create Storage Buckets and Policies
-- Execute this after step 5

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for resumes (private)
CREATE POLICY "Users can upload their own resume" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update their own resume" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete their own resume" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can view their own resume" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for company logos (public)
CREATE POLICY "Anyone can view company logos" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Company owners can upload logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);
CREATE POLICY "Company owners can update logos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);
CREATE POLICY "Company owners can delete logos" ON storage.objects FOR DELETE USING (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);

-- Storage policies for avatars (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);