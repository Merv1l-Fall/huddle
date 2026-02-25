'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
	const unsubscribe = initAuth();
	return () => unsubscribe();
  }, [initAuth]);

  return <>{children}</>;
}
