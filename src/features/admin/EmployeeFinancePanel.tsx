import React, { useState } from 'react';
import { useEmployeeFinance } from '../../context/EmployeeFinanceContext';
import { Badge } from '../../components/DataDisplays';
import { DollarSign, Percent, Gift, History, Landmark, TrendingDown } from 'lucide-react';
import type { Staff } from '../../types';

interface EmployeeFinancePanelProps {
  staffList: Staff[];
}

export const EmployeeFinancePanel: React.FC<EmployeeFinancePanelProps> = ({ staffList }) => {
  const {
    getSalaryDetails,
    updateSalaryDetails,
    paySalary,
    paymentHistory
  } = useEmployeeFinance();

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  // Increments / Decrements Modals
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

        {/* Left Column: List Employees & Financial State */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-primary" />
            Employee Payroll Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Employee</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Base (BDT)</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Bonus / OT</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Loan / Due</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Decrease</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold">Net Payable</th>
                  <th className="px-3 py-2 text-slate-500 uppercase font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map(stf => {
                  const fin = getSalaryDetails(stf.id, stf.monthlySalary);
                  const netPayable = fin.baseSalary + fin.bonus + fin.overtime + fin.due - fin.decrease - fin.loan;
                  return (
                    <tr key={stf.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-bold">{stf.name}</td>
                      <td className="px-3 py-2.5 font-mono">BDT {stf.monthlySalary.toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono text-emerald-600">
                        +{fin.bonus.toLocaleString()} / +{fin.overtime.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-amber-600">
                        {fin.loan > 0 ? `L: -${fin.loan.toLocaleString()}` : ''} {fin.due > 0 ? `D: +${fin.due.toLocaleString()}` : ''}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-rose-500">
                        -{fin.decrease.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 font-black text-primary font-mono">
                        BDT {Math.max(0, netPayable).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStaff(stf)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-[10px]"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handlePaySalary(stf)}
                          className="px-2 py-1 bg-primary text-white font-extrabold rounded-lg text-[10px] hover:bg-blue-700"
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

        {/* Right Column: Dynamic Action Card / Calculator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Financial Allocator</h4>
            {selectedStaff ? (
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50">
                  <span className="text-[10px] text-slate-400 font-bold block">Selected Employee</span>
                  <span className="text-sm font-extrabold text-slate-800 block">{selectedStaff.name}</span>
                  <span className="text-xs text-slate-500">{selectedStaff.role} · {selectedStaff.department}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFinanceType('bonus')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'bonus' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Gift className="w-4 h-4" /> Add Bonus
                  </button>
                  <button
                    onClick={() => setFinanceType('overtime')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'overtime' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Percent className="w-4 h-4" /> Overtime Pay
                  </button>
                  <button
                    onClick={() => setFinanceType('loan')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'loan' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Landmark className="w-4 h-4" /> Issue Loan
                  </button>
                  <button
                    onClick={() => setFinanceType('due')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                      financeType === 'due' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Percent className="w-4 h-4" /> Add Arrears/Due
                  </button>
                  <button
                    onClick={() => setFinanceType('decrease')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center col-span-2 gap-1.5 ${
                      financeType === 'decrease' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" /> Decrease / Deductions
                  </button>
                </div>

                {financeType && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block">Amount in BDT</label>
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
                        className="px-4 py-1.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Select an employee from the ledger list on the left to allocate salary, bonuses, dues, loans, or execute payouts.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Payout Method</h4>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Financial Services (MFS)">bKash / Nagad / Rocket (MFS)</option>
              <option value="Cash Clearance">Cash Clearance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment History Log */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <History className="w-5 h-5 text-primary" />
          Employee Payout History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase">Date</th>
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase">Employee</th>
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase">Payout Method</th>
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase">Inc. / Dec. Adjustments</th>
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase">Total Cleared</th>
                <th className="px-4 py-2.5 text-slate-500 font-bold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No payouts cleared yet. Click "Pay Salary" to trigger a bank transaction.</td>
                </tr>
              ) : (
                paymentHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 font-sans">
                    <td className="px-4 py-3 font-mono">{rec.paymentDate}</td>
                    <td className="px-4 py-3 font-bold">{rec.employeeName}</td>
                    <td className="px-4 py-3">{rec.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-500">
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
