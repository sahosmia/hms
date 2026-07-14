import { createContext, useContext, useState, useEffect } from 'react';
import type { Surgery, InventoryItem, SupplyRequest, ConsumableItem } from '../types';

interface OTInventoryContextType {
  surgeries: Surgery[];
  inventory: InventoryItem[];
  supplyRequests: SupplyRequest[];
  scheduleSurgery: (data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    otRoom: string;
    procedure: string;
    date: string;
    surgeonFee: number;
    roomCharge: number;
    consumables: { itemId: string; quantity: number }[];
  }) => { success: boolean; message: string; surgery?: Surgery };
  updateSurgeryStatus: (id: string, status: Surgery['status']) => void;
  createSupplyRequest: (itemId: string, quantity: number, requestedBy: string) => void;
  updateSupplyRequestStatus: (id: string, status: SupplyRequest['status']) => void;
}

const OTInventoryContext = createContext<OTInventoryContextType | undefined>(undefined);

const defaultInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Surgical Gloves (Size 7.5)', category: 'Surgical Supplies', stock: 120, minStock: 30, unitPrice: 45, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'inv-2', name: 'Disposable Scalpel (No. 11)', category: 'Surgical Supplies', stock: 15, minStock: 20, unitPrice: 120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'inv-3', name: 'Suture Thread (Prolene 3-0)', category: 'Surgical Supplies', stock: 45, minStock: 15, unitPrice: 350, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'inv-4', name: 'Sterile IV Cannula (G18)', category: 'Surgical Supplies', stock: 8, minStock: 15, unitPrice: 90, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'inv-5', name: 'N95 Face Mask (Particulate)', category: 'General', stock: 200, minStock: 50, text: 'N95', unitPrice: 150, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any,
  { id: 'inv-6', name: 'Injection Ceftriaxone 1g', category: 'Medicines', stock: 90, minStock: 25, unitPrice: 220, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'inv-7', name: 'Lidocaine Injection 2%', category: 'Medicines', stock: 12, minStock: 15, unitPrice: 80, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const OTInventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surgeries, setSurgeries] = useState<Surgery[]>(() => {
    const stored = localStorage.getItem('hms_surgeries');
    return stored ? JSON.parse(stored) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const stored = localStorage.getItem('hms_inventory');
    return stored ? JSON.parse(stored) : defaultInventory;
  });

  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(() => {
    const stored = localStorage.getItem('hms_supply_requests');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('hms_surgeries', JSON.stringify(surgeries));
  }, [surgeries]);

  useEffect(() => {
    localStorage.setItem('hms_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('hms_supply_requests', JSON.stringify(supplyRequests));
  }, [supplyRequests]);

  const scheduleSurgery = (data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    otRoom: string;
    procedure: string;
    date: string;
    surgeonFee: number;
    roomCharge: number;
    consumables: { itemId: string; quantity: number }[];
  }) => {
    const consumableItems: ConsumableItem[] = [];

    const updatedInventory = [...inventory];
    for (const cons of data.consumables) {
      const invIdx = updatedInventory.findIndex(item => item.id === cons.itemId);
      if (invIdx !== -1) {
        const item = updatedInventory[invIdx];
        if (item.stock < cons.quantity) {
          return {
            success: false,
            message: `দুঃখিত, স্টক সংকটের কারণে '${item.name}' সরবরাহ করা যাচ্ছে না। স্টক আছে: ${item.stock} টি, দরকার: ${cons.quantity} টি।`
          };
        }
        updatedInventory[invIdx] = {
          ...item,
          stock: item.stock - cons.quantity,
          updatedAt: new Date().toISOString()
        };

        consumableItems.push({
          itemId: item.id,
          itemName: item.name,
          quantity: cons.quantity,
          unitPrice: item.unitPrice
        });
      }
    }

    setInventory(updatedInventory);

    const newSurgery: Surgery = {
      id: `surg-${Math.random().toString(36).substr(2, 9)}`,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      otRoom: data.otRoom,
      procedure: data.procedure,
      date: data.date,
      status: 'scheduled',
      surgeonFee: data.surgeonFee,
      roomCharge: data.roomCharge,
      consumables: consumableItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSurgeries(prev => [newSurgery, ...prev]);

    return {
      success: true,
      message: 'সার্জারি সিডিউল এবং কন্সুম্যাবলের স্টক সফলভাবে আপডেট হয়েছে।',
      surgery: newSurgery
    };
  };

  const updateSurgeryStatus = (id: string, status: Surgery['status']) => {
    setSurgeries(prev =>
      prev.map(s => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    );
  };

  const createSupplyRequest = (itemId: string, quantity: number, requestedBy: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newRequest: SupplyRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemName: item.name,
      quantity,
      requestedBy,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSupplyRequests(prev => [newRequest, ...prev]);
  };

  const updateSupplyRequestStatus = (id: string, status: SupplyRequest['status']) => {
    const req = supplyRequests.find(r => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      setInventory(prev =>
        prev.map(item => {
          if (item.id === req.itemId) {
            return {
              ...item,
              stock: item.stock + req.quantity,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        })
      );
    }

    setSupplyRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r))
    );
  };

  return (
    <OTInventoryContext.Provider value={{
      surgeries,
      inventory,
      supplyRequests,
      scheduleSurgery,
      updateSurgeryStatus,
      createSupplyRequest,
      updateSupplyRequestStatus
    }}>
      {children}
    </OTInventoryContext.Provider>
  );
};

export const useOTInventory = () => {
  const context = useContext(OTInventoryContext);
  if (!context) {
    throw new Error('useOTInventory must be used within an OTInventoryProvider');
  }
  return context;
};
