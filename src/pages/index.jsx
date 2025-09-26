// src/App.jsx
import Layout from './Layout';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../components/lib/queryClient';
import { FamilyProvider } from '../components/context/FamilyContext';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FamilyProvider>
        <Layout />
      </FamilyProvider>
    </QueryClientProvider>
  );
}