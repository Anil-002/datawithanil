import type { DashboardVariant } from './content';

export interface PowerBIReportConfig {
  reportName?: string;
  /** Exact Publish to web URL from Power BI; a normal Share link is not a public embed. */
  publicEmbedUrl: string;
  /** Existing published report, which may require a Microsoft account and report access. */
  reportUrl?: string;
}

export const powerBIReports: Partial<Record<DashboardVariant, PowerBIReportConfig>> = {
  atliq: {
    publicEmbedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOWM5NGUxYzYtYjU1YS00Yzg1LWE5ZTEtZTAxMTEwZTU4NzEzIiwidCI6ImVkNzdkNDBmLThjMTEtNDEzZC05NmUyLTQ2N2VkZmQ3M2Q2MCJ9',
    reportUrl: 'https://app.powerbi.com/groups/me/reports/d4a3f574-4919-409a-85ec-c102df6542db?experience=power-bi',
  },
  sales: {
    publicEmbedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiNWZhYzQzYzItNGEzOS00ODdhLWI1YmQtYWExNzA2Yjg3ODQ2IiwidCI6ImVkNzdkNDBmLThjMTEtNDEzZC05NmUyLTQ2N2VkZmQ3M2Q2MCJ9',
    reportUrl: 'https://app.powerbi.com/groups/me/reports/c5390eda-c803-401f-9689-cf10c2f5aa2c?experience=power-bi',
  },
  ola: {
    publicEmbedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiZDk1YTAyZWItZDM4NC00NGE3LTk0Y2EtOTE1Y2Q1OWZiMmVhIiwidCI6ImVkNzdkNDBmLThjMTEtNDEzZC05NmUyLTQ2N2VkZmQ3M2Q2MCJ9',
    reportUrl: 'https://app.powerbi.com/groups/me/reports/a1bc1135-c67d-4685-aae9-40d2440a45b7?experience=power-bi',
  },
  insurance: {
    publicEmbedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYTY4MWVmNDMtZTE0Mi00NWFjLWEyN2UtOGEwYTc0ZDE2MTE4IiwidCI6ImVkNzdkNDBmLThjMTEtNDEzZC05NmUyLTQ2N2VkZmQ3M2Q2MCJ9',
    reportUrl: 'https://app.powerbi.com/groups/me/reports/5f1347ee-a62e-405c-bce9-072c8146f401?experience=power-bi',
  },
  hr: {
    reportName: 'HR Diversity Inclusion Dashboard',
    publicEmbedUrl: 'https://app.powerbi.com/view?r=eyJrIjoiODU1N2JjN2QtNDM3YS00YzM2LWExNTEtY2NhZjZhMDdmYjI1IiwidCI6ImVkNzdkNDBmLThjMTEtNDEzZC05NmUyLTQ2N2VkZmQ3M2Q2MCJ9',
    reportUrl: 'https://app.powerbi.com/groups/me/reports/aa3ce27d-af1b-416f-8759-88ed2584659b?experience=power-bi',
  },
};

export function getPowerBIReport(variant: DashboardVariant): PowerBIReportConfig | undefined {
  // Supply Chain keeps its existing report presentation.
  return variant === 'inventory' ? undefined : powerBIReports[variant];
}

export function getPublicEmbedUrl(report?: PowerBIReportConfig): string | undefined {
  if (!report?.publicEmbedUrl) return undefined;
  try {
    const url = new URL(report.publicEmbedUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'app.powerbi.com' || url.pathname !== '/view' || !url.searchParams.get('r')) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function getReportOpenUrl(report?: PowerBIReportConfig): string | undefined {
  const publicUrl = getPublicEmbedUrl(report);
  if (publicUrl) return publicUrl;
  if (!report?.reportUrl) return undefined;
  try {
    const url = new URL(report.reportUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'app.powerbi.com' || !/^\/groups\/[^/]+\/reports\/[^/]+\/?$/.test(url.pathname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
