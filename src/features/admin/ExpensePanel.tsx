import React, { useState } from 'react';
import { useEmployeeFinance } from '../../context/EmployeeFinanceContext';
import { Badge } from '../../components/DataDisplays';
import { TrendingDown, PlusCircle, Trash2 } from 'lucide-react';

/**
 * Reusable input component for clean form construction.
 */
interface FormInputProps {
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  value: string | number;
  onChange: (val: any) => void;
}

const FormInput: React.FC<FormInputProps> = ({ label, type, placeholder, required = true, value, onChange }) => (
  <div className="space-y-1">
    <label className="block text-slate-500 font-bold tracking-wide text-[11px]">{label}</label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      value={value === 0 ? '' : value}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-medium text-xs transition-all"
    />
  </div>
);

/**
 * Modern, industry-standard component for Expenditure tracking and general hospital bills.
 */
export const ExpensePanel: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useEmployeeFinance();

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Medical Supplies');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0) return;
    addExpense({
      description: desc,
      amount,
      category,
      addedBy: 'Super Admin'
    });
    setDesc('');
    setAmount(0);
    alert('Expense successfully logged!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Columns: Expense Ledger Table */}
      <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Operating Expenditures
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">Totallogged: {expenses.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No business expenses recorded.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-500">{exp.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{exp.description}</td>
                    <td className="px-4 py-3">
                      <Badge status="yellow">{exp.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-black text-rose-500 font-mono text-xs">BDT {exp.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this expense entry?')) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50/50 transition-all inline-flex items-center justify-center cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Log Expense Form */}
      <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <PlusCircle className="w-4 h-4 text-primary" />
          Log Expense Bill
        </h4>
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <FormInput
            label="Expense Description"
            type="text"
            placeholder="e.g. Oxygen cylinders purchase"
            value={desc}
            onChange={setDesc}
          />

          <div className="space-y-1">
            <label className="block text-slate-500 font-bold tracking-wide text-[11px]">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-xs transition-all"
            >
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="OT Equipment">OT Equipment</option>
              <option value="Utility">Utility</option>
              <option value="Marketing">Marketing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="General Office">General Office</option>
            </select>
          </div>

          <FormInput
            label="Amount (BDT)"
            type="number"
            placeholder="e.g. 1500"
            value={amount}
            onChange={setAmount}
          />

          <button
            type="submit"
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all text-center text-xs tracking-wider uppercase mt-2 active:scale-98"
          >
            Record Bill/Expense
          </button>
        </form>
      </div>

    </div>
  );
};
