import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Client } from '../types';

interface ClientContextType {
  clientsMap: Record<string, Client>;
  loading: boolean;
  error: string | null;
  getClientCompany: (clientId?: string, fallback?: string) => string;
  getClientDetails: (clientId?: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientsMap, setClientsMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of which IDs we are currently fetching to avoid duplicate requests
  const fetchingRefs = useRef<Set<string>>(new Set());

  const fetchClient = useCallback(async (clientId: string) => {
    if (fetchingRefs.current.has(clientId)) return;
    fetchingRefs.current.add(clientId);

    try {
      const docRef = doc(db, 'clients', clientId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const clientData = { id: docSnap.id, ...docSnap.data() } as Client;
        setClientsMap(prev => ({ ...prev, [clientId]: clientData }));
      } else {
        // Cache misses as an empty shell so we don't refetch forever
        setClientsMap(prev => ({ ...prev, [clientId]: { companyName: 'Unknown Client', id: clientId } as Client }));
      }
    } catch (err) {
      console.error('Failed to fetch client context', err);
      // Remove from fetching refs so we can retry later if needed
      fetchingRefs.current.delete(clientId);
    }
  }, []);

  const getClientCompany = useCallback((clientId?: string, fallback?: string) => {
    if (!clientId) return fallback || 'Standalone / No Client';
    
    const client = clientsMap[clientId];
    if (client) {
      return client.companyName === 'Unknown Client' && fallback ? fallback : client.companyName;
    }

    // Trigger lazy fetch if not already fetching
    fetchClient(clientId);

    return fallback || 'Loading...';
  }, [clientsMap, fetchClient]);

  const getClientDetails = useCallback((clientId?: string) => {
    if (!clientId) return undefined;
    
    if (!clientsMap[clientId]) {
      fetchClient(clientId);
    }
    
    return clientsMap[clientId];
  }, [clientsMap, fetchClient]);

  return (
    <ClientContext.Provider value={{ clientsMap, loading, error, getClientCompany, getClientDetails }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
