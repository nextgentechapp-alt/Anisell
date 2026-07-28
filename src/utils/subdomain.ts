/**
 * Utility to identify the current platform segment based on the active subdomain.
 */
export const getSubdomain = (): string | null => {
  const host = window.location.hostname;
  
  // For local development, treat localhost:3000 as main, and admin.localhost:3000 as admin
  // For production, yourdomain.com vs admin.yourdomain.com
  const parts = host.split('.');
  
  if (parts.length > 2) {
    return parts[0];
  }
  
  // Special case for localhost subdomains (e.g., admin.localhost)
  if (host.includes('localhost') && parts.length >= 2 && parts[0] !== 'localhost') {
     return parts[0];
  }
  
  return null;
};

export const isVercel = (): boolean => {
  return window.location.hostname.endsWith('.vercel.app');
};

export const isAdminSubdomain = (): boolean => {
  const sub = getSubdomain();
  if (sub === 'admin') return true;
  
  // Fallback for Vercel deployments where nested subdomains aren't supported
  if (isVercel() && window.location.pathname.startsWith('/admin')) {
    return true;
  }
  
  return false;
};

export const isAdminEmail = (email: string | null | undefined): boolean => {
   if (!email) return false;
   const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@anisell.com').split(',');
   return adminEmails.includes(email);
};

export const getMainDomainUrl = (): string => {
   const protocol = window.location.protocol;
   const host = window.location.host;
   
   if (isVercel()) return `${protocol}//${host}/`;
   
   const mainHost = host.replace(/^admin\./, '');
   return `${protocol}//${mainHost}`;
};

export const getAdminSubdomainUrl = (): string => {
   const protocol = window.location.protocol;
   const host = window.location.host;
   
   if (isVercel()) return `${protocol}//${host}/admin`;

   if (host.startsWith('admin.')) return `${protocol}//${host}`;
   return `${protocol}//admin.${host}`;
};
