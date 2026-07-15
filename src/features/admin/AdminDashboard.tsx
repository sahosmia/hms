import { useState, useMemo, useEffect } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useFinance } from '../../context/FinanceContext';
import { useClinicalBeds } from '../../context/ClinicalBedProvider';
import { useStaff } from '../../context/StaffContext';
import { useOTInventory } from '../../context/OTInventoryContext';
import { Badge } from '../../components/DataDisplays';
import { EmployeeFinancePanel } from './EmployeeFinancePanel';
import { ExpensePanel } from './ExpensePanel';
import { DiagnosticPanel } from './DiagnosticPanel';
import {
  TrendingUp, Users, DollarSign, CalendarRange, Settings,
  BellRing, PlusCircle, Trash2, Edit2, Eye, ClipboardList, ShieldAlert, Sparkles, X, Printer
} from 'lucide-react';
import type { Staff, Doctor, HospitalAsset } from '../../types';

interface AdminDashboardProps {
  initialTab?: 'analytics' | 'staff' | 'doctors' | 'assets' | 'reports' | 'diagnostics';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'analytics' }) => {
  const { appointments, doctors, addDoctor, updateDoctorDetails, deleteDoctor } = useAppointments();
  const { beds, admissions } = useClinicalBeds();
  const { weeklyRevenue, departmentRevenue, bills, postDailyBedCharges } = useFinance();
  const { staffList, addStaff, updateStaffDetails, deleteStaff } = useStaff();
  const { assets, inventory, addAsset, updateAsset, deleteAsset } = useOTInventory();

  // Primary active tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'staff' | 'doctors' | 'assets' | 'reports' | 'diagnostics'>(initialTab);
  const [subTab, setSubTab] = useState<'directory' | 'finance' | 'expenses'>('directory');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search & Filtering States
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'admitted' | 'discharged'>('All');

  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');

  const [docSearch, setDocSearch] = useState('');
  const [docSpecialtyFilter] = useState<string>('All');

  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('All');

  // Modal Views / Detail Cards
  const [viewedEntity, setViewedEntity] = useState<{ type: 'staff' | 'doctor' | 'asset' | 'patient'; data: any } | null>(null);

  // Edit/Create Modal & Forms State
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    role: 'Nurse',
    department: '',
    monthlySalary: 30000,
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    experience: 5,
    fees: 500,
    workingDays: [1, 2, 3, 4],
    holidays: [] as string[],
    availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  });

  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<HospitalAsset | null>(null);
  const [newAsset, setNewAsset] = useState<Omit<HospitalAsset, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    serialNumber: '',
    category: 'Medical Device',
    department: '',
    purchaseValue: 50000,
    purchaseDate: new Date().toISOString().split('T')[0],
    condition: 'Excellent',
    status: 'Available'
  });

  // Report Generator States
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  const handlePostBedCharges = () => {
    postDailyBedCharges();
    alert('Daily bed charges successfully posted to all active admitted patient invoices!');
  };

  // High-level quick stats
  const activeAdmissionsCount = beds.filter(b => b.status === 'Occupied').length;
  const totalRevenueEver = bills.reduce((sum, b) => sum + (b.status === 'Paid' ? b.totalAmount : 0), 0);
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

  const [sortField, setSortField] = useState<'patientName' | 'admittedAt' | 'status'>('patientName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'patientName' | 'admittedAt' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const maxWeeklyRevenue = useMemo(() => {
    return Math.max(...weeklyRevenue.map(it => it.revenue), 1);
  }, [weeklyRevenue]);

  // Filters for Patient Registry
  const filteredAdmissions = admissions.filter(adm => {
    const matchesSearch = adm.patientName.toLowerCase().includes(search.toLowerCase()) ||
                          adm.bedName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || adm.status === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    if (sortOrder === 'asc') return aVal.localeCompare(bVal);
    return bVal.localeCompare(aVal);
  });

  // Filters for Staff List
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                          s.department.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesRole = staffRoleFilter === 'All' || s.role === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filters for Doctors List
  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
                          d.specialty.toLowerCase().includes(docSearch.toLowerCase());
    const matchesSpecialty = docSpecialtyFilter === 'All' || d.specialty.includes(docSpecialtyFilter);
    return matchesSearch && matchesSpecialty;
  });

  // Filters for Assets List
  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                          a.serialNumber.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesCategory = assetCategoryFilter === 'All' || a.category === assetCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Dynamic Report generation logic
  const handleGenerateReport = () => {
    const totalBedIncome = beds.filter(b => b.status === 'Occupied').reduce((sum, b) => sum + b.dailyCharge, 0);
    const unpaidBillSum = bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.totalAmount, 0);
    const lowStockAlerts = inventory.filter(i => i.stock <= i.minStock).length;

    if (reportType === 'daily') {
      setGeneratedReport({
        title: 'Daily Hospital Operations & Financial Summary',
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        metrics: [
          { label: 'Active Inpatient Occupancy', value: `${activeAdmissionsCount} Beds Occupied`, remark: 'Healthy ward capacity' },
          { label: 'Daily Expected Bed Charge Receipts', value: `BDT ${totalBedIncome}`, remark: 'Pending automated post cycle' },
          { label: 'Pending Outpatient Consultation Bookings', value: `${pendingAppointmentsCount} Requests`, remark: 'Awaiting scheduling' },
          { label: 'Uncollected Outstanding Dues', value: `BDT ${unpaidBillSum}`, remark: 'Action required from Billing Desk' },
          { label: 'Asset Operational Readiness', value: `${assets.filter(a => a.status === 'In Use').length} / ${assets.length} In-Use`, remark: 'ECG Scanner under repair' }
        ],
        alerts: lowStockAlerts > 0 ? [`WARNING: ${lowStockAlerts} surgical consumable items have breached the safety stock threshold. Order supplies immediately.`] : ['System status: Healthy']
      });
    } else {
      setGeneratedReport({
        title: 'Monthly HMS Financial Trend Analyzer',
        date: 'For Month of ' + new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        metrics: [
          { label: 'Average Gross Revenue Margin', value: 'BDT 540,000', remark: '15% Growth compared to previous quarter' },
          { label: 'Direct Operating Capital Expenses', value: 'BDT 350,000', remark: 'Covers consumable supplies, medicine procurements' },
          { label: 'Simulated Staff Payroll Outflow', value: `BDT ${staffList.reduce((sum, s) => sum + s.monthlySalary, 0)}`, remark: `Covering ${staffList.length} registered staff members` },
          { label: 'Asset Procurement Capital Investment', value: `BDT ${assets.reduce((sum, a) => sum + a.purchaseValue, 0)}`, remark: 'Includes GE CT Scanner & Ventilators' },
          { label: 'Monthly Net Margin Estimate', value: 'BDT 190,000', remark: 'Excellent operational liquidity' }
        ],
        alerts: ['No critical financial alerts. Monthly audits completed successfully.']
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">

      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Client-Friendly Mock Shell
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mt-2">Hospital Command Center</h2>
          <p className="text-xs text-slate-500">Perform live CRUD testing on Doctors, Staff, Assets, and run instant Daily/Monthly Reports</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handlePostBedCharges}
            className="px-4 py-2.5 bg-primary hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Settings className="w-4 h-4" />
            Trigger Automated Bed Charges
          </button>
        </div>
      </div>

      {/* Main Admin Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hospital Command Analytics
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Employee Management (CRUD)
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'doctors' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Physicians & Specialists (CRUD)
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'assets' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hospital Assets & Capital (CRUD)
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily & Monthly Report Generator
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'diagnostics' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Diagnostics & Labs
        </button>
      </div>

      {/* COMMAND CENTER TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Admitted Patients</span>
                <span className="text-xl font-extrabold text-slate-800">{activeAdmissionsCount} Active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Received Revenue</span>
                <span className="text-xl font-extrabold text-emerald-600">BDT {totalRevenueEver}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <CalendarRange className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Pending Bookings</span>
                <span className="text-xl font-extrabold text-slate-800">{pendingAppointmentsCount} Requests</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Registered Doctors</span>
                <span className="text-xl font-extrabold text-slate-800">{doctors.length} Physicians</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Revenue Analytics
              </h3>
              <div className="h-[200px] flex items-end gap-3.5 sm:gap-6 pt-6 px-2">
                {weeklyRevenue.map((r, i) => {
                  const heightPercent = (r.revenue / maxWeeklyRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow-md font-sans transition-all z-10">
                        BDT {r.revenue}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-blue-100 hover:bg-primary rounded-t-lg transition-all duration-300 min-h-[10px]"
                      />
                      <span className="text-xs font-bold text-slate-500 font-sans">{r.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Departmental Allocation (Revenue Share)</h3>
              <div className="space-y-3 pt-2">
                {departmentRevenue.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span>{d.department}</span>
                      <span>BDT {d.revenue}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        style={{ width: `${Math.min(100, (d.revenue / 350000) * 100)}%` }}
                        className="bg-primary h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sortable Patient Registry */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-700">Sortable Patient Registry</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or bed..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 bg-white"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Registries</option>
                  <option value="admitted">Currently Admitted</option>
                  <option value="discharged">Discharged</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th onClick={() => handleSort('patientName')} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100">
                      Patient Name {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Bed</th>
                    <th onClick={() => handleSort('admittedAt')} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100">
                      Admission Timestamp {sortField === 'admittedAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th onClick={() => handleSort('status')} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100">
                      Current Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                  {filteredAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No registry data found.</td>
                    </tr>
                  ) : (
                    filteredAdmissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-bold">{adm.patientName}</td>
                        <td className="px-6 py-3.5">{adm.bedName}</td>
                        <td className="px-6 py-3.5 font-mono">{adm.admittedAt}</td>
                        <td className="px-6 py-3.5">
                          <Badge status={adm.status === 'admitted' ? 'red' : 'green'}>
                            {adm.status === 'admitted' ? 'Admitted' : 'Discharged'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={() => setViewedEntity({ type: 'patient', data: adm })}
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE MANAGEMENT TAB (CRUD) */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setSubTab('directory')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                subTab === 'directory' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Employee Directory
            </button>
            <button
              onClick={() => setSubTab('finance')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                subTab === 'finance' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Payroll & Payout Settings
            </button>
            <button
              onClick={() => setSubTab('expenses')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                subTab === 'expenses' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Expenditure List
            </button>
          </div>

          {subTab === 'directory' && (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Employee Management & Salaries</h3>
                  <p className="text-xs text-slate-500">Add, edit, view and manage all nurse, support, & employee records</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 bg-white"
                  />
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Nurse">Nurses</option>
                    <option value="Administrator">Admin</option>
                    <option value="Lab Technician">Lab Tech</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Pharmacist">Pharmacist</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingStaff(null);
                      setNewStaff({
                        name: '',
                        role: 'Nurse',
                        department: '',
                        monthlySalary: 30000,
                        status: 'Active',
                        joinedDate: new Date().toISOString().split('T')[0]
                      });
                      setIsAddingStaff(true);
                    }}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer hover:bg-blue-700"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Employee
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Role / Department</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Monthly Salary</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No employees found matching criteria.</td>
                      </tr>
                    ) : (
                      filteredStaff.map(stf => (
                        <tr key={stf.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3.5 font-bold text-slate-800">{stf.name}</td>
                          <td className="px-6 py-3.5">
                            <span className="block font-semibold text-slate-600">{stf.role}</span>
                            <span className="text-[10px] text-slate-400 block">{stf.department}</span>
                          </td>
                          <td className="px-6 py-3.5 font-extrabold text-slate-800">BDT {stf.monthlySalary.toLocaleString()}</td>
                          <td className="px-6 py-3.5">
                            <Badge status={stf.status === 'Active' ? 'green' : stf.status === 'On Leave' ? 'yellow' : 'red'}>
                              {stf.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setViewedEntity({ type: 'staff', data: stf })}
                              className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setEditingStaff(stf);
                                setNewStaff({
                                  name: stf.name,
                                  role: stf.role,
                                  department: stf.department,
                                  monthlySalary: stf.monthlySalary,
                                  status: stf.status,
                                  joinedDate: stf.joinedDate
                                });
                                setIsAddingStaff(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${stf.name}?`)) {
                                  deleteStaff(stf.id);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subTab === 'finance' && (
            <div className="animate-in fade-in">
              <EmployeeFinancePanel staffList={staffList} />
            </div>
          )}

          {subTab === 'expenses' && (
            <div className="animate-in fade-in">
              <ExpensePanel />
            </div>
          )}
        </div>
      )}

      {/* DIAGNOSTICS & PATHOLOGY LAB TAB */}
      {activeTab === 'diagnostics' && (
        <DiagnosticPanel />
      )}

      {/* DOCTORS DIRECTORY TAB (CRUD) */}
      {activeTab === 'doctors' && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Physicians & Consultations</h3>
              <p className="text-xs text-slate-500">Manage expert doctors, consulting fees, and schedules</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search physicians..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 bg-white"
              />
              <button
                onClick={() => {
                  setEditingDoctor(null);
                  setNewDoctor({
                    name: '',
                    specialty: '',
                    experience: 5,
                    fees: 600,
                    workingDays: [1, 2, 3, 4],
                    holidays: [],
                    availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM'],
                    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
                  });
                  setIsAddingDoctor(true);
                }}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4" /> Add Doctor
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Doctor Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Specialty & Experience</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Consulting Fee</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Patient Rating</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No physicians found.</td>
                  </tr>
                ) : (
                  filteredDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                        <img src={doc.imageUrl} alt={doc.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="block font-semibold text-slate-600">{doc.specialty}</span>
                        <span className="text-[10px] text-slate-400 block">{doc.experience} Years Experience</span>
                      </td>
                      <td className="px-6 py-3.5 font-extrabold text-slate-800">BDT {doc.fees}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-extrabold text-amber-500">★ {doc.rating}</span>
                        <span className="text-slate-400 ml-1">({doc.reviewCount} Reviews)</span>
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setViewedEntity({ type: 'doctor', data: doc })}
                          className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            setEditingDoctor(doc);
                            setNewDoctor({
                              name: doc.name,
                              specialty: doc.specialty,
                              experience: doc.experience,
                              fees: doc.fees,
                              workingDays: doc.workingDays,
                              holidays: doc.holidays,
                              availableSlots: doc.availableSlots,
                              imageUrl: doc.imageUrl || ''
                            });
                            setIsAddingDoctor(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${doc.name}?`)) {
                              deleteDoctor(doc.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOSPITAL ASSETS TAB (CRUD) */}
      {activeTab === 'assets' && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Capital Assets Ledger</h3>
              <p className="text-xs text-slate-500">Oversee intensive medical machines, ventilators, servers & maintenance schedules</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search assets..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48 bg-white"
              />
              <select
                value={assetCategoryFilter}
                onChange={(e) => setAssetCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Medical Device">Medical Devices</option>
                <option value="IT Equipment">IT Hardware</option>
                <option value="Facility Infrastructure">Facility</option>
                <option value="Diagnostic Tool">Diagnostics</option>
              </select>
              <button
                onClick={() => {
                  setEditingAsset(null);
                  setNewAsset({
                    name: '',
                    serialNumber: '',
                    category: 'Medical Device',
                    department: '',
                    purchaseValue: 150000,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    condition: 'Excellent',
                    status: 'Available'
                  });
                  setIsAddingAsset(true);
                }}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4" /> Add Asset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Asset Details</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Category / Location</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Purchase Value</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No capital assets logged in the database.</td>
                  </tr>
                ) : (
                  filteredAssets.map(ast => (
                    <tr key={ast.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-800 block">{ast.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">S/N: {ast.serialNumber}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="block font-semibold text-slate-600">{ast.category}</span>
                        <span className="text-[10px] text-slate-400 block">{ast.department}</span>
                      </td>
                      <td className="px-6 py-3.5 font-extrabold text-slate-800">BDT {ast.purchaseValue.toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col gap-1">
                          <Badge status={ast.condition === 'Excellent' || ast.condition === 'Good' ? 'green' : 'red'}>
                            {ast.condition}
                          </Badge>
                          <span className="text-[9px] text-slate-400 italic">State: {ast.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setViewedEntity({ type: 'asset', data: ast })}
                          className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            setEditingAsset(ast);
                            setNewAsset({
                              name: ast.name,
                              serialNumber: ast.serialNumber,
                              category: ast.category,
                              department: ast.department,
                              purchaseValue: ast.purchaseValue,
                              purchaseDate: ast.purchaseDate,
                              condition: ast.condition,
                              status: ast.status
                            });
                            setIsAddingAsset(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${ast.name}?`)) {
                              deleteAsset(ast.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPERATIONS & FINANCIAL REPORT GENERATOR TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-800">Operations & Financial Report Generator</h3>
            <p className="text-xs text-slate-500">Select report type and compile dynamically based on current live state to display to the hospital client</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setReportType('daily')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  reportType === 'daily' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Daily Operations Summary
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  reportType === 'monthly' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Monthly Finance Trend Analyzer
              </button>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1"
            >
              <ClipboardList className="w-4 h-4" /> Run Analytics Report
            </button>
          </div>

          {generatedReport ? (
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-800">{generatedReport.title}</h4>
                  <span className="text-xs text-slate-500 block mt-1">{generatedReport.date}</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Export / Print
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedReport.metrics.map((m: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{m.label}</span>
                    <span className="text-base font-black text-slate-800 block">{m.value}</span>
                    <p className="text-[11px] text-slate-500 italic mt-1">{m.remark}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-extrabold text-amber-800">Command Center Advisory & Alerts</h5>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4 mt-1">
                    {generatedReport.alerts.map((al: string, i: number) => (
                      <li key={i}>{al}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Click the "Run Analytics Report" button above to dynamically gather live system parameters and format a diagnostic summary.
            </div>
          )}
        </div>
      )}

      {/* DETAIL DRAWER / OVERLAY MODAL */}
      {viewedEntity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setViewedEntity(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <span className="bg-blue-100 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {viewedEntity.type} Information
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-2">
                {viewedEntity.type === 'patient' ? viewedEntity.data.patientName : viewedEntity.data.name}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              {viewedEntity.type === 'staff' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block font-bold">EMPLOYEE ID</span>
                      <span className="text-slate-800 font-mono">{viewedEntity.data.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">ROLE</span>
                      <span className="text-slate-800 font-semibold">{viewedEntity.data.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">DEPARTMENT</span>
                      <span className="text-slate-800">{viewedEntity.data.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">MONTHLY SALARY</span>
                      <span className="text-slate-800 font-extrabold text-primary">BDT {viewedEntity.data.monthlySalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">STATUS</span>
                      <Badge status={viewedEntity.data.status === 'Active' ? 'green' : 'yellow'}>{viewedEntity.data.status}</Badge>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">JOINED DATE</span>
                      <span className="text-slate-800">{viewedEntity.data.joinedDate}</span>
                    </div>
                  </div>
                </>
              )}

              {viewedEntity.type === 'doctor' && (
                <>
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                    <img src={viewedEntity.data.imageUrl} alt={viewedEntity.data.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase">{viewedEntity.data.specialty}</span>
                      <span className="text-base font-extrabold text-slate-800">{viewedEntity.data.name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block font-bold">EXPERIENCE</span>
                      <span className="text-slate-800 font-semibold">{viewedEntity.data.experience} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">CONSULTING FEE</span>
                      <span className="text-slate-800 font-extrabold text-primary">BDT {viewedEntity.data.fees}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">RATING</span>
                      <span className="text-amber-500 font-black">★ {viewedEntity.data.rating}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">WEEKLY SHIFTS</span>
                      <span className="text-slate-800 font-semibold">
                        {viewedEntity.data.workingDays.map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {viewedEntity.type === 'asset' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block font-bold">ASSET S/N</span>
                      <span className="text-slate-800 font-mono">{viewedEntity.data.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">CATEGORY</span>
                      <span className="text-slate-800 font-semibold">{viewedEntity.data.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">DEPARTMENT</span>
                      <span className="text-slate-800">{viewedEntity.data.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">PURCHASE VALUE</span>
                      <span className="text-slate-800 font-black">BDT {viewedEntity.data.purchaseValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">CONDITION</span>
                      <Badge status={viewedEntity.data.condition === 'Excellent' || viewedEntity.data.condition === 'Good' ? 'green' : 'red'}>{viewedEntity.data.condition}</Badge>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">OPERATIONAL STATUS</span>
                      <span className="text-slate-800 font-semibold">{viewedEntity.data.status}</span>
                    </div>
                  </div>
                </>
              )}

              {viewedEntity.type === 'patient' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block font-bold">PATIENT NAME</span>
                      <span className="text-slate-800 font-bold">{viewedEntity.data.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">ASSIGNED CABIN / BED</span>
                      <span className="text-slate-800 font-semibold">{viewedEntity.data.bedName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">ADMISSION DATE</span>
                      <span className="text-slate-800 font-mono">{viewedEntity.data.admittedAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">REGISTRY STATUS</span>
                      <Badge status={viewedEntity.data.status === 'admitted' ? 'red' : 'green'}>
                        {viewedEntity.data.status === 'admitted' ? 'Active Admission' : 'Discharged'}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold">CLINICAL DIAGNOSIS</span>
                      <p className="text-slate-700 italic border-l-2 border-primary/30 pl-2 py-1 mt-1 bg-slate-50">{viewedEntity.data.reason}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewedEntity(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE CREATE / EDIT MODAL */}
      {isAddingStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingStaff) {
                updateStaffDetails(editingStaff.id, newStaff);
              } else {
                addStaff(newStaff);
              }
              setIsAddingStaff(false);
              setEditingStaff(null);
            }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">
              {editingStaff ? `Edit Employee Record` : 'Register New Employee'}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Role Type</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Pharmacist">Pharmacist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU, Finance"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Monthly Salary (BDT)</label>
                  <input
                    type="number"
                    required
                    value={newStaff.monthlySalary}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, monthlySalary: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Employ Status</label>
                  <select
                    value={newStaff.status}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Joined Date</label>
                <input
                  type="date"
                  required
                  value={newStaff.joinedDate}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, joinedDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddingStaff(false);
                  setEditingStaff(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 font-bold text-xs cursor-pointer"
              >
                {editingStaff ? 'Save Changes' : 'Register Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOCTOR CREATE / EDIT MODAL */}
      {isAddingDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingDoctor) {
                updateDoctorDetails(editingDoctor.id, newDoctor);
              } else {
                addDoctor(newDoctor);
              }
              setIsAddingDoctor(false);
              setEditingDoctor(null);
            }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">
              {editingDoctor ? `Edit Physician Record` : 'Add New Hospital Physician'}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Physician Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sabrina Khan"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Clinical Specialty</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurologist"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Consultation Fees (BDT)</label>
                <input
                  type="number"
                  required
                  value={newDoctor.fees}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, fees: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Doctor Avatar URL</label>
                <input
                  type="text"
                  value={newDoctor.imageUrl}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddingDoctor(false);
                  setEditingDoctor(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 font-bold text-xs cursor-pointer"
              >
                {editingDoctor ? 'Save Changes' : 'Add Physician'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASSET CREATE / EDIT MODAL */}
      {isAddingAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingAsset) {
                updateAsset(editingAsset.id, newAsset);
              } else {
                addAsset(newAsset);
              }
              setIsAddingAsset(false);
              setEditingAsset(null);
            }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">
              {editingAsset ? `Edit Capital Asset Details` : 'Register New Capital Asset'}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GE Ultrasound"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-XXXX"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Medical Device">Medical Device</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Facility Infrastructure">Facility Infrastructure</option>
                    <option value="Diagnostic Tool">Diagnostic Tool</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Purchase Value (BDT)</label>
                  <input
                    type="number"
                    required
                    value={newAsset.purchaseValue}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseValue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Location Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radiology"
                    value={newAsset.department}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Operational Status</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddingAsset(false);
                  setEditingAsset(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 font-bold text-xs cursor-pointer"
              >
                {editingAsset ? 'Save Changes' : 'Register Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
