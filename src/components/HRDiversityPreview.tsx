import { ArrowUpRight, Clock3, UserPlus, Users } from 'lucide-react';
import './hr-diversity-preview.css';

const topics = [
  { label: 'Hiring', detail: 'Female and male proportions', icon: UserPlus },
  { label: 'Promotions', detail: 'Promotions this year', icon: ArrowUpRight },
  { label: 'Turnover', detail: 'FY20 leavers', icon: Users },
  { label: 'Time in grade', detail: 'Employees promoted in FY2021', icon: Clock3 },
];

export default function HRDiversityPreview({ compact = false }: { compact?: boolean }) {
  return <div className={`hr-diversity-preview${compact ? ' hr-diversity-preview-compact' : ''}`} aria-label="Diversity and inclusion report topics">
    <div className="hr-diversity-heading"><span className="hr-diversity-icon" aria-hidden="true"><Users size={24} /></span><div><span className="hr-diversity-eyebrow">POWER BI / REPORT TOPICS</span><h3>Diversity &amp; inclusion</h3>{!compact && <p>Explore representation across hiring, promotion and turnover.</p>}</div></div>
    <div className="hr-diversity-topics">{topics.map(({ label, detail, icon: Icon }) => <div key={label}><Icon size={19} aria-hidden="true" /><h4>{label}</h4><p>{detail}</p></div>)}</div>
    {!compact && <div className="hr-diversity-filters"><span>Report filters</span><div>{['Age Group', 'Region Group', 'Job Level', 'Department'].map(filter => <span key={filter}>{filter}</span>)}</div></div>}
    <p className="hr-diversity-caption">Dashboard 1 · Dashboard 2 · Dashboard 3</p>
  </div>;
}
