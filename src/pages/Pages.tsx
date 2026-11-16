import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Check, CheckCircle2, ChevronDown, Code2, Database, FileSpreadsheet, Globe2, Mail, Maximize2, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import PowerBIReport, { PowerBIReportLink } from '../components/PowerBIReport';
import HRDiversityPreview from '../components/HRDiversityPreview';
import { siteConfig } from '../config';
import { faqs, packages, processSteps, projectCategories, projects, services, type Project } from '../data/content';
import { getPowerBIReport, getPublicEmbedUrl } from '../data/powerBIReports';
import './pages.css';

function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: string; children?: ReactNode }) {
  return <header className="inner-intro container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="inner-lead">{description}</p>}{children}</header>;
}

function PageCTA({ title = <>Your business has data.<br /><em>Let’s make it work smarter.</em></> }: { title?: ReactNode }) {
  return <section className="inner-cta container"><div><p className="eyebrow">A GOOD PLACE TO START</p><h2>{title}</h2></div><Link to="/contact" className="button button-dark">Discuss Your Project <ArrowUpRight size={18} /></Link></section>;
}

const serviceIcons = [BarChart3, FileSpreadsheet, Sparkles, Database, Code2];
const inquiryServiceMap: Record<string, string> = { 'power-bi': 'Power BI Dashboard Development', 'excel-automation': 'Excel Automation', 'data-analysis': 'Data Analysis', 'sql-reporting': 'SQL & Database Reporting', 'python-automation': 'Python Automation' };

export function ServicesPage() {
  return <>
    <PageIntro eyebrow="SERVICES / BUILT AROUND YOUR BUSINESS" title={<>Less reporting friction.<br /><em>More useful answers.</em></>} description="From a spreadsheet that needs simplifying to a dashboard that connects the whole picture. Practical analytics, shaped around your business." />
    <div className="container inner-service-nav" aria-label="Jump to a service">{services.map((service, i) => <a href={`#${service.id}`} key={service.id}><span>0{i + 1}</span>{service.shortTitle}<ArrowDown size={14} /></a>)}</div>
    <div className="container inner-services">{services.map((service, i) => {
      const Icon = serviceIcons[i];
      return <section className="inner-service" id={service.id} key={service.id}>
        <div className="inner-service-heading"><span className="inner-service-number">0{i + 1}</span><div className="inner-service-icon"><Icon size={29} strokeWidth={1.5} /></div><p className="eyebrow">{service.title}</p><h2>{service.headline}</h2><p>{service.description}</p><Link className="text-link" to={`/contact?service=${encodeURIComponent(inquiryServiceMap[service.id])}`}>Let’s talk about this <ArrowUpRight size={17} /></Link></div>
        <div className="inner-service-detail"><div><h3>The challenges we can solve</h3><ul>{service.problems.map(item => <li key={item}><span className="inner-list-dot" />{item}</li>)}</ul></div><div><h3>What you can expect</h3><ul>{service.deliverables.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul></div><div className="inner-service-tools">{service.tools.map(tool => <span className="tag" key={tool}>{tool}</span>)}</div><p className="inner-ideal"><strong>A good fit for</strong> {service.idealFor}</p></div>
      </section>;
    })}</div>
    <section className="container inner-note"><ShieldCheck size={23} /><p>Each engagement includes an agreed scope and deliverables. Data access, refresh infrastructure, software licensing, and ongoing maintenance are discussed before work begins.</p><Link to="/pricing" className="text-link">View starting prices <ArrowUpRight size={17} /></Link></section>
    <PageCTA />
  </>;
}

function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const isLive = Boolean(getPublicEmbedUrl(getPowerBIReport(project.variant)));
  return <article className={`inner-project inner-project-${project.color}`}>
    <Link to={`/projects/${project.slug}`} className="inner-project-preview" aria-label={`View ${project.title} case study`}><div className="inner-project-visual-top"><span>CASE STUDY / 0{index + 1}</span><ArrowUpRight size={22} /></div><div className="inner-project-dashboard">{project.variant === 'hr' ? <HRDiversityPreview compact /> : <Dashboard variant={project.variant} compact interactive={false} />}</div><span className="inner-demo-label">{project.variant === 'hr' ? (isLive ? 'LIVE REPORT IN CASE STUDY · REPORT TOPICS' : 'DIVERSITY & INCLUSION REPORT') : isLive ? 'LIVE REPORT IN CASE STUDY · SAMPLE PREVIEW' : 'ILLUSTRATIVE DEMONSTRATION'}</span></Link>
    <div className="inner-project-meta"><p className="eyebrow">{project.category}</p><h2><Link to={`/projects/${project.slug}`}>{project.title}</Link></h2><p className="project-client"><span>Client / organization</span>{project.client}</p><p>{project.description}</p><div className="inner-project-bottom"><div className="inner-tags">{project.tools.slice(0, 3).map(tool => <span className="tag" key={tool}>{tool}</span>)}</div><Link to={`/projects/${project.slug}`} className="text-link">View case study <ArrowUpRight size={16} /></Link></div></div>
  </article>;
}

export function ProjectsPage() {
  const [category, setCategory] = useState('All Projects');
  const filteredProjects = category === 'All Projects' ? projects : projects.filter(project => project.tags.includes(category));
  const hasLiveReports = projects.some(project => Boolean(getPublicEmbedUrl(getPowerBIReport(project.variant))));
  return <>
    <PageIntro eyebrow="SELECTED WORK / ANALYTICS IN PRACTICE" title={<>Different challenges.<br /><em>One clearer picture.</em></>} description="Six Power BI projects spanning food and beverage inventory, FMCG delivery, quick commerce, workforce retention, healthcare claims, and HR. Explore each organization, domain, and reporting challenge." />
    <section className="container inner-projects-section"><div className="inner-filter-row" role="group" aria-label="Filter projects by technology or category">{projectCategories.map(item => <button type="button" className={`inner-filter ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)} aria-pressed={category === item} key={item}>{item}{category === item && <span>{filteredProjects.length}</span>}</button>)}</div><p className="inner-project-count" aria-live="polite">{filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} · {hasLiveReports ? 'Explore published reports in the case studies' : 'Demonstration dashboards with synthetic data'}</p><div className="inner-project-grid">{filteredProjects.map(project => <ProjectCard key={project.slug} project={project} index={projects.indexOf(project)} />)}</div><p className="inner-footnote">{hasLiveReports ? 'Cards show sample figures or report topics. Open a case study to explore its available published Power BI report. Organization names describe the supplied project context; they do not imply endorsement or verified commercial outcomes.' : 'These case studies explain analytical approaches. Website previews use synthetic figures. Organization names describe the supplied project context; they do not imply endorsement or verified commercial outcomes.'}</p></section>
    <PageCTA />
  </>;
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find(item => item.slug === slug);
  const dialog = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { if (!expanded) return; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; }; }, [expanded]);
  if (!project) return <NotFoundPage />;
  const report = getPowerBIReport(project.variant);
  const isLive = Boolean(getPublicEmbedUrl(report));
  const isHRPreview = project.variant === 'hr' && !isLive;
  const openPreview = () => { dialog.current?.showModal(); setExpanded(true); };
  const closePreview = () => { dialog.current?.close(); setExpanded(false); };
  return <>
    <header className="container inner-case-intro"><Link to="/projects" className="text-link inner-back">← All projects</Link><p className="eyebrow">{project.category} / {isLive ? 'LIVE POWER BI REPORT' : isHRPreview ? 'REPORT PREVIEW' : 'DEMONSTRATION'}</p><h1>{project.title}</h1><p className="inner-lead">{project.description}</p><div className="case-client-banner"><span>CLIENT / ORGANIZATION</span><strong>{project.client}</strong><small>{project.domain}</small></div><div className="inner-tags">{project.tools.map(tool => <span className="tag" key={tool}>{tool}</span>)}</div></header>
    <section className={`container inner-case-visual inner-project-${project.color}${isLive ? ' inner-case-live' : ''}`} aria-label={isLive ? 'Interactive Power BI report' : isHRPreview ? 'Diversity and inclusion report topics' : 'Interactive dashboard preview'}>
      <div className="inner-case-visual-caption"><span>{isLive ? 'EXPLORE THE PUBLISHED POWER BI REPORT' : isHRPreview ? 'DIVERSITY & INCLUSION · REPORT TOPICS' : 'EXPLORE THE DASHBOARD · SAMPLE DATA'}</span><button className="inner-expand" onClick={openPreview} type="button"><Maximize2 size={16} />{isLive ? 'Expand report' : 'Expand preview'}</button></div>
      {isLive && report ? <PowerBIReport report={report} title={project.title} /> : isHRPreview ? <HRDiversityPreview /> : <Dashboard variant={project.variant} interactive />}
      <p>{isLive ? 'Interactive report hosted by Power BI. Explore its filters, charts and report pages, or use the full-screen control inside the report.' : isHRPreview ? 'A preview of the published report’s subjects. Open the report in Power BI to explore its data.' : 'Illustrative dashboard. Filters operate on synthetic data; values are not real business results.'}</p>
      {!isLive && <PowerBIReportLink report={report} />}
    </section>
    <dialog ref={dialog} className="inner-dashboard-dialog" onClose={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) closePreview(); }} aria-labelledby="expanded-dashboard-title"><div className="inner-dialog-header"><div><p className="eyebrow">{isLive ? 'PUBLISHED POWER BI REPORT' : isHRPreview ? 'DIVERSITY & INCLUSION REPORT TOPICS' : 'ILLUSTRATIVE DASHBOARD'}</p><h2 id="expanded-dashboard-title">{project.title}</h2></div><button type="button" onClick={closePreview} className="inner-close" aria-label="Close expanded dashboard"><X size={22} /></button></div>{expanded && (isLive && report ? <PowerBIReport report={report} title={project.title} expanded /> : isHRPreview ? <><HRDiversityPreview /><PowerBIReportLink report={report} /></> : <Dashboard variant={project.variant} interactive />)}<p className="inner-footnote">{isLive ? 'Use the report controls to explore. Press Escape to close.' : isHRPreview ? 'Open the published report to explore the data. Press Escape to close.' : 'Synthetic data for demonstration purposes. Press Escape to close.'}</p></dialog>
    <div className="container inner-case-content"><aside className="inner-case-aside"><p className="eyebrow">THE PROJECT AT A GLANCE</p><dl><dt>Client / organization</dt><dd>{project.client}</dd><dt>Domain</dt><dd>{project.domain}</dd><dt>Project type</dt><dd>Power BI portfolio showcase</dd><dt>{isLive ? 'Report data' : isHRPreview ? 'Report preview' : 'Website preview data'}</dt><dd>{isLive ? 'Published Power BI report' : isHRPreview ? 'Report topics · no sample values' : 'Synthetic, non-confidential'}</dd><dt>Tools & approach</dt><dd>{project.tools.join(', ')}</dd></dl><Link to="/contact" className="text-link">Discuss a similar project <ArrowUpRight size={16} /></Link></aside><div className="inner-case-story">
      <section><span className="eyebrow">01 / THE BUSINESS CHALLENGE</span><h2>Start with the right question.</h2><p>{project.challenge}</p></section>
      <section><span className="eyebrow">02 / DATA SOURCES & OBJECTIVES</span><h2>A useful foundation.</h2><p>{isLive ? `Based on ${project.sourceFile}. This website embeds the published Power BI report so you can explore its model through interactive report pages. Organization names identify the source project context and do not imply affiliation or endorsement.` : isHRPreview ? `Based on ${project.sourceFile}, published as HR Diversity Inclusion Dashboard in Power BI. The preview outlines the report’s subjects; use the published report link to explore its data. The organization is not named in this portfolio.` : project.sources}</p><ul className="inner-check-list">{project.objectives.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul></section>
      <section><span className="eyebrow">03 / ANALYTICAL APPROACH</span><h2>From raw information to a clear view.</h2><p>{project.approach}</p><div className="inner-case-two"><div><h3>Data preparation</h3><p>{project.preparation}</p></div><div><h3>Technical implementation</h3><p>{project.implementation}</p></div></div></section>
      <section><span className="eyebrow">04 / QUESTIONS TO EXPLORE</span><h2>What the dashboard helps you investigate.</h2><ul className="inner-question-list">{project.questions.map(item => <li key={item}><ArrowUpRight size={17} />{item}</li>)}</ul><p className="inner-case-disclosure">{isLive || isHRPreview ? 'Explore the published report to investigate these questions. Conclusions require validation against the source data and business context.' : 'Verified findings are not published for this demonstration. The preview illustrates the reporting experience; conclusions would require validation against the actual source data and business context.'}</p></section>
      <section className="case-report-scope"><span className="eyebrow">SOURCE REPORT / COVERAGE</span><h2>What the Power BI report covers.</h2><div className="report-page-list">{project.reportPages.map(page => <span key={page}>{page}</span>)}</div>{project.sourceCredit && <p className="case-source-credit">Original report design credit: {project.sourceCredit}.{!isLive && ' This website preview is a new illustrative adaptation.'}</p>}</section><section><span className="eyebrow">05 / POTENTIAL BUSINESS VALUE</span><h2>Make the information useful.</h2><p>{project.value}</p></section>
    </div></div>
    <section className="container inner-related"><div className="inner-section-top"><div><p className="eyebrow">KEEP EXPLORING</p><h2>More perspectives.</h2></div><Link to="/projects" className="text-link">All projects <ArrowUpRight size={16} /></Link></div><div className="inner-project-grid">{projects.filter(item => item.slug !== slug).slice(0, 2).map(item => <ProjectCard project={item} index={projects.indexOf(item)} key={item.slug} />)}</div></section>
    <PageCTA title={<>Need something similar?<br /><em>Let’s talk.</em></>} />
  </>;
}

const expertise = [
  ['Business intelligence', 'Power BI', 'DAX', 'Power Query', 'Tableau', 'Data Modeling'],
  ['Data analytics', 'Python', 'Pandas', 'NumPy', 'Exploratory Data Analysis', 'Statistical Analysis'],
  ['Databases', 'SQL', 'MySQL', 'SQL Server', 'PostgreSQL', 'BigQuery'],
  ['Spreadsheets', 'Advanced Excel', 'Pivot Tables', 'XLOOKUP', 'INDEX-MATCH', 'VBA / Macros'],
  ['Data management', 'Data Cleaning', 'ETL', 'Data Transformation', 'Data Validation', 'Reporting Automation'],
];

export function AboutPage() {
  const [portraitFailed, setPortraitFailed] = useState(false);
  return <>
    <PageIntro eyebrow="ABOUT / THE PERSON BEHIND THE ANALYTICS" title={<>Hi, I’m Anil.<br /><em>I make data make sense.</em></>} />
    <section className="container inner-about"><div className="inner-about-portrait" aria-label="Anil Singh profile"><div className="inner-portrait-grid" />{siteConfig.portraitUrl && !portraitFailed ? <img className="inner-founder-photo" src={siteConfig.portraitUrl} alt="Anil Singh, Data Analytics and Business Intelligence Consultant" loading="lazy" onError={() => setPortraitFailed(true)} /> : <span className="inner-monogram">AS<span>✳</span></span>}<div className="inner-portrait-caption"><strong>Anil Singh</strong><span>Independent Data Analyst<br />& Business Intelligence Consultant</span></div></div><div className="inner-about-copy"><p className="inner-about-opening">Good analytics starts with understanding the business.</p><p>I’m a Data Analytics and Business Intelligence professional with a background in Electronics and Communication Engineering and approximately three years of overall professional experience.</p><p>My work focuses on transforming business data into meaningful insights through Power BI dashboards, SQL analysis, Advanced Excel, Python, and reporting automation.</p><p>I have experience with business reporting, inventory analytics, supply chain reporting, data transformation, KPI monitoring, and dashboard development. I enjoy solving practical challenges and making complex data easier to understand.</p><div className="inner-about-principle"><span>MY APPROACH</span><p>Understand the problem. Build the right solution. Validate the results. Make it easy to use.</p></div><Link to="/contact" className="text-link">Tell me what you’re working on <ArrowUpRight size={17} /></Link></div></section>
    <section className="container inner-expertise"><div className="inner-section-top"><div><p className="eyebrow">THE TOOLKIT</p><h2>The right tools.<br /><em>For your particular challenge.</em></h2></div><p>Capabilities that connect the dots between your data and your decisions.</p></div><div className="inner-expertise-grid">{expertise.map(([title, ...tools], i) => <article key={title}><span className="inner-expertise-number">0{i + 1}</span><h3>{title}</h3><div className="inner-tags">{tools.map(tool => <span className="tag" key={tool}>{tool}</span>)}</div></article>)}</div></section>
    <section className="container inner-education"><p className="eyebrow">A FOUNDATION IN ENGINEERING</p><h2>Bachelor of Technology</h2><p>Electronics and Communication Engineering</p><span>Jodhpur Institute of Engineering and Technology · Class of 2023</span></section>
    <PageCTA />
  </>;
}

export function ProcessPage() {
  return <>
    <PageIntro eyebrow="HOW I WORK / CLEAR AT EVERY STEP" title={<>A thoughtful process.<br /><em>A practical solution.</em></>} description="You work directly with me, from the first business question to the final handover. Here’s how we turn a reporting challenge into something useful." />
    <section className="container inner-process"><div className="inner-process-intro"><p>NO GUESSWORK.<br />JUST A SHARED DIRECTION.</p><h2>Good work starts<br />with <em>understanding.</em></h2><span>Five steps. One connected process.</span><Link to="/contact" className="button button-dark">Let’s get started <ArrowUpRight size={17} /></Link></div><ol className="inner-process-steps">{processSteps.map((step, i) => <li key={step.title}><span className="inner-step-number">0{i + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p><span className="inner-step-output"><CheckCircle2 size={15} />{step.output}</span></div></li>)}</ol></section>
    <section className="container inner-process-expect"><p className="eyebrow">WHAT WORKING TOGETHER LOOKS LIKE</p><div><article><h3>Direct communication</h3><p>You work with the person building your solution. Questions, feedback, and tradeoffs stay in one conversation.</p></article><article><h3>Scope before code</h3><p>Deliverables, data access, review points, and pricing are agreed before development starts.</p></article><article><h3>A useful handover</h3><p>Documentation and a walkthrough help you understand how to use and maintain the final solution.</p></article></div></section>
    <PageCTA title={<>Have a project in mind?<br /><em>Let’s discuss it.</em></>} />
  </>;
}

export function PricingGrid() {
  return <div className="inner-pricing-grid">{packages.map((plan, i) => <article className={`inner-price-card ${i === 1 ? 'inner-price-featured' : ''}`} key={plan.name}>{i === 1 && <span className="inner-price-ribbon">A CONNECTED VIEW OF YOUR BUSINESS</span>}<span className="inner-price-number">0{i + 1}</span><h2>{plan.name}</h2><p>{plan.description}</p><div className="inner-price"><span>Starting at</span><strong>₹{plan.price}</strong><span>per project · scope dependent</span></div><ul>{plan.items.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><Link to={`/contact?service=${encodeURIComponent(plan.service)}`} className={`button ${i === 1 ? 'button-primary' : 'button-outline'}`}>{plan.cta} <ArrowUpRight size={16} /></Link></article>)}</div>;
}

export function FAQList({ limit }: { limit?: number }) {
  return <div className="inner-faq-list">{faqs.slice(0, limit || faqs.length).map((faq, i) => <details key={faq.question}><summary><span className="inner-faq-number">{String(i + 1).padStart(2, '0')}</span><span>{faq.question}</span><Plus size={19} /></summary><p>{faq.answer}</p></details>)}</div>;
}

export function PricingPage() {
  return <>
    <PageIntro eyebrow="PRICING / A CLEAR STARTING POINT" title={<>Useful solutions.<br /><em>Thoughtful investment.</em></>} description="Every business has different requirements. These starting estimates help frame the conversation; your quote is tailored to the work you actually need." />
    <section className="container inner-pricing-section"><PricingGrid /><div className="inner-pricing-notes"><h3>A few things that shape your quote.</h3><p>Final pricing depends on complexity, data quality, dataset size, number of sources, and dashboard pages. Software licensing and data refresh infrastructure are separate considerations. Monthly maintenance can be quoted separately, and international quotations are available in USD.</p></div></section>
    <section className="container inner-faq-section"><div className="inner-section-top"><div><p className="eyebrow">BEFORE WE GET STARTED</p><h2>A little more clarity.</h2></div><Link to="/contact" className="text-link">Ask me something else <ArrowUpRight size={16} /></Link></div><FAQList /></section><PageCTA />
  </>;
}

const formServices = ['Power BI Dashboard Development', 'Excel Automation', 'Data Analysis', 'SQL & Database Reporting', 'Python Automation', 'Business Intelligence', 'Other'];
const budgets = ['Below ₹5,000', '₹5,000–₹15,000', '₹15,000–₹30,000', '₹30,000–₹50,000', 'Above ₹50,000', 'International / USD quotation', 'Not decided yet'];
const timelines = ['Within 1 week', 'Within 2 weeks', 'Within 1 month', 'Flexible'];

function StaticContactPage({ service }: { service: string }) {
  const subject = service ? `${service} inquiry — Data With Anil` : 'Project inquiry — Data With Anil';
  const emailLink = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
  return <>
    <PageIntro eyebrow="CONTACT / LET’S BUILD SOMETHING USEFUL" title={<>Your next good decision<br /><em>starts with a conversation.</em></>} description="Have a reporting challenge, an analytics question, or an Excel process you’d like to simplify? Send me your project brief by email." />
    <section className="container inner-contact-layout"><aside className="inner-contact-aside"><div className="inner-contact-spark">✳</div><h2>Let’s make your<br />data work <em>for you.</em></h2><p>You don’t need a perfectly written brief. Start with the problem you’re trying to solve, and we can work out the details together.</p><a href={emailLink} className="inner-contact-email"><Mail size={20} /><span>{siteConfig.email}</span><ArrowUpRight size={18} /></a><div className="inner-contact-world"><Globe2 size={18} /><span>Based in India.<br />Open to businesses worldwide.</span></div></aside>
    <div className="inner-contact-form-wrap"><p className="eyebrow">TELL ME ABOUT YOUR PROJECT</p><h2>A useful starting point.</h2><p>Include your company, the reporting challenge, the tools you use, and your preferred timeline. If you have a budget in mind, include that too.</p><p>Please keep your first email to a project summary. We can agree how to share detailed data once we understand the scope.</p>{service && <p><strong>Service of interest:</strong> {service}</p>}<a className="button button-dark inner-submit" href={emailLink}>Email your project brief <ArrowUpRight size={18} /></a><p className="inner-form-footnote">This opens your email app. Review your message and send it there. You can also copy the email address above.</p><div className="inner-contact-expect"><h3>What happens next?</h3><ol><li>I review your requirements.</li><li>We clarify the data, scope, and goals.</li><li>You receive a tailored project proposal.</li></ol></div></div></section>
    <section className="container inner-faq-section"><div className="inner-section-top"><div><p className="eyebrow">A FEW COMMON QUESTIONS</p><h2>Before we say hello.</h2></div></div><FAQList limit={4} /></section>
  </>;
}

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service') || '';
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submissionId = useRef(crypto.randomUUID());
  const requestInFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || status === 'success') return;
    requestInFlight.current = true;
    const data = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(data.entries()), consent: data.get('consent') === 'on', submission_id: submissionId.current };
    setStatus('sending'); setMessage(''); setFieldErrors({});
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) { setFieldErrors(result?.fields || {}); throw new Error(result?.error || 'Your inquiry could not be saved. Please try again or contact me by email.'); }
      setStatus('success'); setMessage(result.message || 'Your inquiry has been received.'); setReference(result.reference || '');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error && error.name === 'AbortError' ? 'The request took longer than expected. Please retry; the same inquiry reference is retained to prevent a duplicate.' : error instanceof Error ? error.message : 'Something went wrong. Please try again or contact me by email.');
    } finally { window.clearTimeout(timeout); requestInFlight.current = false; window.setTimeout(() => feedbackRef.current?.focus(), 0); }
  }
  const errorFor = (name: string) => fieldErrors[name] ? <span className="inner-field-error" id={`${name}-error`}>{fieldErrors[name]}</span> : null;
  const fieldProps = (name: string) => ({ 'aria-invalid': !!fieldErrors[name], 'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined });
  if (siteConfig.staticHosting) return <StaticContactPage service={formServices.includes(selectedService) ? selectedService : ''} />;
  return <>
    <PageIntro eyebrow="CONTACT / LET’S BUILD SOMETHING USEFUL" title={<>Your next good decision<br /><em>starts with a conversation.</em></>} description="Have a reporting challenge, an analytics question, or an Excel process you’d like to simplify? Tell me about it." />
    <section className="container inner-contact-layout"><aside className="inner-contact-aside"><div className="inner-contact-spark">✳</div><h2>Let’s make your<br />data work <em>for you.</em></h2><p>You don’t need a perfectly written brief. Start with the problem you’re trying to solve, and we can work out the details together.</p><a href={`mailto:${siteConfig.email}`} className="inner-contact-email"><Mail size={20} /><span>{siteConfig.email}</span><ArrowUpRight size={18} /></a><div className="inner-contact-world"><Globe2 size={18} /><span>Based in India.<br />Open to businesses worldwide.</span></div><div className="inner-contact-expect"><h3>What happens next?</h3><ol><li>I review your requirements.</li><li>We clarify the data, scope, and goals.</li><li>You receive a tailored project proposal.</li></ol></div></aside>
    <div className="inner-contact-form-wrap"><div className="inner-form-top"><p className="eyebrow">TELL ME ABOUT YOUR PROJECT</p><span>* Required fields</span></div>{status === 'success' ? <div className="inner-form-success" ref={feedbackRef} tabIndex={-1} role="status"><CheckCircle2 size={42} /><h2>Thanks for reaching out.</h2><p>{message}</p>{reference && <p className="inner-reference">Reference: {reference}</p>}<button className="button button-outline" type="button" onClick={() => { submissionId.current = crypto.randomUUID(); setStatus('idle'); setMessage(''); setReference(''); }}>Start another inquiry <ArrowRight size={16} /></button></div> : <form ref={formRef} onSubmit={submitInquiry} className="inner-contact-form" aria-busy={status === 'sending'}>
      <div className="inner-form-grid"><label>Full name *<input name="full_name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={100} {...fieldProps('full_name')} />{errorFor('full_name')}</label><label>Business email *<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} {...fieldProps('email')} />{errorFor('email')}</label><label>Company name *<input name="company_name" autoComplete="organization" placeholder="Your business or organization" required minLength={2} maxLength={150} {...fieldProps('company_name')} />{errorFor('company_name')}</label><label>Country *<input name="country" autoComplete="country-name" placeholder="Where are you based?" required minLength={2} maxLength={80} {...fieldProps('country')} />{errorFor('country')}</label><label className="inner-form-full">Website <span className="inner-optional">(optional)</span><input name="website" type="url" autoComplete="url" placeholder="https://yourcompany.com" maxLength={500} {...fieldProps('website')} />{errorFor('website')}</label><label className="inner-form-full">What can I help with? *<span className="inner-select"><select name="service" defaultValue={formServices.includes(selectedService) ? selectedService : ''} required {...fieldProps('service')}><option value="" disabled>Select a service</option>{formServices.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span>{errorFor('service')}</label><label className="inner-form-full">Tell me about your project *<textarea name="project_description" placeholder="What are you working on? What would better reporting help you do?" rows={5} required minLength={20} maxLength={5000} {...fieldProps('project_description')} /><span className="inner-field-hint">At least 20 characters. Please don’t include passwords or confidential data.</span>{errorFor('project_description')}</label><label>Estimated budget *<span className="inner-select"><select name="budget" defaultValue="" required {...fieldProps('budget')}><option value="" disabled>Select a range</option>{budgets.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span>{errorFor('budget')}</label><label>Expected timeline *<span className="inner-select"><select name="timeline" defaultValue="" required {...fieldProps('timeline')}><option value="" disabled>Select a timeline</option>{timelines.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span>{errorFor('timeline')}</label><label className="inner-form-full">Preferred contact method *<span className="inner-select"><select name="contact_preference" defaultValue="Email" required {...fieldProps('contact_preference')}><option>Email</option><option>Video consultation by email</option></select><ChevronDown size={16} /></span>{errorFor('contact_preference')}</label></div>
      <div className="inner-honeypot" aria-hidden="true"><label>Leave this field empty<input name="company_website" tabIndex={-1} autoComplete="off" /></label></div><label className="inner-consent"><input name="consent" type="checkbox" required {...fieldProps('consent')} /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to being contacted about this inquiry. *</span></label>{errorFor('consent')}
      {status === 'error' && <div className="inner-form-error" role="alert" tabIndex={-1} ref={feedbackRef}>{message}</div>}
      <button className="button button-dark inner-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending your inquiry…' : 'Send Project Inquiry'}{status === 'sending' ? <span className="inner-spinner" aria-hidden="true" /> : <ArrowUpRight size={18} />}</button><p className="inner-form-footnote"><ShieldCheck size={14} />Your details are used to respond to your project inquiry.</p>
    </form>}</div></section>
    <section className="container inner-faq-section"><div className="inner-section-top"><div><p className="eyebrow">A FEW COMMON QUESTIONS</p><h2>Before we say hello.</h2></div></div><FAQList limit={4} /></section>
  </>;
}

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return <><PageIntro eyebrow="DATA WITH ANIL / THE DETAILS" title={title} description="Clear information about using this website and getting in touch." /><article className="container inner-legal">{children}<p className="inner-legal-contact">For questions, contact <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></article></>;
}

export function PrivacyPage() {
  return <LegalLayout title="Privacy Policy"><section><h2>Who handles your information</h2><p>Data With Anil is the independent consulting brand of Anil Singh. This notice explains how information submitted through this website is used.</p></section><section><h2>Information you choose to provide</h2>{siteConfig.staticHosting ? <p>The contact page links to your email app. The website does not receive or store a project inquiry when you open this link. If you send an email, Anil receives the information you choose to include through the email provider.</p> : <p>The project inquiry form collects your name, email, company, country, optional website, service interest, project description, estimated budget, timeline, preferred contact method, and consent. A submission reference and timestamp are stored with your inquiry.</p>}<p>Please do not include passwords, financial account information, personal customer records, or confidential datasets in the form.</p></section><section><h2>How your information is used</h2><p>Your details are used to understand your request, respond to you, discuss a possible engagement, and maintain relevant project correspondence. They are not submitted to an advertising mailing list by this form.</p></section><section><h2>Storage and service providers</h2>{siteConfig.staticHosting ? <p>This website is hosted on GitHub Pages. Email inquiries are handled through the email provider; there is no inquiry database or submission form on this version of the site.</p> : <p>The website uses its hosting and database providers to process and store inquiries. Access to inquiry records is restricted to the server and authorized administration. In a local development preview, submissions are stored only on the machine running that preview and are not emailed.</p>}<p>Hosting logs and anti-spam controls may process technical request information, such as IP addresses and request timing, to keep the form operational and prevent abuse.</p></section><section><h2>Retention and your choices</h2><p>Inquiry details should be kept only as long as needed for the inquiry, any resulting engagement, and applicable recordkeeping obligations. You may request access, correction, or deletion by emailing Anil using the address below. Some records may need to be retained where required for legal or contractual reasons.</p></section><section><h2>Cookies and analytics</h2><p>The default website does not enable advertising trackers or non-essential analytics. If optional Google Analytics is configured, it loads only after you choose to allow it. Page-visit measurements are sent without URL query strings or inquiry field values. Your choice is stored in this browser. Use Privacy settings to change your choice; withdrawing consent disables future tracking and clears this site’s Google Analytics cookies.</p></section><section><h2>Embedded Power BI reports</h2><p>Project pages load interactive reports from Microsoft Power BI. Your browser connects directly to Microsoft to display and interact with these reports, sending technical request information such as your IP address and browser details. Microsoft may use its own cookies or storage. These reports follow Microsoft’s privacy practices; the website’s optional Google Analytics choice does not control Microsoft Power BI.</p><p><a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a></p></section><section><h2>Changes to this notice</h2><p>This notice may be updated when the website’s services or data handling changes. Review it before sending information if you have questions about how your inquiry will be used.</p></section></LegalLayout>;
}

export function TermsPage() {
  return <LegalLayout title="Terms & Conditions"><section><h2>About this website</h2><p>This website presents the analytics and reporting capabilities of Data With Anil, the independent consulting brand of Anil Singh. Browsing this website or submitting an inquiry does not create a consulting contract.</p></section><section><h2>Project scope and quotations</h2><p>Services, deliverables, schedules, fees, payment terms, ownership, confidentiality, and support arrangements must be agreed in a separate project agreement. Published package prices are starting estimates and are not a binding quotation.</p><p>Dataset complexity, source access, software licensing, refresh infrastructure, and additional requirements can affect the final scope and price.</p></section><section><h2>Demonstrations and portfolio material</h2><p>Sample dashboard previews and the Supply Chain showcase use illustrative synthetic data. Embedded Power BI reports display the figures from their published reports and semantic models. They do not represent verified client results, investment advice, or guaranteed performance. Mention of a company or product in an independent demonstration does not imply affiliation or endorsement.</p></section><section><h2>Your data and responsibilities</h2><p>Before sharing project data, you must have the right to provide access for the agreed purpose. Use the inquiry form for a high-level description. Arrangements for transferring confidential or sensitive data should be agreed separately.</p></section><section><h2>Using the website</h2><p>Do not use the website to submit unlawful content, impersonate another person, send spam, attempt unauthorized access, or interfere with the service. You may view the published material for information about the services.</p></section><section><h2>Availability and external services</h2><p>Reasonable efforts are made to keep the website useful and accurate, but availability and uninterrupted access are not guaranteed. External tools and platforms have their own terms. The applicable project agreement governs paid deliverables and support obligations.</p></section><section><h2>Questions or corrections</h2><p>If something on the website is inaccurate or you need clarification about a proposed engagement, please get in touch before relying on it.</p></section></LegalLayout>;
}

export function NotFoundPage() {
  return <section className="container inner-not-found"><span className="eyebrow">404 / A SMALL DETOUR</span><h1>This page is<br /><em>off the chart.</em></h1><p>Let’s get you back to something useful.</p><Link to="/" className="button button-dark">Back to home <ArrowUpRight size={18} /></Link><Link to="/projects" className="text-link">Explore the projects <ArrowRight size={16} /></Link></section>;
}
