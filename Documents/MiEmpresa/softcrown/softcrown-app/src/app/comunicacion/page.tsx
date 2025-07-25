'use client';

import React from 'react';
import { ContactProvider } from '@/contexts/ContactContext';
import { CommunicationHub } from '@/components/contact/communication/CommunicationHub';

export default function CommunicacionPage() {
  return (
    <ContactProvider>
      <div className="min-h-screen">
        <CommunicationHub />
      </div>
    </ContactProvider>
  );
}


