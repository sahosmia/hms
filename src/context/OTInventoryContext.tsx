import { createContext, useContext, useState, useEffect } from 'react';
import type { Surgery, InventoryItem, SupplyRequest, ConsumableItem } from '../types';

import type { HospitalAsset } from '../types';

interface OTInventoryContextType {
  surgeries: Surgery[];
  inventory: InventoryItem[];
  supplyRequests: SupplyRequest[];
  assets: HospitalAsset[];
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
  addAsset: (assetData: Omit<HospitalAsset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, assetData: Partial<Omit<HospitalAsset, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteAsset: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteInventoryItem: (id: string) => void;
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

const defaultAssets: HospitalAsset[] = [
  {
    id: 'ast-201',
    name: 'GE Revolution CT Scanner',
    serialNumber: 'SN-GE-99812-CT',
    category: 'Medical Device',
    department: 'Radiology & Imaging',
    purchaseValue: 12000000,
    purchaseDate: '2022-04-12',
    condition: 'Excellent',
    status: 'In Use',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ast-202',
    name: 'Mindray Ventilator SV300',
    serialNumber: 'SN-MR-44123-VT',
    category: 'Medical Device',
    department: 'ICU & Critical Care',
    purchaseValue: 850000,
    purchaseDate: '2023-01-20',
    condition: 'Good',
    status: 'In Use',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ast-203',
    name: 'Dell PowerEdge Admin Server',
    serialNumber: 'SN-DL-11002-SRV',
    category: 'IT Equipment',
    department: 'Information Technology',
    purchaseValue: 350000,
    purchaseDate: '2021-11-15',
    condition: 'Good',
    status: 'In Use',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ast-204',
    name: 'Philips ECG Pagewriter TC30',
    serialNumber: 'SN-PL-55911-ECG',
    category: 'Diagnostic Tool',
    department: 'Outpatient Clinic',
    purchaseValue: 500000,
    purchaseDate: '2023-09-08',
    condition: 'Needs Repair',
    status: 'Under Maintenance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
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

  const [assets, setAssets] = useState<HospitalAsset[]>(() => {
    const stored = localStorage.getItem('hms_assets');
    return stored ? JSON.parse(stored) : defaultAssets;
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

  useEffect(() => {
    localStorage.setItem('hms_assets', JSON.stringify(assets));
  }, [assets]);

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
            message: `Sorry, insufficient stock for item "${item.name}". Current Stock: ${item.stock} unit(s), Required: ${cons.quantity} unit(s).`
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
      message: 'Surgery has been scheduled and inventory stocks deducted successfully.',
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

  const addAsset = (assetData: Omit<HospitalAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: HospitalAsset = {
      ...assetData,
      id: `ast-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const updateAsset = (id: string, assetData: Partial<Omit<HospitalAsset, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setAssets(prev =>
      prev.map(ast => (ast.id === id ? { ...ast, ...assetData, updatedAt: new Date().toISOString() } : ast))
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(ast => ast.id !== id));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const updateInventoryItem = (id: string, item: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setInventory(prev =>
      prev.map(i => (i.id === id ? { ...i, ...item, updatedAt: new Date().toISOString() } : i))
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  return (
    <OTInventoryContext.Provider value={{
      surgeries,
      inventory,
      supplyRequests,
      assets,
      scheduleSurgery,
      updateSurgeryStatus,
      createSupplyRequest,
      updateSupplyRequestStatus,
      addAsset,
      updateAsset,
      deleteAsset,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem
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
