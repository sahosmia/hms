import { useState, useMemo } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useFinance } from '../../context/FinanceContext';
import { useClinicalBeds } from '../../context/ClinicalBedProvider';
import { Badge } from '../../components/DataDisplays';
import { TrendingUp, Users, DollarSign, CalendarRange, Settings, BellRing } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { appointments, doctors } = useAppointments();
  const { beds, admissions } = useClinicalBeds();
  const { weeklyRevenue, departmentRevenue, bills, postDailyBedCharges } = useFinance();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'admitted' | 'discharged'>('All');

  const handlePostBedCharges = () => {
    postDailyBedCharges();
    alert('Daily bed charges successfully posted to all active admitted patient invoices!');
  };

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

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Admin Dashboard & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live bed occupancy, hospital financial trends, and active patient registry</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePostBedCharges}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            Post Bed Charges
          </button>
        </div>
      </div>

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
                <th
                  onClick={() => handleSort('patientName')}
                  className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100"
                >
                  Patient Name {sortField === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Bed
                </th>
                <th
                  onClick={() => handleSort('admittedAt')}
                  className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100"
                >
                  Admission Timestamp {sortField === 'admittedAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100"
                >
                  Current Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Diagnosis / Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No registry data found.
                  </td>
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
                    <td className="px-6 py-3.5 italic">{adm.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
