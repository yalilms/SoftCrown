'use client';

import React from 'react';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { ContactProvider } from '@/contexts/ContactContext';

export default function CRMPage() {
  return (
    <ContactProvider>
      <div className="min-h-screen">
        <CRMDashboard />
      </div>
    </ContactProvider>
  );
}


