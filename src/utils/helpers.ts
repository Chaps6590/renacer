// Utilidades de ayuda

// Parsea una fecha (string ISO o Date) como fecha local, evitando el desfase de zona horaria UTC
export const parseLocalDate = (date: Date | string): Date => {
  const str = typeof date === 'string' ? date : date.toISOString();
  const [year, month, day] = str.substring(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const calculateAttendancePercentage = (presente: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((presente / total) * 100);
};

export const getAttendanceColor = (percentage: number): string => {
  if (percentage >= 80) return 'green';
  if (percentage >= 60) return 'yellow';
  return 'red';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Acepta formatos: +54 9 11 1234-5678, 1234567890, etc.
  const re = /^[\d\s\+\-()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getRoleDisplay = (role: string): string => {
  const roles: Record<string, string> = {
    pastor: 'Pastor',
    supervisor: 'Supervisor',
    lider: 'Líder',
    colider: 'Colíder',
    timoteo: 'Líder Colab.',
  };
  return roles[role] || role;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
