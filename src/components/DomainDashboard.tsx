import { useId, useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, ChevronDown, Circle, Package, ShieldCheck, SlidersHorizontal, Truck } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './dashboard.css';

export type DashboardVariant = 'inventory' | 'atliq' | 'sales' | 'ola' | 'insurance' | 'hr';
export interface DashboardProps { variant?: DashboardVariant; compact?: boolean; interactive?: boolean }
type Period = 'year' | 'first' | 'second';
type Region = 'All regions' | 'North' | 'South' | 'East' | 'West';
type Row = {
  month: number; region: Region; category: number; sales: number; orders: number; customers: number; rating: number;
  onTime: number; inFull: number; otif: number; orderedUnits: number; deliveredUnits: number;
  stock: number; shipped: number; expiry: number; unitCost: number;
  headcount: number; exits: number; tenure: number; income: number;
  cases: number; approved: number; claimsInitiated: number; claimsPaid: number; slaMet: number; dischargeHours: number;
};
type Metric = { label: string; value: string; detail: string };
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const regions: Region[] = ['North', 'South', 'East', 'West'];
const configurations = {
  inventory: { title: 'Inventory control room', subtitle: 'Stock coverage, replenishment and expiry risk.', categories: ['Beverage group', 'Ambient foods', 'Chilled products'], categoryLabel: 'All product groups', filterLabel: 'Product group', line: 'Monthly dispatch volume', region: 'Stock by region', distribution: 'Stock mix', unit: 'Units', money: false, percentage: false, color: '#179c94', colors: ['#179c94', '#e0ae56', '#92bdba'] },
  atliq: { title: 'Delivery service performance', subtitle: 'On time. In full. A connected view of customer service.', categories: ['Dairy', 'Beverages', 'Food'], categoryLabel: 'All product groups', filterLabel: 'Product group', line: 'Monthly OTIF performance', region: 'OTIF by region', distribution: 'Order mix', unit: 'OTIF %', money: false, percentage: true, color: '#486b52', colors: ['#486b52', '#91ad82', '#d4b56b'] },
  sales: { title: 'Blinkit commerce performance', subtitle: 'Sales, customers and feedback in one retail view.', categories: ['Grocery', 'Snacks', 'Household'], categoryLabel: 'All product groups', filterLabel: 'Product group', line: 'Monthly sales', region: 'Sales by region', distribution: 'Order mix', unit: 'Sales · INR', money: true, percentage: false, color: '#c89a23', colors: ['#d5a324', '#3f614b', '#a8b7a2'] },
  ola: { title: 'Rider workforce intelligence', subtitle: 'Rider retention, tenure, earnings and performance.', categories: ['Secondary', 'Graduate', 'Postgraduate'], categoryLabel: 'All education groups', filterLabel: 'Education', line: 'Monthly rider headcount', region: 'Riders by region', distribution: 'Rider education mix', unit: 'Riders', money: false, percentage: false, color: '#967347', colors: ['#967347', '#7a8e8a', '#ddc39d'] },
  insurance: { title: 'Healthcare claims intelligence', subtitle: 'Approval, payment and service levels across claims.', categories: ['General care', 'Surgical care', 'Specialist care'], categoryLabel: 'All care groups', filterLabel: 'Care group', line: 'Monthly approved claims', region: 'Approval rate by region', distribution: 'Case specialty mix', unit: 'Approved cases', money: false, percentage: false, color: '#6377a4', colors: ['#6377a4', '#9aaed0', '#a4bfa9'] },
  hr: { title: 'Employee attrition intelligence', subtitle: 'Workforce composition and employee retention.', categories: ['Operations', 'Sales', 'Technology'], categoryLabel: 'All departments', filterLabel: 'Department', line: 'Monthly employee headcount', region: 'Headcount by region', distribution: 'Department mix', unit: 'Employees', money: false, percentage: false, color: '#837099', colors: ['#837099', '#bca7cc', '#9fb3a6'] },
};

// These deterministic records are independently generated demonstration data.
// No numeric business values, source data rows, or personal records are imported
// from any PBIX. Inventory quantities and costs are newly generated as well.
const sampleData: Row[] = months.flatMap((_, month) => regions.flatMap((region, ri) => [0, 1, 2].map(category => {
  const season = [0.93, 0.87, 1.02, 0.97, 1.08, 1.04, 1.13, 1.09, 1.19, 1.15, 1.31, 1.27][month];
  const orders = Math.round((137 + ri * 29 + category * 38) * season);
  const onTime = Math.round(orders * (0.83 + month * 0.005 - ri * 0.014));
  const inFull = Math.round(orders * (0.91 - category * 0.023 + month * 0.002));
  // OTIF is an intersection and remains at or below both service numerators.
  const otif = Math.max(0, onTime + inFull - orders + Math.round((orders - Math.max(onTime, inFull)) * 0.37));
  const orderedUnits = orders * (5 + category);
  const stock = Math.round((497 + ri * 173 + category * 251 + month * 13) * (category === 2 ? 0.71 : 1));
  const shipped = Math.round((294 + ri * 82 + category * 130) * season);
  const headcount = 47 + ri * 7 + category * 13 + Math.floor(month / 4);
  const cases = Math.round((61 + ri * 17 + category * 26) * season);
  const approved = Math.round(cases * (0.87 - category * 0.025 + month * 0.002));
  const claimsInitiated = cases * (14700 + category * 3800 + ri * 900);
  return { month, region, category, orders, sales: orders * (163 + category * 57 + ri * 11), customers: Math.round(orders * 0.68), rating: 3.8 + category * 0.13 + ri * 0.07,
    onTime, inFull, otif, orderedUnits, deliveredUnits: Math.round(orderedUnits * (0.93 - category * 0.014 + month * 0.001)),
    stock, shipped, expiry: Math.round(stock * (0.019 + category * 0.026)), unitCost: 37 + category * 24 + ri * 3,
    headcount, exits: (month + ri * 2 + category) % 5 === 0 ? 2 : 0, tenure: 1.7 + category * 0.7 + ri * 0.23 + month * 0.04, income: 21400 + category * 2900 + ri * 1600 + month * 180,
    cases, approved, claimsInitiated, claimsPaid: Math.round(claimsInitiated * (0.68 - category * 0.025 + ri * 0.013)), slaMet: Math.round(cases * (0.79 + month * 0.009 - category * 0.016)), dischargeHours: 11.3 + category * 4.7 + ri * 1.2 - month * 0.16,
  };
})));
const number = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
const abbreviated = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const money = (value: number) => `₹${abbreviated(value)}`;
const percentage = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator * 100 : 0;
const total = (rows: Row[], key: keyof Row) => rows.reduce((sum, row) => sum + Number(row[key]), 0);
const weighted = (rows: Row[], key: 'tenure' | 'income' | 'rating' | 'dischargeHours', weight: 'headcount' | 'orders' | 'cases') => rows.reduce((sum, row) => sum + row[key] * row[weight], 0) / total(rows, weight);

export default function Dashboard({ variant = 'sales', compact = false, interactive = true }: DashboardProps) {
  const id = useId().replace(/:/g, '');
  const [period, setPeriod] = useState<Period>('year');
  const [region, setRegion] = useState<Region>('All regions');
  const [category, setCategory] = useState('all');
  const config = configurations[variant];
  const analysis = useMemo(() => {
    const data = sampleData.filter(row => (period === 'year' || (period === 'first' ? row.month < 6 : row.month >= 6)) && (region === 'All regions' || row.region === region) && (category === 'all' || row.category === Number(category)));
    const activeMonths = [...new Set(data.map(row => row.month))];
    const lastMonth = Math.max(...activeMonths);
    const snapshot = data.filter(row => row.month === lastMonth);
    const headcount = total(snapshot, 'headcount');
    const orders = total(data, 'orders');
    const stock = total(snapshot, 'stock');
    const expiry = total(snapshot, 'expiry');
    const weeklyRunRate = total(snapshot, 'shipped') / 4.345;
    let kpis: Metric[];
    if (variant === 'inventory') {
      kpis = [
        { label: 'Stock on hand', value: number(stock), detail: `${months[lastMonth]} closing units` },
        { label: 'Weekly run rate', value: number(weeklyRunRate), detail: 'Latest month dispatch / 4.345' },
        { label: 'Weeks of cover', value: `${(stock / weeklyRunRate).toFixed(1)} wk`, detail: 'Closing stock / weekly demand' },
        { label: 'Expiry exposure', value: money(snapshot.reduce((sum, row) => sum + row.expiry * row.unitCost, 0)), detail: 'At-risk units × sample unit cost' },
      ];
    } else if (variant === 'atliq') {
      kpis = [
        { label: 'On-time delivery', value: `${percentage(total(data, 'onTime'), orders).toFixed(1)}%`, detail: 'On-time / total orders' },
        { label: 'In-full delivery', value: `${percentage(total(data, 'inFull'), orders).toFixed(1)}%`, detail: 'In-full / total orders' },
        { label: 'On time & in full', value: `${percentage(total(data, 'otif'), orders).toFixed(1)}%`, detail: 'Both conditions / total orders' },
        { label: 'Volume fill rate', value: `${percentage(total(data, 'deliveredUnits'), total(data, 'orderedUnits')).toFixed(1)}%`, detail: 'Delivered / ordered units' },
      ];
    } else if (variant === 'sales') {
      const sales = total(data, 'sales');
      kpis = [
        { label: 'Total sales', value: money(sales), detail: 'Selected period · INR' },
        { label: 'Customer orders', value: number(orders), detail: 'Selected product groups' },
        { label: 'Monthly customers', value: number(total(snapshot, 'customers')), detail: `${months[lastMonth]} active customer snapshot` },
        { label: 'Average rating', value: `${weighted(data, 'rating', 'orders').toFixed(2)} / 5`, detail: 'Weighted by selected orders' },
      ];
    } else if (variant === 'insurance') {
      const cases = total(data, 'cases');
      kpis = [
        { label: 'Total cases', value: number(cases), detail: 'Selected period' },
        { label: 'Approval rate', value: `${percentage(total(data, 'approved'), cases).toFixed(1)}%`, detail: 'Approved / total cases' },
        { label: 'Claims paid', value: money(total(data, 'claimsPaid')), detail: 'Selected period · INR' },
        { label: 'SLA compliance', value: `${percentage(total(data, 'slaMet'), cases).toFixed(1)}%`, detail: 'Within SLA / total cases' },
      ];
    } else {
      kpis = [
        { label: variant === 'ola' ? 'Active riders' : 'Employee headcount', value: number(headcount), detail: `${months[lastMonth]} closing snapshot` },
        { label: variant === 'ola' ? 'Rider exits' : 'Employee exits', value: number(total(data, 'exits')), detail: 'Selected period' },
        { label: 'Attrition rate', value: `${percentage(total(data, 'exits'), total(data, 'headcount') / activeMonths.length).toFixed(1)}%`, detail: 'Exits / mean monthly headcount' },
        { label: 'Average tenure', value: `${weighted(snapshot, 'tenure', 'headcount').toFixed(1)} yrs`, detail: 'Weighted by closing headcount' },
      ];
    }
    const line = activeMonths.map(month => {
      const rows = data.filter(row => row.month === month);
      return { month: months[month], value: variant === 'inventory' ? total(rows, 'shipped') : variant === 'atliq' ? percentage(total(rows, 'otif'), total(rows, 'orders')) : variant === 'sales' ? total(rows, 'sales') : variant === 'insurance' ? total(rows, 'approved') : total(rows, 'headcount') };
    });
    const bars = regions.filter(item => region === 'All regions' || item === region).map(name => {
      const rows = (variant === 'hr' || variant === 'ola' || variant === 'inventory' ? snapshot : data).filter(row => row.region === name);
      return { name, value: variant === 'inventory' ? total(rows, 'stock') : variant === 'atliq' ? percentage(total(rows, 'otif'), total(rows, 'orders')) : variant === 'insurance' ? percentage(total(rows, 'approved'), total(rows, 'cases')) : variant === 'sales' ? total(rows, 'sales') : total(rows, 'headcount') };
    });
    const distributionData = ['inventory', 'hr', 'ola'].includes(variant) ? snapshot : data;
    const distribution = config.categories.map((name, i) => ({ name, value: total(distributionData.filter(row => row.category === i), variant === 'inventory' ? 'stock' : variant === 'hr' || variant === 'ola' ? 'headcount' : variant === 'insurance' ? 'cases' : 'orders'), color: config.colors[i] })).filter(item => item.value > 0);
    const coverage = config.categories.map((name, i) => {
      const rows = snapshot.filter(row => row.category === i);
      const units = total(rows, 'stock'), demand = total(rows, 'shipped') / 4.345;
      const weeks = demand > 0 ? units / demand : 0;
      return { name, stock: units, weeks, expiry: total(rows, 'expiry'), replenishment: Math.max(0, Math.ceil(demand * 6 - units)), status: weeks < 4 ? 'Replenish' : weeks > 8 ? 'Overstock' : 'Balanced' };
    }).filter(row => row.stock > 0);
    const health = [{ name: 'Available stock', value: stock - expiry, color: '#24b6aa' }, { name: 'Expiry watch', value: expiry, color: '#e8b763' }];
    return { kpis, line, bars, distribution, coverage, health, stock, expiry, lastMonth, weeklyRunRate, averageIncome: weighted(snapshot, 'income', 'headcount'), averageRating: weighted(snapshot, 'rating', 'headcount'), dischargeHours: weighted(data, 'dischargeHours', 'cases'), unpaidClaims: total(data, 'claimsInitiated') - total(data, 'claimsPaid'), totalDistribution: distribution.reduce((sum, item) => sum + item.value, 0) };
  }, [variant, period, region, category, config]);
  const summary = `${config.title}. ${period === 'year' ? 'Full year' : period === 'first' ? 'January to June' : 'July to December'}. ${region}. ${category === 'all' ? config.categoryLabel : config.categories[Number(category)]}. ${analysis.kpis.map(item => `${item.label}: ${item.value}`).join('. ')}. All figures are newly generated synthetic demonstration data.`;
  const filters = interactive && !compact && <div className="dash-filters">
    <label><span>Period</span><div className="dash-select"><select aria-label="Dashboard period" value={period} onChange={event => setPeriod(event.target.value as Period)}><option value="year">Full year</option><option value="first">First half</option><option value="second">Second half</option></select><ChevronDown size={12}/></div></label>
    <label><span>Region</span><div className="dash-select"><select aria-label="Dashboard region" value={region} onChange={event => setRegion(event.target.value as Region)}><option>All regions</option>{regions.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={12}/></div></label>
    <label><span>{config.filterLabel}</span><div className="dash-select"><select aria-label="Dashboard category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">{config.categoryLabel}</option>{config.categories.map((item,i) => <option key={item} value={i}>{item}</option>)}</select><ChevronDown size={12}/></div></label>
    <span className="dash-filter-hint">Try the filters <ArrowUpRight size={13}/></span>
  </div>;

  if (variant === 'inventory') {
    const maxDispatch = Math.max(...analysis.line.map(row => row.value));
    return <div className={`dashboard inventory-room${compact ? ' dashboard-compact' : ''}`} data-dashboard={variant}>
      <div className="inventory-rail"><span className="inventory-rail-logo"><Package size={19}/></span><span className="inventory-rail-active"><BarChart3 size={18}/></span><Truck size={17}/><ShieldCheck size={17}/><span className="inventory-rail-caption">CONTROL ROOM</span></div>
      <div className="inventory-workspace"><div className="inventory-header"><div><span className="inventory-brand">DATA WITH ANIL <span> / SUPPLY INTELLIGENCE</span></span><h3>Inventory control room<span className="inventory-live-dot"/></h3><p>leading food and beverage retail organization</p></div><span className="inventory-sample">SYNTHETIC DATA</span></div>
        <div className="inventory-content">{filters}<div className="inventory-kpis">{analysis.kpis.map((item,i) => <div className={`inventory-kpi inventory-kpi-${i}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></div>)}</div>
          <div className="inventory-grid"><section className="inventory-dispatch"><div className="inventory-panel-heading"><h4>Dispatch pulse</h4><span>Selected period · units</span></div><div className="inventory-column-chart" role="img" aria-label={`Monthly synthetic dispatch units: ${analysis.line.map(row => `${row.month}: ${number(row.value)}`).join(', ')}`}>{analysis.line.map(row => <div className="inventory-column" key={row.month}><div><span style={{height:`${row.value/maxDispatch*100}%`}} title={`${row.month}: ${number(row.value)} units`}/></div><small>{row.month}</small></div>)}</div><div className="inventory-chart-caption"><span><i/>Dispatch units</span><span>New sample figures</span></div></section>
            <section className="inventory-stock-health"><div className="inventory-panel-heading"><h4>Stock health</h4><span>{months[analysis.lastMonth]} snapshot</span></div><strong>{percentage(analysis.stock-analysis.expiry,analysis.stock).toFixed(1)}<small>%</small></strong><p>Closing stock outside expiry watch</p><div className="inventory-health-track" role="img" aria-label={`Available stock ${number(analysis.stock-analysis.expiry)} units, expiry watch ${number(analysis.expiry)} units`}>{analysis.health.map(row => <span key={row.name} style={{width:`${percentage(row.value,analysis.stock)}%`,background:row.color}}/>)}</div><div className="inventory-health-legend">{analysis.health.map(row => <span key={row.name}><i style={{background:row.color}}/>{row.name}<b>{number(row.value)}</b></span>)}</div></section>
            {!compact && <section className="inventory-coverage"><div className="inventory-panel-heading"><h4>Coverage & replenishment</h4><span>Planning target: 6 weeks</span></div><div className="inventory-table-wrap"><table><thead><tr><th>Product group</th><th>Closing units</th><th>Cover</th><th>Reorder units</th><th>Stock signal</th></tr></thead><tbody>{analysis.coverage.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{number(row.stock)}</td><td><span className="inventory-cover-bar"><i style={{width:`${Math.min(row.weeks/10*100,100)}%`}}/></span>{row.weeks.toFixed(1)} wk</td><td>{number(row.replenishment)}</td><td><span className={`inventory-signal ${row.status.toLowerCase()}`}>{row.status}</span></td></tr>)}</tbody></table></div><p>Reorder units = max(weekly run rate × planning target − closing stock, 0). Below 4 weeks: replenish; above 8 weeks: overstock.</p></section>}
          </div><div className="inventory-footer"><span><Circle size={6} fill="currentColor"/>All figures replaced · illustrative dataset</span><span>{compact ? 'Portfolio preview' : 'Interactive inventory demo'}</span></div>
        </div></div><p className="dash-sr-only" aria-live="polite" aria-atomic="true">{summary}</p>
    </div>;
  }

  const displayValue = (value: number) => config.money ? money(value) : config.percentage ? `${value.toFixed(1)}%` : number(value);
  const maxBar = Math.max(...analysis.bars.map(item => item.value));
  const regionPercentage = config.percentage || variant === 'insurance';
  return <div className={`dashboard dashboard-${variant}${compact ? ' dashboard-compact' : ''}`} data-dashboard={variant}>
    <div className="dash-toolbar"><div className="dash-brand"><span className="dash-logo" style={{background:config.colors[1]}}><BarChart3 size={14} strokeWidth={2.4}/></span><strong>DATA <span>WITH</span> ANIL</strong><span className="dash-divider"/><span className="dash-workspace">Business intelligence</span></div><span className="dash-live"><span/>Synthetic data</span></div>
    <div className="dash-body"><div className="dash-title-row"><div><span className="dash-overline">DOMAIN-FOCUSED ANALYTICS</span><h3>{config.title}</h3>{!compact && <p>{config.subtitle}</p>}</div><span className="dash-round-icon"><SlidersHorizontal size={17}/></span></div>{filters}<div className="dash-kpis">{analysis.kpis.map((item,i) => <div className={`dash-kpi${i===0 ? ' dash-kpi-featured' : ''}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small><span className="dash-small-dot"/>{item.detail}</small></div>)}</div>
      {variant === 'ola' && !compact && <div className="dash-workforce-context"><span>Average rider income <strong>{money(analysis.averageIncome)} / month</strong></span><span>Average rider rating <strong>{analysis.averageRating.toFixed(2)} / 5</strong></span><span>Latest snapshot · synthetic</span></div>}
      {variant === 'insurance' && !compact && <div className="dash-workforce-context"><span>Average discharge turnaround <strong>{analysis.dischargeHours.toFixed(1)} hours</strong></span><span>Initiated less paid amount <strong>{money(analysis.unpaidClaims)}</strong></span><span>Selected period · synthetic</span></div>}
      <div className="dash-charts"><div className="dash-panel dash-line-panel"><div className="dash-panel-title"><h4>{config.line}</h4><span><i style={{background:config.color}}/>{config.unit}</span></div><div className="dash-line-chart" role="img" aria-label={`${config.line}: ${analysis.line.map(item => `${item.month} ${displayValue(item.value)}`).join(', ')}.`}><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={analysis.line} margin={{top:10,right:5,left:-27,bottom:0}} accessibilityLayer={!compact}><defs><linearGradient id={`chart-fill-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={config.color} stopOpacity={0.25}/><stop offset="95%" stopColor={config.color} stopOpacity={0.01}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#ece9e1" strokeDasharray="3 4"/><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill:'#858279',fontSize:compact?8:10}} interval={compact?2:'preserveStartEnd'} minTickGap={18} dy={6}/><YAxis tickLine={false} axisLine={false} tick={{fill:'#858279',fontSize:compact?8:10}} tickFormatter={value => config.money ? money(Number(value)) : config.percentage ? `${Number(value).toFixed(0)}%` : abbreviated(Number(value))} tickCount={4} domain={config.percentage ? [0,100] : [0,'auto']}/>{!compact && <Tooltip contentStyle={{border:'1px solid #e4e0d6',borderRadius:9,fontSize:12,boxShadow:'0 4px 16px #28272310'}} formatter={value => [displayValue(Number(value)),config.unit]}/>}<Area type="monotone" dataKey="value" stroke={config.color} strokeWidth={2.5} fill={`url(#chart-fill-${id})`} isAnimationActive={false} activeDot={{r:4,fill:config.color,stroke:'#fff',strokeWidth:2}}/></AreaChart></ResponsiveContainer></div></div>
        <div className="dash-panel dash-distribution-panel"><div className="dash-panel-title"><h4>{config.distribution}</h4><span>•••</span></div><div className="dash-distribution-content"><div className="dash-donut" role="img" aria-label={analysis.distribution.map(item => `${item.name} ${percentage(item.value,analysis.totalDistribution).toFixed(1)} percent`).join(', ')}><ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart accessibilityLayer={!compact}><Pie data={analysis.distribution} dataKey="value" nameKey="name" innerRadius="69%" outerRadius="91%" paddingAngle={4} stroke="none" isAnimationActive={false}>{analysis.distribution.map(item => <Cell key={item.name} fill={item.color}/>)}</Pie>{!compact && <Tooltip contentStyle={{border:'1px solid #e4e0d6',borderRadius:9,fontSize:12}} formatter={value => number(Number(value))}/>}</PieChart></ResponsiveContainer><div className="dash-donut-label"><strong>{abbreviated(analysis.totalDistribution)}</strong><span>{variant === 'hr' ? 'employees' : variant === 'ola' ? 'riders' : variant === 'insurance' ? 'cases' : 'orders'}</span></div></div><div className="dash-legend">{analysis.distribution.map(item => <div key={item.name}><span><i style={{backgroundColor:item.color}}/>{item.name}</span><b>{percentage(item.value,analysis.totalDistribution).toFixed(0)}%</b></div>)}</div></div></div>
        {!compact && <div className="dash-panel dash-regions-panel"><div className="dash-panel-title"><h4>{config.region}</h4><span>{analysis.bars.length} {analysis.bars.length===1 ? 'region' : 'regions'}</span></div><div className="dash-region-bars">{analysis.bars.map((item,i) => <div className="dash-region-item" key={item.name}><div><span>{item.name}</span><strong>{regionPercentage ? `${item.value.toFixed(1)}%` : displayValue(item.value)}</strong></div><span className="dash-bar-track"><span style={{width:`${item.value/(regionPercentage?100:maxBar)*100}%`,backgroundColor:config.colors[i%3]}}/></span></div>)}</div></div>}
      </div><div className="dash-bottom"><span><Circle size={6} fill="currentColor"/>Illustrative dashboard · fictional dataset</span><span>{interactive && !compact ? 'Interactive demo' : 'Sample preview'}</span></div>
    </div><p className="dash-sr-only" aria-live="polite" aria-atomic="true">{summary}</p>
  </div>;
}
