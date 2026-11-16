export type DashboardVariant = 'inventory' | 'atliq' | 'sales' | 'ola' | 'insurance' | 'hr';

export interface Project {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  client: string;
  domain: string;
  sourceFile: string;
  reportPages: string[];
  sourceCredit?: string;
  tags: string[];
  tools: string[];
  description: string;
  challenge: string;
  objectives: string[];
  sources: string;
  approach: string;
  preparation: string;
  implementation: string;
  questions: string[];
  value: string;
  variant: DashboardVariant;
  color: string;
}

export const projects: Project[] = [
  {
    "slug": "supply-chain-inventory-analytics",
    "title": "Supply Chain & Inventory Analytics",
    "shortTitle": "Keep the right stock moving.",
    "category": "Food & beverage retail · Inventory planning",
    "client": "leading food and beverage retail organization",
    "domain": "Food & beverage retail / supply chain",
    "sourceFile": "Supply_Chain.pbix",
    "reportPages": [
      "Overview",
      "Sales Quantity & Run Rate",
      "Write-Off Forecast",
      "Product Group Stock Analysis",
      "Historical Stock Analysis",
      "Dry Goods",
      "Weeks On Hand",
      "Out Of Stock",
      "Low Stock Cover"
    ],
    "tags": [
      "Power BI",
      "Supply Chain"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "A redesigned inventory command center for stock on hand, replenishment, sales velocity and expiry exposure.",
    "challenge": "A food and beverage inventory review needs to connect current stock, incoming supply and sales velocity. Stock shortages and products approaching expiry need to be visible alongside the broader picture.",
    "objectives": [
      "Compare stock on hand, customer orders and incoming quantities across regions.",
      "Review sales run rate and stock cover to guide replenishment.",
      "Surface expiry exposure, write-off risk and out-of-stock exceptions."
    ],
    "sources": "Based on the structure of Supply_Chain.pbix. The public showcase uses newly generated figures, fictional product names and generalized regions throughout. Its layout and formatting have been redesigned; original operational values and source report images are not published.",
    "approach": "Organize the inventory review around availability, demand and risk. Start with a summary, then use regional filters, stock-versus-demand comparisons and a replenishment priority list to direct attention.",
    "preparation": "The source report separates item master, state, date, stock history, shipment and velocity information. The demonstration uses a fictional dataset with consistent units, product keys and reporting periods.",
    "implementation": "Power BI report measures cover stock on hand, incoming quantity, customer orders, sales run rate, weeks on hand and expiry-related exposure. The website recreates those analytical questions in a new interactive layout with synthetic values.",
    "questions": [
      "Where does stock cover fall short of demand?",
      "Which products need replenishment attention?",
      "Where is expiry exposure concentrated?"
    ],
    "value": "The reporting design supports stock reviews and replenishment decisions. All public figures are illustrative and do not represent the organization’s performance.",
    "variant": "inventory",
    "color": "sage"
  },
  {
    "slug": "atliq-mart-fmcg-supply-chain",
    "title": "AtliQ Mart FMCG Delivery Analytics",
    "shortTitle": "See where fulfillment falls behind.",
    "category": "FMCG · Delivery & fulfillment",
    "client": "AtliQ Mart",
    "domain": "FMCG / retail supply chain",
    "sourceFile": "AtliqMart Supply Chain Report_FMCG.pbix",
    "reportPages": [
      "Home",
      "Insights Page"
    ],
    "sourceCredit": "Rajendra Kumar Oram",
    "tags": [
      "Power BI",
      "Supply Chain"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "An adapted reference study of delivery service levels, order fulfillment and fill rates across cities, customers and product categories.",
    "challenge": "Order volume alone cannot explain delivery service. Fulfillment reviews need separate views of timeliness, completeness and the gap between ordered and shipped quantities.",
    "objectives": [
      "Compare on-time, in-full and on-time-in-full delivery with targets.",
      "Review line and volume fill rates across customers and products.",
      "Explore delivery lead time and ordered-versus-shipped quantities by city and period."
    ],
    "sources": "Based on AtliqMart Supply Chain Report_FMCG.pbix, which identifies AtliQ Mart and the FMCG domain. The original report credits Rajendra Kumar Oram for its design. This case study is an adaptation for the portfolio; public demonstration figures are synthetic.",
    "approach": "Keep delivery measures distinct, compare each with its target, and use city, customer and category views to investigate service gaps before forming an operational conclusion.",
    "preparation": "The source report connects order-line records with customer, product and date dimensions. Its metric structure distinguishes orders, quantities, delivery days and fulfillment rates.",
    "implementation": "The Power BI report uses DAX measures for on-time delivery, in-full delivery, on-time-in-full delivery, line fill rate and volume fill rate, alongside ordered and shipped quantities and delivery lead time.",
    "questions": [
      "Which service measures are furthest from their targets?",
      "How do fulfillment patterns differ by city and customer?",
      "Which product categories have the largest ordered-versus-shipped gaps?"
    ],
    "value": "The study demonstrates how a delivery review can move from summary service levels to customer and product detail. The brand identifies the source report context; this is not a claim of a commissioned engagement or verified commercial impact.",
    "variant": "atliq",
    "color": "slate"
  },
  {
    "slug": "blinkit-quick-commerce-analytics",
    "title": "Blinkit Commerce Performance Analytics",
    "shortTitle": "Connect every part of the basket.",
    "category": "Quick commerce · Retail performance",
    "client": "Blinkit",
    "domain": "Quick commerce / grocery retail",
    "sourceFile": "Blinkit Dashboard.pbix",
    "reportPages": [
      "Home",
      "Overview",
      "Sales Overview",
      "Customer",
      "Inventory",
      "Feedbacks",
      "Marketing"
    ],
    "tags": [
      "Power BI",
      "Quick Commerce"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "A connected view of sales, customer retention, inventory, feedback and campaign performance for a quick-commerce reporting study.",
    "challenge": "Retail performance spans more than sales. Customer acquisition and loss, stock availability, customer feedback and marketing activity need a shared reporting context.",
    "objectives": [
      "Compare current and prior-year sales and year-to-date growth.",
      "Explore new, retained and lost customer patterns.",
      "Connect inventory availability, ratings and sentiment with campaign performance."
    ],
    "sources": "Based on Blinkit Dashboard.pbix and its sales, customer, inventory, feedback and marketing report pages. The website uses fictional aggregated records and synthetic figures. Blinkit identifies the source project context and does not imply affiliation or endorsement.",
    "approach": "Use a shared period and product context across the overview and specialist pages. Move from sales trends into customer, inventory and campaign detail to frame focused questions.",
    "preparation": "The source model separates product and customer information from sales, inventory and campaign measures. Calendar and time-period fields support comparable reporting windows.",
    "implementation": "Power BI measures cover current/prior-year sales, year-to-date growth, new and lost customers, stock turnover and damage, feedback counts and ratings, plus campaign spend, impressions, clicks, conversions and attributed revenue.",
    "questions": [
      "Which categories and locations contribute to sales?",
      "How do new and lost customers affect the retail picture?",
      "How do stock availability, feedback and campaign results change across periods?"
    ],
    "value": "A connected reporting view supports category, customer and campaign review. The portfolio demonstration does not claim a commissioned client relationship or measured growth.",
    "variant": "sales",
    "color": "ochre"
  },
  {
    "slug": "ola-rider-retention-analytics",
    "title": "OLA Rider Retention Analytics",
    "shortTitle": "Understand the patterns behind retention.",
    "category": "Mobility · Rider & workforce analytics",
    "client": "OLA",
    "domain": "Mobility / rider and workforce retention",
    "sourceFile": "OLA Dashboard.pbix",
    "reportPages": [
      "Main",
      "More"
    ],
    "tags": [
      "Power BI",
      "Workforce"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "A mobility reporting study focused on attrition, tenure, income and ratings across rider and workforce cohorts.",
    "challenge": "An overall attrition rate does not explain how retention patterns vary. The report brings cohort, tenure, income, rating and location views together for further investigation.",
    "objectives": [
      "Review attrition rate against the report target.",
      "Compare tenure, income and ratings for retained and departed cohorts.",
      "Explore retention patterns across city, age, education and joining period."
    ],
    "sources": "Based on OLA Dashboard.pbix. Its model contains rider age categories and attrition, tenure, income and rating measures. The public reconstruction uses synthetic aggregate values; OLA identifies the source project brand context.",
    "approach": "Start with retention measures, compare cohorts, and use demographic and joining-period views to identify patterns that warrant context from the business.",
    "preparation": "The source report includes city, age, gender, education, joining-date and salary-range fields. Retained and departed groups are kept separate for income and rating comparisons.",
    "implementation": "Power BI DAX measures summarize attrition rate and target, average tenure, average income and rating for retained versus departed cohorts, rating changes and total business value.",
    "questions": [
      "How does attrition vary across cities and cohorts?",
      "What differences appear in tenure, income and ratings?",
      "Are retention patterns consistent across joining periods?"
    ],
    "value": "The dashboard supports structured retention discussions. Cohort differences are descriptive and do not establish causes of attrition, a commissioned client relationship or commercial impact.",
    "variant": "ola",
    "color": "sage"
  },
  {
    "slug": "phoenix-assurance-claims-analytics",
    "title": "Phoenix Assurance Claims Intelligence",
    "shortTitle": "Follow the claim from case to payment.",
    "category": "Healthcare insurance · Claims operations",
    "client": "Phoenix Assurance Private Limited",
    "domain": "Healthcare insurance / claims operations",
    "sourceFile": "Pheonix Insurance Pvt Ltd .pbix",
    "reportPages": [
      "Home",
      "Overview",
      "More Insights"
    ],
    "tags": [
      "Power BI",
      "Insurance"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "A healthcare claims reporting study covering approvals, payments, service levels, cash flow and workflow bottlenecks.",
    "challenge": "Claims teams need visibility into both financial progress and processing stages. Approved, paid, rejected and unpaid claims must be read alongside service levels and hospital turnaround time.",
    "objectives": [
      "Summarize cases, approved claims, paid claims and unpaid amounts.",
      "Review claim processing service levels and workflow bottlenecks.",
      "Compare claims across hospitals, districts, specialties and demographic groups."
    ],
    "sources": "Based on Pheonix Insurance Pvt Ltd .pbix. Its embedded logo identifies Phoenix Assurance Private Limited. The public demonstration uses fictional aggregate case and claim figures without patient or policyholder records.",
    "approach": "Separate the claims overview from processing detail. Use case status, payment progress, service levels and workflow roles to make the path from initiation to payment easier to review.",
    "preparation": "The source report includes admission dates, hospital and district attributes, case types and statuses, workflow roles and payment flags. Aggregate comparisons use consistent claim definitions.",
    "implementation": "Power BI measures cover cases, approvals, payments, rejected and unpaid claims, families covered, surgeries, service-level compliance, discharge turnaround time and tax deductions.",
    "questions": [
      "Where do claims accumulate in the processing workflow?",
      "How do approved and paid claim amounts compare?",
      "Which hospitals or districts need a closer service-level review?"
    ],
    "value": "The report structure supports claims and operational reviews. The named organization denotes source report context; no commissioned engagement or verified improvement is asserted.",
    "variant": "insurance",
    "color": "rose"
  },
  {
    "slug": "hr-analytics-dashboard",
    "title": "HR Diversity & Inclusion Analytics",
    "shortTitle": "Explore representation across the workforce.",
    "category": "People analytics · Diversity & inclusion",
    "client": "Confidential organization",
    "domain": "Human resources / diversity and inclusion",
    "sourceFile": "HR Diversity Inclusion Dashboard.pbix",
    "reportPages": [
      "Dashboard 1",
      "Dashboard 2",
      "Dashboard 3"
    ],
    "tags": [
      "Power BI",
      "Workforce"
    ],
    "tools": [
      "Power BI",
      "DAX",
      "Power Query"
    ],
    "description": "A diversity and inclusion reporting study of gender representation in hiring, promotions and turnover across workforce groups.",
    "challenge": "Workforce representation needs to be reviewed across hiring, promotion and turnover stages. A shared view of age, region, job level and department helps teams investigate patterns with appropriate context.",
    "objectives": [
      "Compare female and male representation in hiring and promotions.",
      "Review FY20 leaver turnover rates across workforce groups.",
      "Explore average time in grade for employees promoted in FY2021."
    ],
    "sources": "Based on HR Diversity Inclusion Dashboard.pbix, published as HR Diversity Inclusion Dashboard in Power BI. The organization is not named in this portfolio. Until its public report is available, the website displays an illustrative workforce preview with synthetic values.",
    "approach": "Review hiring, promotion and turnover measures together, then use age group, region group, job level and department filters to investigate differences in representation.",
    "preparation": "The report provides age group, region group, job level and department slicers. Hiring and promotion comparisons distinguish female and male proportions, with reporting-year context retained for turnover and time-in-grade measures.",
    "implementation": "The Power BI report presents hiring proportions, promotions this year, turnover rates for FY20 leavers and average time in grade for employees promoted in FY2021 across three dashboard pages.",
    "questions": [
      "How does gender representation compare across hiring and promotion stages?",
      "How do turnover patterns differ across age groups, regions, job levels and departments?",
      "How does average time in grade vary among employees promoted in FY2021?"
    ],
    "value": "The report supports structured discussions about workforce representation and career progression. Its aggregate comparisons describe patterns and need business context before drawing conclusions.",
    "variant": "hr",
    "color": "slate"
  }
];

export const projectCategories = ['All Projects', 'Power BI', 'Supply Chain', 'Quick Commerce', 'Workforce', 'Insurance'];

export const services = [
  {
    id: 'power-bi', title: 'Power BI Dashboard Development', shortTitle: 'Power BI dashboards',
    headline: 'Make your business performance visible.',
    description: 'Interactive dashboards that connect your business data to the decisions you make every day.',
    problems: ['Manual KPI tracking and disconnected reporting files', 'Limited visibility into sales, inventory, or financial performance', 'Time-consuming management reporting'],
    deliverables: ['Executive, sales, finance, inventory, or HR dashboards', 'Data modeling, DAX measures, and Power Query transformations', 'KPI definitions, validation, and dashboard documentation'],
    tools: ['Power BI', 'DAX', 'Power Query', 'SQL', 'Excel'],
    idealFor: 'Business owners, operations teams, and finance leaders who need one reliable view of performance.',
  },
  {
    id: 'excel-automation', title: 'Excel & Reporting Automation', shortTitle: 'Excel automation',
    headline: 'Give repetitive reporting a better workflow.',
    description: 'Practical Excel and Google Sheets workflows that simplify consolidation, preparation, and recurring reports.',
    problems: ['Monthly copy-and-paste reporting', 'Inconsistent files and repeated data cleaning', 'Manual calculations that are difficult to maintain'],
    deliverables: ['Multiple-file consolidation and automated summaries', 'Power Query workflows, advanced formulas, and data validation', 'VBA or macros where appropriate, with handover documentation'],
    tools: ['Excel', 'Power Query', 'VBA', 'Python', 'Google Sheets'],
    idealFor: 'Small businesses and reporting teams spending too much of their day maintaining spreadsheets.',
  },
  {
    id: 'data-analysis', title: 'Data Analysis & Business Intelligence', shortTitle: 'Data analysis',
    headline: 'Discover what your data is telling you.',
    description: 'Focused analysis to make business trends, customer behavior, and performance gaps easier to understand.',
    problems: ['Business questions without clear answers', 'Unexplained changes in revenue or customer behavior', 'Metrics without shared definitions or context'],
    deliverables: ['Exploratory, sales, customer, and profitability analysis', 'Business KPI development and trend visualization', 'Documented findings and practical recommendations'],
    tools: ['Python', 'Pandas', 'NumPy', 'SQL', 'Power BI', 'Excel'],
    idealFor: 'Startups, e-commerce businesses, and teams that want evidence to guide their next decision.',
  },
  {
    id: 'sql-reporting', title: 'SQL & Data Management', shortTitle: 'SQL & data management',
    headline: 'Reliable reporting starts with reliable data.',
    description: 'Organize, extract, and transform business data into a dependable foundation for analytics.',
    problems: ['Data spread across database tables or systems', 'Reports with inconsistent calculations', 'Slow or difficult-to-maintain reporting queries'],
    deliverables: ['SQL queries, joins, aggregations, CTEs, and window functions', 'Data extraction, transformation, cleaning, and validation', 'Database reporting and query optimization'],
    tools: ['MySQL', 'SQL Server', 'PostgreSQL', 'BigQuery'],
    idealFor: 'Teams with operational databases that need accurate, maintainable reporting datasets.',
  },
  {
    id: 'python-automation', title: 'Python Data Processing Automation', shortTitle: 'Python automation',
    headline: 'Let a repeatable process handle the busywork.',
    description: 'Purpose-built Python workflows for repeated file processing, data cleaning, and report preparation.',
    problems: ['Large batches of CSV or Excel files', 'Repetitive transformations and calculations', 'Inconsistent preparation steps across reports'],
    deliverables: ['CSV and Excel processing and file consolidation', 'Data cleaning, transformation, and validation scripts', 'Structured reporting outputs and usage documentation'],
    tools: ['Python', 'Pandas', 'NumPy', 'Excel'],
    idealFor: 'Operations and analytics teams with repeatable data tasks. Scheduling and integrations are scoped separately.',
  },
];

export const processSteps = [
  { title: 'Discovery', description: 'We start with the business question, the people using the report, and what a useful outcome looks like.', output: 'A shared brief and agreed scope' },
  { title: 'Data assessment', description: 'I review your spreadsheets, databases, existing reports, and data quality to understand what is possible.', output: 'A practical solution plan' },
  { title: 'Development', description: 'I prepare the data, build the model, write queries, and develop the dashboard or reporting workflow.', output: 'A working solution for review' },
  { title: 'Testing & validation', description: 'We check calculations, reconcile data, test filters, and review the workflow against your requirements.', output: 'A validated, usable deliverable' },
  { title: 'Delivery & support', description: 'You receive the solution, documentation, and a walkthrough. Ongoing support is agreed around your needs.', output: 'A clear handover and next steps' },
];

export const packages = [
  { name: 'Excel Automation', price: '3,000', description: 'A better way to handle everyday reporting.', items: ['Excel data cleaning', 'Multiple-file consolidation', 'Formula optimization', 'Power Query transformations', 'Basic reporting automation', 'Documentation'], cta: 'Get an Excel Quote', service: 'Excel Automation' },
  { name: 'Power BI Dashboard', price: '7,000', description: 'Your business performance in one clear view.', items: ['Data preparation and modeling', 'DAX measures', 'Interactive dashboard', 'KPI development', 'Dashboard validation', 'Handover documentation'], cta: 'Build My Dashboard', service: 'Power BI Dashboard Development' },
  { name: 'Complete Analytics Solution', price: '15,000', description: 'Connect your data, workflow, and decisions.', items: ['SQL data extraction', 'Data transformation', 'Excel automation', 'Power BI dashboard', 'KPI analysis and validation', 'Documentation'], cta: 'Discuss My Project', service: 'Business Intelligence' },
];

export const faqs = [
  { question: 'What types of businesses do you work with?', answer: 'I work with small and medium-sized businesses, startups, e-commerce businesses, and finance, operations, sales, and supply chain teams. The starting point is your reporting challenge and the data you already have.' },
  { question: 'Can you automate my existing Excel reports?', answer: 'Yes. I can review your existing files and suggest a practical workflow using Power Query, advanced formulas, VBA, or Python. The level of automation depends on your data sources, access, and available infrastructure.' },
  { question: 'Can you build dashboards using my existing data?', answer: 'Yes. Excel files, databases, and other structured sources can form the basis of a dashboard. I first assess data quality, access requirements, and the questions the dashboard needs to answer.' },
  { question: 'Do you work with international clients?', answer: 'I am open to working with businesses in India and internationally. Scope, communication, time zone overlap, currency, and delivery arrangements are agreed before a project starts.' },
  { question: 'Can you work with multiple Excel files?', answer: 'Yes. I can consolidate multiple files, standardize their formats, and create a repeatable preparation process. I will need a representative sample and an understanding of how new files arrive.' },
  { question: 'Do you provide ongoing dashboard maintenance?', answer: 'Ongoing maintenance and support can be scoped separately. This may include data-source updates, measure changes, new report pages, and troubleshooting, according to an agreed arrangement.' },
  { question: 'How long does a dashboard project take?', answer: 'Timing depends on the number of data sources, data quality, reporting requirements, and review cycles. After assessing your requirements, I will propose a realistic schedule rather than promise a fixed turnaround in advance.' },
  { question: 'What do you need to start a project?', answer: 'A description of your business problem, the reports you use today, the decisions you want to support, and a representative data sample are helpful. Please avoid sending passwords or confidential datasets through the inquiry form.' },
];
