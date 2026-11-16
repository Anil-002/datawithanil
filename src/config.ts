const basePath = import.meta.env.BASE_URL;
const portrait = import.meta.env.VITE_PORTRAIT_URL || 'images/anil.webp';

export const siteConfig = {
  name: 'Data With Anil',
  founder: 'Anil Singh',
  email: 'anil0singh02@gmail.com',
  domain: (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, ''),
  basePath,
  routerBase: basePath,
  staticHosting: import.meta.env.VITE_STATIC_HOSTING === 'true',
  portraitUrl: /^(https?:|data:)/.test(portrait) ? portrait : `${basePath}${portrait.replace(/^\//, '')}`,
};
