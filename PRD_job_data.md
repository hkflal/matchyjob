# Product Requirements Document (PRD)
# HK Job Pro - Job Data Aggregation System

## 1. Executive Summary

### Product Vision
An intelligent job data aggregation system that automatically collects, processes, and manages job listings from multiple Hong Kong job boards. This system ensures HK Job Pro has fresh, relevant content from launch day, solving the cold-start problem while maintaining data quality and compliance.

### Key Objectives
- Automate collection of job listings from major HK job boards
- Ensure data quality through cleaning and deduplication
- Provide comprehensive monitoring and management dashboard
- Scale efficiently to support additional data sources
- Maintain legal compliance and ethical scraping practices

### Success Criteria
- 95%+ data accuracy rate
- < 5% duplicate rate
- 99% uptime for scheduled tasks
- < 24-hour data freshness
- Support for 5+ job boards within 3 months

## 2. System Overview

### 2.1 Problem Statement
New job platforms face the "chicken and egg" problem - job seekers won't use a platform without jobs, and employers won't post without traffic. Manual data entry is time-consuming and doesn't scale.

### 2.2 Solution Architecture
A modular, scalable scraping infrastructure that:
- Runs autonomous nightly scraping jobs
- Processes data through cleaning pipelines
- Stores normalized data in Supabase
- Provides real-time monitoring dashboard
- Supports plugin-based site adapters

### 2.3 Target Data Sources

#### Initial Sources
1. **ECJobsOnline** (ecjobsonline.com)
   - Volume: ~5,000 active jobs
   - Update frequency: Daily
   - Structure: Traditional HTML
   
2. **CTgoodjobs** (ctgoodjobs.hk)
   - Volume: ~10,000 active jobs
   - Update frequency: Real-time
   - Structure: SPA with API calls

#### Future Sources (Phase 2)
- JobsDB.com
- Indeed.hk
- LinkedIn Jobs (Hong Kong)
- Glassdoor HK
- Government job portal

## 3. Functional Requirements

### 3.1 Data Collection Module

#### Scraper Core Engine
```typescript
interface ScraperEngine {
  // Plugin-based architecture for site adapters
  adapters: Map<string, SiteAdapter>;
  
  // Orchestration
  runAll(): Promise<ScrapingResult[]>;
  runSingle(siteId: string): Promise<ScrapingResult>;
  
  // Scheduling
  scheduleNightly(): void;
  pauseSchedule(): void;
  triggerManual(siteId?: string): Promise<void>;
}
```

#### Site Adapter Interface
```typescript
interface SiteAdapter {
  siteId: string;
  siteName: string;
  baseUrl: string;
  
  // Core methods
  initialize(): Promise<void>;
  scrapeListings(): Promise<RawJobListing[]>;
  scrapeDetails(listingUrl: string): Promise<JobDetails>;
  
  // Configuration
  rateLimit: RateLimitConfig;
  retryStrategy: RetryConfig;
  headers: HeaderConfig;
}
```

#### Data Extraction Features
- **Intelligent Parsing**
  - CSS selectors with fallbacks
  - XPath queries for complex structures
  - JSON-LD structured data extraction
  - Meta tag parsing

- **Anti-Detection Measures**
  - User-Agent rotation
  - Request throttling (2-5 seconds between requests)
  - Proxy support (optional)
  - Cookie management
  - Browser fingerprint randomization

- **Error Handling**
  - Automatic retry with exponential backoff
  - Partial failure recovery
  - Dead link detection
  - Schema change alerts

### 3.2 Data Processing Pipeline

#### Data Flow
```
Raw Data → Validation → Cleaning → Enrichment → Deduplication → Storage
```

#### Validation Rules
```typescript
interface ValidationRules {
  required: ['title', 'company', 'location'];
  formats: {
    email: RegExp;
    phone: RegExp;
    salary: RegExp;
  };
  ranges: {
    salary: { min: 0, max: 1000000 };
    postDate: { min: Date, max: Date };
  };
}
```

#### Data Cleaning Operations
1. **Text Normalization**
   - Remove HTML tags
   - Fix encoding issues
   - Standardize whitespace
   - Convert traditional/simplified Chinese

2. **Field Standardization**
   - Location normalization (區 → District mapping)
   - Salary range parsing
   - Date format standardization
   - Job type categorization

3. **Content Enhancement**
   - Auto-categorization by industry
   - Skill extraction from descriptions
   - Experience level detection
   - Remote work classification

#### Deduplication Strategy
```typescript
interface DeduplicationStrategy {
  // Primary matching
  exactMatch: {
    fields: ['external_id', 'source_url'];
    weight: 1.0;
  };
  
  // Fuzzy matching
  similarityMatch: {
    fields: ['title', 'company', 'location'];
    threshold: 0.85;
    algorithm: 'levenshtein' | 'jaccard';
  };
  
  // Content hashing
  contentHash: {
    fields: ['description'];
    algorithm: 'sha256';
  };
}
```

### 3.3 Dashboard & Management Interface

#### Dashboard Views

##### 1. Overview Dashboard
```typescript
interface OverviewMetrics {
  // Real-time stats
  totalJobs: number;
  newToday: number;
  updatedToday: number;
  duplicatesFound: number;
  
  // Source breakdown
  jobsBySource: Map<string, number>;
  
  // Health indicators
  lastRunStatus: RunStatus;
  nextScheduledRun: Date;
  systemHealth: HealthScore;
}
```

##### 2. Scraping Logs View
- Real-time log streaming
- Filterable by severity, source, timestamp
- Error grouping and frequency analysis
- Performance metrics per scraper

##### 3. Data Management Table
```typescript
interface DataTableFeatures {
  // Display
  pagination: PaginationConfig;
  sorting: SortConfig[];
  filtering: FilterConfig[];
  columnCustomization: ColumnConfig[];
  
  // Actions
  bulkOperations: ['approve', 'reject', 'delete', 'export'];
  inlineEdit: boolean;
  quickPreview: boolean;
  
  // Export options
  exportFormats: ['csv', 'json', 'excel'];
}
```

##### 4. Scheduler Control Panel
- Visual timeline of scheduled tasks
- Manual trigger buttons
- Pause/resume controls
- Cron expression editor
- Task history and statistics

##### 5. Source Configuration
- Add/edit data sources
- Configure scraping rules
- Set rate limits
- Test scraper execution
- Monitor source health

### 3.4 Storage Schema

#### Extended Database Tables
```sql
-- Scraped jobs table (raw data)
CREATE TABLE scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  external_id TEXT,
  raw_data JSONB NOT NULL,
  processed_data JSONB,
  status TEXT CHECK (status IN ('pending', 'processed', 'failed', 'duplicate')),
  error_message TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping runs table
CREATE TABLE scraping_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site TEXT NOT NULL,
  run_type TEXT CHECK (run_type IN ('scheduled', 'manual')),
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  total_scraped INTEGER DEFAULT 0,
  new_jobs INTEGER DEFAULT 0,
  updated_jobs INTEGER DEFAULT 0,
  duplicates INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_log JSONB
);

-- Data source configuration
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL,
  site_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  adapter_config JSONB NOT NULL,
  rate_limit_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_successful_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deduplication records
CREATE TABLE deduplication_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_job_id UUID REFERENCES scraped_jobs(id),
  duplicate_job_id UUID REFERENCES scraped_jobs(id),
  similarity_score DECIMAL(3,2),
  match_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping schedules
CREATE TABLE scraping_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site TEXT,
  cron_expression TEXT NOT NULL DEFAULT '0 0 * * *',
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 API Endpoints

#### Scraping Control API
```typescript
// Manual trigger
POST /api/scraping/trigger
Body: { sourceId?: string, runAll?: boolean }

// Schedule management
GET /api/scraping/schedules
PUT /api/scraping/schedules/:id
POST /api/scraping/schedules/:id/pause
POST /api/scraping/schedules/:id/resume

// Status monitoring
GET /api/scraping/status
GET /api/scraping/runs/:id
GET /api/scraping/logs
```

#### Data Management API
```typescript
// Job data CRUD
GET /api/scraped-jobs
GET /api/scraped-jobs/:id
PUT /api/scraped-jobs/:id
DELETE /api/scraped-jobs/:id

// Bulk operations
POST /api/scraped-jobs/bulk-approve
POST /api/scraped-jobs/bulk-delete
POST /api/scraped-jobs/export

// Analytics
GET /api/scraped-jobs/stats
GET /api/scraped-jobs/duplicates
```

## 4. Technical Architecture

### 4.1 Technology Stack

#### Backend Services
- **Runtime**: Node.js 20+ with TypeScript
- **Web Scraping**: 
  - Primary: Playwright (headless browser automation)
  - Alternative: Firecrawl API (for complex SPA sites)
  - Fallback: Puppeteer, Cheerio
- **Job Queue**: Bull/BullMQ with Redis
- **Scheduling**: node-cron
- **Database**: Supabase (PostgreSQL)
- **Logging**: Winston + Supabase logs

#### Frontend Dashboard
- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **Real-time**: Supabase Realtime

#### Infrastructure
- **Deployment**: Docker containers
- **Orchestration**: Kubernetes (optional)
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry

### 4.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Dashboard (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│                    API Gateway                           │
├─────────────────────────────────────────────────────────┤
│   Scheduler    │   Queue Manager   │   Data Processor   │
├────────────────┼───────────────────┼───────────────────┤
│                 Scraper Core Engine                      │
├─────────────────────────────────────────────────────────┤
│  Site Adapter  │  Site Adapter  │  Site Adapter  │ ...  │
│  (ECJobs)      │  (CTgoodjobs)  │  (JobsDB)     │      │
├─────────────────────────────────────────────────────────┤
│                    Supabase                              │
│         (PostgreSQL + Storage + Realtime)                │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Plugin Architecture for Site Adapters

#### Base Adapter Class
```typescript
abstract class BaseSiteAdapter {
  protected browser: Browser;
  protected context: BrowserContext;
  protected config: AdapterConfig;
  
  constructor(config: AdapterConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    this.browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.context = await this.browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 }
    });
  }
  
  abstract scrapeListings(): Promise<RawJobListing[]>;
  abstract scrapeDetails(url: string): Promise<JobDetails>;
  
  protected async navigateWithRetry(
    url: string, 
    options?: NavigationOptions
  ): Promise<Page> {
    // Implementation with retry logic
  }
  
  protected async extractText(
    selector: string, 
    page: Page
  ): Promise<string | null> {
    // Safe text extraction with error handling
  }
  
  async cleanup(): Promise<void> {
    await this.context.close();
    await this.browser.close();
  }
}
```

#### Example: ECJobs Adapter
```typescript
class ECJobsAdapter extends BaseSiteAdapter {
  async scrapeListings(): Promise<RawJobListing[]> {
    const page = await this.context.newPage();
    const listings: RawJobListing[] = [];
    
    try {
      await page.goto(`${this.config.baseUrl}/jobs`);
      await page.waitForSelector('.job-listing');
      
      const jobElements = await page.$$('.job-listing');
      
      for (const element of jobElements) {
        const listing = await this.extractListing(element);
        if (listing) listings.push(listing);
      }
      
      // Handle pagination
      while (await this.hasNextPage(page)) {
        await this.goToNextPage(page);
        // Extract more listings...
      }
    } finally {
      await page.close();
    }
    
    return listings;
  }
  
  private async extractListing(element: ElementHandle): Promise<RawJobListing | null> {
    // ECJobs-specific extraction logic
  }
}
```

### 4.4 Firecrawl Integration

#### When to Use Firecrawl
```typescript
interface FirecrawlDecisionMatrix {
  useFirecrawl: {
    // Complex JavaScript rendering
    heavySPA: boolean;
    // Anti-bot measures
    cloudflareProtection: boolean;
    // Dynamic content loading
    infiniteScroll: boolean;
    // API rate limits
    strictRateLimits: boolean;
  };
  
  usePlaywright: {
    // Simple HTML structure
    staticContent: boolean;
    // Need fine control
    complexInteractions: boolean;
    // Cost considerations
    highVolume: boolean;
  };
}
```

#### Firecrawl Adapter
```typescript
class FirecrawlAdapter extends BaseSiteAdapter {
  private firecrawl: FirecrawlClient;
  
  async initialize(): Promise<void> {
    this.firecrawl = new FirecrawlClient({
      apiKey: process.env.FIRECRAWL_API_KEY
    });
  }
  
  async scrapeListings(): Promise<RawJobListing[]> {
    const result = await this.firecrawl.scrapeUrl(
      `${this.config.baseUrl}/jobs`,
      {
        formats: ['markdown', 'json'],
        waitFor: 5000,
        extractorOptions: {
          mode: 'llm-extract',
          schema: JOB_LISTING_SCHEMA
        }
      }
    );
    
    return this.parseFirecrawlResult(result);
  }
}
```

## 5. Data Quality & Compliance

### 5.1 Data Quality Metrics

#### Quality Scoring System
```typescript
interface QualityScore {
  completeness: number;  // 0-100: Required fields present
  accuracy: number;      // 0-100: Format validation passed
  freshness: number;     // 0-100: How recent the data is
  uniqueness: number;    // 0-100: Inverse of duplication rate
  
  overall: number;       // Weighted average
}
```

#### Quality Checks
1. **Field Completeness**
   - Title present and meaningful
   - Company name valid
   - Location mappable
   - Description > 100 characters

2. **Data Accuracy**
   - Salary in valid range
   - Date not in future
   - Email/phone format valid
   - URL accessible

3. **Content Quality**
   - No spam keywords
   - Language detection
   - Duplicate content check
   - Inappropriate content filter

### 5.2 Legal & Ethical Compliance

#### Robots.txt Compliance
```typescript
class RobotsChecker {
  async canScrape(url: string): Promise<boolean> {
    const robotsTxt = await this.fetchRobotsTxt(url);
    return this.isAllowed(robotsTxt, url);
  }
}
```

#### Rate Limiting
```typescript
interface RateLimitConfig {
  requestsPerSecond: number;  // Default: 0.5
  requestsPerMinute: number;  // Default: 20
  concurrentRequests: number; // Default: 2
  backoffMultiplier: number;  // Default: 2
}
```

#### Data Attribution
- Store source URL for each job
- Display "via [source]" on frontend
- No claim of ownership over scraped content
- Respect copyright and trademarks

#### Terms of Service Compliance
- Review ToS for each source
- Implement source-specific restrictions
- Maintain compliance documentation
- Regular legal review (quarterly)

## 6. Testing Strategy

### 6.1 Unit Testing

#### Core Module Tests
```typescript
describe('DataProcessor', () => {
  describe('cleanText', () => {
    it('should remove HTML tags');
    it('should normalize whitespace');
    it('should handle encoding issues');
  });
  
  describe('deduplication', () => {
    it('should detect exact duplicates');
    it('should detect fuzzy matches above threshold');
    it('should not flag similar but distinct jobs');
  });
});
```

#### Adapter Tests
```typescript
describe('ECJobsAdapter', () => {
  beforeEach(() => {
    // Mock Playwright browser
  });
  
  it('should extract job listings from page');
  it('should handle pagination');
  it('should retry on failure');
  it('should respect rate limits');
});
```

### 6.2 Integration Testing

#### Scraping Pipeline Tests
```typescript
describe('Scraping Pipeline', () => {
  it('should complete full scraping cycle');
  it('should handle partial failures');
  it('should update existing records');
  it('should trigger notifications on completion');
});
```

#### Database Tests
```typescript
describe('Database Operations', () => {
  it('should store scraped data correctly');
  it('should handle concurrent writes');
  it('should maintain data integrity');
  it('should clean up old records');
});
```

### 6.3 E2E Testing

#### Critical Paths
1. **Scheduled Scraping**
   - Trigger at midnight
   - Process all sources
   - Store results
   - Send notifications

2. **Manual Intervention**
   - Pause scheduled task
   - Run manual scrape
   - Review results
   - Approve/reject jobs

3. **Data Export**
   - Filter dataset
   - Select columns
   - Export to CSV
   - Verify data integrity

### 6.4 Performance Testing

#### Load Testing Scenarios
```typescript
interface LoadTestScenarios {
  scenarios: [
    {
      name: 'Normal Load';
      sources: 2;
      jobsPerSource: 1000;
      duration: '1h';
    },
    {
      name: 'Peak Load';
      sources: 5;
      jobsPerSource: 5000;
      duration: '2h';
    },
    {
      name: 'Stress Test';
      sources: 10;
      jobsPerSource: 10000;
      duration: '4h';
    }
  ];
}
```

### 6.5 Monitoring & Alerting

#### Key Metrics to Monitor
```typescript
interface MonitoringMetrics {
  // Performance
  scrapingDuration: Histogram;
  processingLatency: Histogram;
  databaseWriteTime: Histogram;
  
  // Reliability
  successRate: Gauge;
  errorRate: Counter;
  duplicateRate: Gauge;
  
  // Business
  totalJobsScraped: Counter;
  newJobsAdded: Counter;
  activeSourcesCount: Gauge;
}
```

#### Alert Conditions
- Scraping failure rate > 10%
- Processing time > 2x average
- Duplicate rate > 20%
- No new jobs in 48 hours
- Database connection failures
- Memory usage > 80%

## 7. Scalability Strategy

### 7.1 Horizontal Scaling

#### Distributed Scraping
```typescript
interface DistributedArchitecture {
  // Message queue for job distribution
  queue: 'BullMQ' | 'RabbitMQ' | 'AWS SQS';
  
  // Worker nodes
  workers: {
    count: number;
    autoScale: boolean;
    maxInstances: number;
  };
  
  // Load balancing
  loadBalancer: {
    strategy: 'round-robin' | 'least-connections';
    healthCheck: string;
  };
}
```

### 7.2 Adding New Sources

#### Source Onboarding Process
1. **Analysis Phase**
   - Site structure analysis
   - Data volume estimation
   - Legal review
   - Technical feasibility

2. **Development Phase**
   - Create adapter class
   - Implement extraction logic
   - Add tests
   - Configure rate limits

3. **Testing Phase**
   - Dry run scraping
   - Data quality validation
   - Performance testing
   - Integration testing

4. **Deployment Phase**
   - Deploy to staging
   - Monitor for 24 hours
   - Deploy to production
   - Add to schedule

### 7.3 Performance Optimization

#### Caching Strategy
```typescript
interface CachingLayers {
  // Browser cache
  browserCache: {
    enabled: true;
    ttl: 3600;
  };
  
  // Redis cache
  redisCache: {
    enabled: true;
    ttl: 86400;
    keys: ['job-details', 'company-info'];
  };
  
  // CDN cache
  cdnCache: {
    enabled: true;
    providers: ['Cloudflare'];
  };
}
```

#### Database Optimization
- Partitioning by date
- Indexing on frequently queried fields
- Archiving old data
- Read replicas for dashboard

## 8. Dashboard UI/UX Design

### 8.1 Design System

#### Color Palette
```css
/* Status Colors */
--success: #10B981;
--warning: #F59E0B; 
--error: #EF4444;
--info: #3B82F6;
--processing: #8B5CF6;

/* Data Visualization */
--chart-1: #3B82F6;
--chart-2: #10B981;
--chart-3: #F59E0B;
--chart-4: #8B5CF6;
--chart-5: #EC4899;
```

### 8.2 Dashboard Layout

#### Main Navigation
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Overview  │  📊 Data  │  ⚙️ Sources  │  📅 Schedule │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Content Area]                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Overview Dashboard Components
1. **Stats Cards**
   - Total Jobs
   - New Today
   - Active Sources
   - Next Run

2. **Activity Timeline**
   - Real-time scraping status
   - Recent errors
   - Completed tasks

3. **Performance Charts**
   - Jobs over time
   - Source distribution
   - Success rate trends

4. **Quick Actions**
   - Trigger manual scrape
   - Pause/resume schedule
   - Export data
   - View logs

### 8.3 Data Table Interface

#### Features
- **Advanced Filtering**
  - Multi-field search
  - Date range picker
  - Source selector
  - Status filter

- **Inline Actions**
  - Quick preview
  - Edit fields
  - Approve/reject
  - View source

- **Bulk Operations**
  - Select all/none
  - Bulk approve
  - Bulk delete
  - Bulk export

## 9. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Set up Node.js project with TypeScript
- [ ] Configure Playwright and basic scraper
- [ ] Create Supabase schema
- [ ] Implement basic ECJobs adapter
- [ ] Set up job queue with Bull
- [ ] Create data processing pipeline

### Phase 2: Dashboard MVP (Week 3-4)
- [ ] Next.js dashboard setup
- [ ] Overview page with stats
- [ ] Data table with filtering
- [ ] Manual trigger interface
- [ ] Basic logging view
- [ ] Authentication integration

### Phase 3: Advanced Features (Week 5-6)
- [ ] CTgoodjobs adapter
- [ ] Advanced deduplication
- [ ] Scheduling interface
- [ ] Export functionality
- [ ] Performance monitoring
- [ ] Error alerting

### Phase 4: Optimization (Week 7-8)
- [ ] Firecrawl integration
- [ ] Caching implementation
- [ ] Performance tuning
- [ ] Load testing
- [ ] Documentation
- [ ] Deployment automation

### Phase 5: Scale & Enhance (Week 9-10)
- [ ] Add 3rd data source
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Distributed scraping
- [ ] A/B testing framework
- [ ] ML-based categorization

## 10. Success Metrics

### 10.1 Technical KPIs
- **Scraping Success Rate**: > 95%
- **Data Quality Score**: > 85%
- **Duplicate Rate**: < 5%
- **Processing Time**: < 30 min per source
- **System Uptime**: > 99.5%

### 10.2 Business KPIs
- **Daily New Jobs**: > 500
- **Source Coverage**: 5+ sites
- **Data Freshness**: < 24 hours
- **Cost per Job**: < $0.01
- **Manual Intervention**: < 1 hour/day

### 10.3 Quality Metrics
- **Field Completeness**: > 90%
- **Category Accuracy**: > 85%
- **Location Mapping**: > 95%
- **Company Matching**: > 90%

## 11. Risk Management

### 11.1 Technical Risks

| Risk | Impact | Mitigation |
|------|---------|------------|
| Site structure changes | High | Monitoring + alerts + quick fix process |
| IP blocking | Medium | Proxy rotation + rate limiting |
| Legal issues | High | ToS compliance + legal review |
| Data quality issues | Medium | Validation + manual review |
| System overload | Medium | Auto-scaling + circuit breakers |

### 11.2 Contingency Plans

#### Scraping Failure
1. Automatic retry with backoff
2. Alert to admin
3. Fallback to cached data
4. Manual intervention SOP

#### Data Corruption
1. Validation before storage
2. Backup before processing
3. Rollback capability
4. Data recovery procedures

## 12. Security Considerations

### 12.1 Data Security
- Encrypted storage for sensitive data
- Secure API endpoints with authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention

### 12.2 Infrastructure Security
- Secure environment variables
- VPN for production access
- Regular security audits
- Dependency vulnerability scanning
- Container security scanning

## 13. Documentation Requirements

### 13.1 Technical Documentation
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- Adapter development guide
- Deployment procedures
- Troubleshooting guide

### 13.2 User Documentation
- Dashboard user guide
- Admin manual
- FAQ section
- Video tutorials
- Best practices guide

## 14. Maintenance & Support

### 14.1 Regular Maintenance Tasks
- **Daily**
  - Monitor scraping runs
  - Check error logs
  - Verify data quality

- **Weekly**
  - Performance review
  - Source health check
  - Database cleanup

- **Monthly**
  - Security updates
  - Dependency updates
  - Performance optimization

### 14.2 Support Structure
- **L1 Support**: Dashboard monitoring
- **L2 Support**: Technical troubleshooting
- **L3 Support**: Development team
- **Escalation**: 24-hour SLA for critical issues

## 15. Cost Analysis

### 15.1 Infrastructure Costs

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| Supabase | $25 | Pro plan |
| Redis Cloud | $10 | Caching layer |
| Firecrawl | $50 | 10k pages/month |
| Monitoring | $20 | Sentry + logging |
| Proxy Service | $30 | Optional |
| **Total** | **$135** | Per month |

### 15.2 Development Costs
- Initial development: 10 weeks
- Ongoing maintenance: 20 hours/month
- Feature development: 40 hours/quarter

## 16. Conclusion

The HK Job Pro Data Aggregation System provides a robust, scalable solution for automating job data collection while maintaining high quality and compliance standards. The modular architecture ensures easy addition of new sources, while the comprehensive dashboard provides full visibility and control over the scraping operations.

Key success factors:
- Plugin-based architecture for maintainability
- Strong focus on data quality and deduplication
- Comprehensive monitoring and alerting
- Legal compliance built into the design
- Scalability for future growth

This system will enable HK Job Pro to launch with substantial content, maintain fresh job listings, and scale efficiently as the platform grows.

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Author: Technical Team*
*Related Documents: PRD.md, Technical Architecture Document, API Documentation*
