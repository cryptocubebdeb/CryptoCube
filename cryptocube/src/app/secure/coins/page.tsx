'use client'

import { Suspense } from 'react';
import CoinsPageContent from './CoinsPageContent';

export default function CoinsPage() {
    return (
        <Suspense fallback={<div>Loading coins...</div>}>
            <CoinsPageContent />
        </Suspense>
    );
}