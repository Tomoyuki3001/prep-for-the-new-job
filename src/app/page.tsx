'use client';

import { TaskGenerator } from '../components/TaskGenerator';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <TaskGenerator />
    </main>
  );
}
