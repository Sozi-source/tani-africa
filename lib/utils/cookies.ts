// lib/cookies.ts
export const setAuthCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
};

export const getAuthCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export const removeAuthCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

export const setUserCookies = (user: { id: string; email: string; role: string }) => {
  setAuthCookie('user_role', user.role);
  setAuthCookie('user_id', user.id);
  setAuthCookie('user_email', user.email);
};

export const clearUserCookies = () => {
  removeAuthCookie('user_role');
  removeAuthCookie('user_id');
  removeAuthCookie('user_email');
};