'use client';

import React from 'react';
import { OfflineIndicator } from './offline-indicator';
import { InstallBanner } from './install-banner';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      {children}
      <InstallBanner />
    </>
  );
}
