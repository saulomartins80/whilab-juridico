//src/config/routes.ts
export const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export const authRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];
export const protectedRoutes = ['/dashboard', '/profile'];
