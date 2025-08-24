#!/usr/bin/env node

/**
 * HK Job Pro - Development Data Seeder
 * Creates sample companies, jobs, and test users for development/testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🌱 HK Job Pro - Development Data Seeder');
console.log('='.repeat(50));

// Sample companies data
const sampleCompanies = [
  {
    name: 'TechCorp Hong Kong',
    description: 'Leading technology company specializing in fintech solutions and digital transformation. We build innovative products that serve millions of users across Asia.',
    website: 'https://techcorp.hk',
    industry: 'Technology',
    size: '500-1000',
    location: 'Central, Hong Kong',
    founded_year: 2010,
    verified: true
  },
  {
    name: 'Global Finance Ltd',
    description: 'International financial services and investment banking firm providing comprehensive wealth management and corporate finance solutions.',
    website: 'https://globalfinance.com',
    industry: 'Finance',
    size: '1000+',
    location: 'Admiralty, Hong Kong',
    founded_year: 2005,
    verified: true
  },
  {
    name: 'Creative Agency HK',
    description: 'Award-winning digital marketing and creative solutions agency helping brands tell their stories through compelling design and strategy.',
    website: 'https://creative-hk.com',
    industry: 'Marketing',
    size: '50-100',
    location: 'Sheung Wan, Hong Kong',
    founded_year: 2015,
    verified: false
  },
  {
    name: 'Healthcare Innovations',
    description: 'Medical technology company developing cutting-edge healthcare solutions and telemedicine platforms for better patient outcomes.',
    website: 'https://healthtech.hk',
    industry: 'Healthcare',
    size: '200-500',
    location: 'Tsim Sha Tsui, Hong Kong',
    founded_year: 2012,
    verified: true
  },
  {
    name: 'Green Energy Solutions',
    description: 'Sustainable energy company focused on renewable energy projects and environmental consulting services throughout Hong Kong.',
    website: 'https://greenenergy.hk',
    industry: 'Energy',
    size: '100-200',
    location: 'Wan Chai, Hong Kong',
    founded_year: 2018,
    verified: true
  }
];

// Sample jobs data (will be linked to companies after creation)
const sampleJobs = [
  // TechCorp Hong Kong jobs
  {
    title: 'Senior Full Stack Developer',
    description: 'Join our engineering team to build scalable web applications using React, Node.js, and cloud technologies. You will work on products used by millions of users across Asia.',
    requirements: ['5+ years experience with React/Node.js', 'Experience with AWS/GCP', 'Strong problem-solving skills', 'Bachelor degree in Computer Science'],
    responsibilities: ['Develop and maintain web applications', 'Collaborate with product and design teams', 'Mentor junior developers', 'Participate in architectural decisions'],
    benefits: ['Competitive salary package', 'Health insurance', 'Flexible working hours', 'Professional development budget', '20 days annual leave'],
    location: 'Central, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 60000,
    salary_max: 90000,
    salary_currency: 'HKD',
    status: 'active'
  },
  {
    title: 'Product Manager',
    description: 'Lead product development initiatives and drive product strategy for our fintech products. Work closely with engineering, design, and business teams.',
    requirements: ['3+ years product management experience', 'Experience with fintech products', 'Strong analytical skills', 'MBA preferred'],
    responsibilities: ['Define product roadmap and strategy', 'Work with cross-functional teams', 'Analyze market trends and user feedback', 'Drive product launches'],
    benefits: ['Competitive salary package', 'Stock options', 'Health insurance', 'Flexible working arrangements'],
    location: 'Central, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 50000,
    salary_max: 75000,
    status: 'active'
  },
  {
    title: 'DevOps Engineer',
    description: 'Build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems. Help scale our platform to serve millions of users.',
    requirements: ['3+ years DevOps experience', 'Experience with Kubernetes, Docker', 'AWS/GCP certification preferred', 'Strong scripting skills'],
    responsibilities: ['Manage cloud infrastructure', 'Build CI/CD pipelines', 'Monitor system performance', 'Implement security best practices'],
    benefits: ['Competitive salary', 'Remote work options', 'Professional development', 'Health insurance'],
    location: 'Central, Hong Kong',
    remote_type: 'remote',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 45000,
    salary_max: 70000,
    status: 'active'
  },
  
  // Global Finance Ltd jobs
  {
    title: 'Investment Analyst',
    description: 'Analyze investment opportunities and market trends to support portfolio management decisions. Work with senior analysts on equity research.',
    requirements: ['Bachelor in Finance/Economics', '2+ years investment analysis experience', 'CFA Level 1 preferred', 'Strong Excel and modeling skills'],
    responsibilities: ['Conduct financial analysis and modeling', 'Prepare investment reports', 'Monitor market trends', 'Support senior analysts'],
    benefits: ['Competitive compensation', 'Performance bonus', 'Health insurance', 'CFA study support'],
    location: 'Admiralty, Hong Kong',
    remote_type: 'onsite',
    job_type: 'full_time',
    experience_level: 'entry',
    salary_min: 35000,
    salary_max: 50000,
    status: 'active'
  },
  {
    title: 'Risk Management Specialist',
    description: 'Assess and manage financial risks across our investment portfolios. Develop risk models and monitoring systems.',
    requirements: ['Master in Finance/Risk Management', '4+ years risk management experience', 'FRM certification preferred', 'Strong quantitative skills'],
    responsibilities: ['Develop risk assessment models', 'Monitor portfolio risk metrics', 'Prepare risk reports', 'Work with compliance team'],
    benefits: ['Excellent salary package', 'Annual bonus', 'Professional development', 'Health benefits'],
    location: 'Admiralty, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 65000,
    salary_max: 95000,
    status: 'active'
  },
  
  // Creative Agency HK jobs
  {
    title: 'UX/UI Designer',
    description: 'Design beautiful and intuitive user experiences for our clients\' digital products. Work on projects for leading brands in Hong Kong.',
    requirements: ['3+ years UX/UI design experience', 'Proficiency in Figma, Adobe Creative Suite', 'Strong portfolio', 'Understanding of design systems'],
    responsibilities: ['Create user-centered designs', 'Conduct user research', 'Collaborate with development teams', 'Present designs to clients'],
    benefits: ['Creative work environment', 'Flexible hours', 'Health insurance', 'Design conference budget'],
    location: 'Sheung Wan, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 35000,
    salary_max: 55000,
    status: 'active'
  },
  {
    title: 'Digital Marketing Specialist',
    description: 'Execute digital marketing campaigns across social media, search, and display advertising. Help clients grow their online presence.',
    requirements: ['2+ years digital marketing experience', 'Google Ads and Facebook Ads certified', 'Experience with analytics tools', 'Creative mindset'],
    responsibilities: ['Manage digital advertising campaigns', 'Analyze campaign performance', 'Create marketing content', 'Report to clients'],
    benefits: ['Dynamic work environment', 'Performance bonus', 'Training opportunities', 'Health coverage'],
    location: 'Sheung Wan, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'entry',
    salary_min: 25000,
    salary_max: 40000,
    status: 'active'
  },
  
  // Healthcare Innovations jobs
  {
    title: 'Software Engineer - Healthcare',
    description: 'Develop healthcare software solutions and telemedicine platforms. Work on products that directly impact patient care and health outcomes.',
    requirements: ['3+ years software development experience', 'Experience with healthcare/medical software', 'Knowledge of HIPAA compliance', 'Strong testing practices'],
    responsibilities: ['Develop healthcare software applications', 'Ensure compliance with medical regulations', 'Collaborate with medical professionals', 'Maintain high code quality'],
    benefits: ['Meaningful work in healthcare', 'Competitive salary', 'Health insurance', 'Professional development'],
    location: 'Tsim Sha Tsui, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: 50000,
    salary_max: 75000,
    status: 'active'
  },
  {
    title: 'Data Scientist - Medical Research',
    description: 'Apply machine learning and data analysis to medical research projects. Help develop AI-powered diagnostic tools and patient outcome prediction models.',
    requirements: ['PhD in Data Science/Statistics/Computer Science', 'Experience with medical data', 'Python, R, TensorFlow/PyTorch', 'Publication record preferred'],
    responsibilities: ['Analyze medical datasets', 'Develop ML models for healthcare', 'Collaborate with medical researchers', 'Present findings to stakeholders'],
    benefits: ['Research-focused environment', 'Conference funding', 'Publications support', 'Excellent compensation'],
    location: 'Tsim Sha Tsui, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 70000,
    salary_max: 100000,
    status: 'active'
  },
  
  // Green Energy Solutions jobs
  {
    title: 'Renewable Energy Project Manager',
    description: 'Lead renewable energy projects from planning to implementation. Work on solar, wind, and other sustainable energy initiatives in Hong Kong.',
    requirements: ['5+ years project management experience', 'Experience in renewable energy sector', 'PMP certification preferred', 'Engineering background'],
    responsibilities: ['Manage renewable energy projects', 'Coordinate with stakeholders', 'Ensure project timelines and budgets', 'Report to senior management'],
    benefits: ['Work on meaningful environmental projects', 'Competitive package', 'Professional development', 'Health benefits'],
    location: 'Wan Chai, Hong Kong',
    remote_type: 'hybrid',
    job_type: 'full_time',
    experience_level: 'senior',
    salary_min: 55000,
    salary_max: 80000,
    status: 'active'
  }
];

async function seedData() {
  try {
    console.log('🏢 Creating sample companies...');
    
    // Create companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .insert(sampleCompanies)
      .select();

    if (companiesError) {
      console.error('❌ Error creating companies:', companiesError.message);
      return;
    }

    console.log(`✅ Created ${companies.length} companies`);

    console.log('\n💼 Creating sample jobs...');
    
    // Create jobs linked to companies
    const jobsToInsert = sampleJobs.map((job, index) => ({
      ...job,
      company_id: companies[Math.floor(index / 2)].id, // Distribute jobs across companies
      posted_by: companies[Math.floor(index / 2)].owner_id
    }));

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .insert(jobsToInsert)
      .select();

    if (jobsError) {
      console.error('❌ Error creating jobs:', jobsError.message);
      return;
    }

    console.log(`✅ Created ${jobs.length} jobs`);

    console.log('\n📊 Development data seeding complete!');
    console.log('='.repeat(50));
    console.log('Sample data created:');
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Jobs: ${jobs.length}`);
    console.log('\n🚀 You can now test the application with sample data!');
    console.log('Run: npm run dev');

  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
  }
}

// Check if database is ready before seeding
async function checkDatabase() {
  console.log('🔍 Checking database readiness...');
  
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database not ready:', error.message);
      console.log('\n💡 Please execute the database setup first:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Execute: scripts/complete-setup.sql');
      console.log('3. Run: npm run db:verify');
      console.log('4. Then run this seeding script again');
      return false;
    }
    
    console.log('✅ Database is ready for seeding');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
}

// Main execution
async function main() {
  const isReady = await checkDatabase();
  if (isReady) {
    await seedData();
  }
}

main();