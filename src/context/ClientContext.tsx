import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'clients'));
    
    // Set up real-time listener for the entire clients collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map: Record<string, Client> = {};
      snapshot.docs.forEach((doc) => {
        map[doc.id] = { id: doc.id, ...doc.data() } as Client;
      });
      setClientsMap(map);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error listening to clients:', err);
      setError('Failed to load clients data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getClientCompany = useCallback((clientId?: string, fallback?: string) => {
    if (!clientId) return fallback || 'Standalone / No Client';
    return clientsMap[clientId]?.companyName || fallback || 'Unknown Client';
  }, [clientsMap]);

  const getClientDetails = useCallback((clientId?: string) => {
    if (!clientId) return undefined;
    return clientsMap[clientId];
  }, [clientsMap]);

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
