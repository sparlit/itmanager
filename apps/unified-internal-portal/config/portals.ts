export const PORTAL_CONFIG = [
  { id: 'administration', name: 'Administration', color: '#2C3E50', icon: 'Settings' },
  { id: 'it', name: 'Information Technology', color: '#00FF41', icon: 'Terminal' },
  { id: 'operations', name: 'Operations', color: '#2980B9', icon: 'Cpu' },
  { id: 'transport', name: 'Transport', color: '#F1C40F', icon: 'Truck' },
  { id: 'production', name: 'Production', color: '#E67E22', icon: 'Layers' },
  { id: 'finance', name: 'Finance', color: '#27AE60', icon: 'DollarSign' },
  { id: 'sales', name: 'Sales', color: '#E74C3C', icon: 'TrendingUp' },
  { id: 'marketing', name: 'Marketing', color: '#9B59B6', icon: 'Megaphone' },
  { id: 'customer_service', name: 'Customer Service', color: '#16A085', icon: 'Headset' },
  { id: 'hr', name: 'Human Resource', color: '#34495E', icon: 'Users' },
  { id: 'maintenance', name: 'Maintenance', color: '#D35400', icon: 'Wrench' },
  { id: 'business_dev', name: 'Business Development', color: '#2C3E50', icon: 'Briefcase' },
  { id: 'communications', name: 'Communications', color: '#3498DB', icon: 'MessageCircle' },
  { id: 'security', name: 'Security & Surveillance', color: '#C0392B', icon: 'Shield' },
  { id: 'housekeeping', name: 'Housekeeping', color: '#1ABC9C', icon: 'Sparkles' },
];

export type PortalID = typeof PORTAL_CONFIG[number]['id'];
