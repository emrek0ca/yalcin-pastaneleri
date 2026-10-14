'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, VERIFIED_BRANCHES } from '@yalcin/shared';

interface BranchContextType {
  selectedBranch: Branch;
  setSelectedBranchId: (id: string) => void;
  branches: Branch[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranchId, setSelectedBranchIdState] = useState<string>('raufbey');

  useEffect(() => {
    const saved = localStorage.getItem('yalcin_selected_branch');
    if (saved && VERIFIED_BRANCHES.some((b) => b.id === saved)) {
      setSelectedBranchIdState(saved);
    }
  }, []);

  const setSelectedBranchId = (id: string) => {
    setSelectedBranchIdState(id);
    localStorage.setItem('yalcin_selected_branch', id);
  };

  const selectedBranch =
    VERIFIED_BRANCHES.find((b) => b.id === selectedBranchId) || VERIFIED_BRANCHES[0];

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranchId, branches: VERIFIED_BRANCHES }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
