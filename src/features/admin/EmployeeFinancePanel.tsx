import React, { useState } from 'react';
import { useEmployeeFinance } from '../../context/EmployeeFinanceContext';
import { Badge } from '../../components/DataDisplays';
import { DollarSign, Percent, Gift, History, Landmark, TrendingDown } from 'lucide-react';
import type { Staff } from '../../types';

interface EmployeeFinancePanelProps {
  staffList: Staff[];
}

/**
 * Reusable card to display selected employee summary.
 */
interface EmployeeSummaryCardProps {
  staff: Staff;
}

const EmployeeSummaryCard: React.FC<EmployeeSummaryCardProps> = ({ staff }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 rounded-xl border border-blue-100/50 shadow-xs">
    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Selected Employee</span>
    <span className="text-sm font-black text-slate-800 block mt-1">{staff.name}</span>
    <span className="text-xs text-slate-500 font-medium">{staff.role} · {staff.department}</span>
  </div>
);

/**
 * Modern, industry-standard component for Employee Payroll, Loans, Arrears, and Payments.
 */
export const EmployeeFinancePanel: React.FC<EmployeeFinancePanelProps> = ({ staffList }) => {
  const {
    getSalaryDetails,
    updateSalaryDetails,
    paySalary,
    paymentHistory
  } = useEmployeeFinance();

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  // Increment/Decrement state values
  const [financeType, setFinanceType] = useState<'bonus' | 'overtime' | 'loan' | 'due' | 'decrease' | null>(null);
  const [financeAmount, setFinanceAmount] = useState<number>(0);

  const handleApplyFinance = () => {
    if (!selectedStaff || !financeType) return;
    const current = getSalaryDetails(selectedStaff.id, selectedStaff.monthlySalary);

    updateSalaryDetails(selectedStaff.id, {
      [financeType]: (current[financeType as keyof typeof current] as number || 0) + financeAmount
    });
    setFinanceAmount(0);
    setFinanceType(null);
  };

  const handlePaySalary = (stf: Staff) => {
    paySalary(stf.id, stf.name, stf.monthlySalary, payMethod);
    alert(`Salary successfully paid to ${stf.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Payroll Ledger List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Employee Payroll Ledger
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Total: {staffList.length} Registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Employee Name</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Base Salary</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Bonus & OT</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Loan / Arrears</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Deductions</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider">Net Payable</th>
                  <th className="px-3 py-3 text-slate-500 uppercase font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map(stf => {
                  const fin = getSalaryDetails(stf.id, stf.monthlySalary);
                  const netPayable = fin.baseSalary + fin.bonus + fin.overtime + fin.due - fin.decrease - fin.loan;
                  return (
                    <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-3 font-bold text-slate-800">{stf.name}</td>
                      <td className="px-3 py-3 font-mono font-medium text-slate-600">BDT {stf.monthlySalary.toLocaleString()}</td>
                      <td className="px-3 py-3 font-mono text-emerald-600 font-bold">
                        +{fin.bonus.toLocaleString()} / +{fin.overtime.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 font-mono text-amber-600 font-medium">
                        {fin.loan > 0 ? `L: -${fin.loan.toLocaleString()}` : ''} {fin.due > 0 ? `D: +${fin.due.toLocaleString()}` : ''}
                        {fin.loan === 0 && fin.due === 0 ? '—' : ''}
                      </td>
                      <td className="px-3 py-3 font-mono text-rose-500 font-medium">
                        {fin.decrease > 0 ? `-${fin.decrease.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-3 py-3 font-black text-primary font-mono text-xs">
                        BDT {Math.max(0, netPayable).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStaff(stf)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 font-bold rounded-lg text-[10px] transition-all"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handlePaySalary(stf)}
                          className="px-2.5 py-1 bg-primary text-white font-bold rounded-lg text-[10px] hover:bg-blue-700 transition-all shadow-xs"
                        >
                          Pay Salary
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Financial Actions & Calculations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Financial Allocator</h4>
            {selectedStaff ? (
              <div className="space-y-4">
                <EmployeeSummaryCard staff={selectedStaff} />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFinanceType('bonus')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'bonus' ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-100 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <Gift className="w-4 h-4 text-emerald-500" /> Add Bonus
                  </button>
                  <button
                    onClick={() => setFinanceType('overtime')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'overtime' ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-100 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <Percent className="w-4 h-4 text-blue-500" /> Overtime Pay
                  </button>
                  <button
                    onClick={() => setFinanceType('loan')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'loan' ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-100 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-rose-500" /> Issue Loan
                  </button>
                  <button
                    onClick={() => setFinanceType('due')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'due' ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-100 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <Percent className="w-4 h-4 text-amber-500" /> Add Arrears/Due
                  </button>
                  <button
                    onClick={() => setFinanceType('decrease')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center col-span-2 gap-1.5 ${
                      financeType === 'decrease' ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-100 hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-orange-500" /> Deductions / Decrease
                  </button>
                </div>

                {financeType && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Amount (BDT)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={financeAmount}
                        onChange={(e) => setFinanceAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                      <button
                        onClick={handleApplyFinance}
                        className="px-4 py-1.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10 leading-relaxed">Select an employee from the ledger list on the left to allocate salary, bonuses, dues, loans, or execute payouts.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Payout Method</h4>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Financial Services (MFS)">bKash / Nagad / Rocket (MFS)</option>
              <option value="Cash Clearance">Cash Clearance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <History className="w-5 h-5 text-primary" />
          Employee Payout History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Payout Method</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Adjustments Summary</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Total Cleared</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No payouts cleared yet. Click "Pay Salary" to trigger a transaction.</td>
                </tr>
              ) : (
                paymentHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-500">{rec.paymentDate}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{rec.employeeName}</td>
                    <td className="px-4 py-3 text-slate-600">{rec.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      Bonus: +{rec.bonusPaid.toLocaleString()} | OT: +{rec.overtimePaid.toLocaleString()} | Deductions: -{rec.deductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-800">BDT {rec.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge status="green">Cleared</Badge>
                    </td>
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
