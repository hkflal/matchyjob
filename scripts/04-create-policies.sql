-- HK Job Pro - Step 4: Row Level Security Policies
-- Execute this after step 3

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view verified companies" ON companies FOR SELECT USING (verified = true);
CREATE POLICY "Employers can view their companies" ON companies FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Employers can create companies" ON companies FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('employer', 'admin'))
);
CREATE POLICY "Employers can update their companies" ON companies FOR UPDATE USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Employers can view their jobs" ON jobs FOR SELECT USING (
  auth.uid() = posted_by OR
  EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Employers can create jobs" ON jobs FOR INSERT WITH CHECK (
  auth.uid() = posted_by AND
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.owner_id = auth.uid()) AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('employer', 'admin'))
);
CREATE POLICY "Employers can update their jobs" ON jobs FOR UPDATE USING (
  auth.uid() = posted_by OR
  EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Applications policies
CREATE POLICY "Applicants can view their applications" ON applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Employers can view applications to their jobs" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = applications.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Job seekers can create applications" ON applications FOR INSERT WITH CHECK (
  auth.uid() = applicant_id AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('job_seeker', 'admin'))
);
CREATE POLICY "Applicants can update their applications" ON applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Employers can update application status" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = applications.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Saved jobs policies
CREATE POLICY "Users can view their saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Job views policies
CREATE POLICY "Anyone can create job views" ON job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own views" ON job_views FOR SELECT USING (auth.uid() = viewer_id);
CREATE POLICY "Employers can view their job views" ON job_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_views.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = job_views.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);