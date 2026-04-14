export interface CustomerSession {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  area?: string | null;
}

const CUSTOMER_SESSION_KEY = "laundry-customer-session";

export function readCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export function writeCustomerSession(customer: CustomerSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
}

export function clearCustomerSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
}
