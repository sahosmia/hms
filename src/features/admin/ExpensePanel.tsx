import React, { useState } from 'react';
import { useEmployeeFinance } from '../../context/EmployeeFinanceContext';
import { Badge } from '../../components/DataDisplays';
import { TrendingDown, PlusCircle, Trash2 } from 'lucide-react';

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

      {/* Left Columns: Expense Table Ledger */}
      <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <TrendingDown className="w-5 h-5 text-rose-500" />
          Operating Expenditures
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2 text-slate-500 font-bold uppercase">Date</th>
                <th className="px-4 py-2 text-slate-500 font-bold uppercase">Description</th>
                <th className="px-4 py-2 text-slate-500 font-bold uppercase">Category</th>
                <th className="px-4 py-2 text-slate-500 font-bold uppercase">Amount</th>
                <th className="px-4 py-2 text-slate-500 font-bold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No business expenses recorded.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono">{exp.date}</td>
                    <td className="px-4 py-2.5 font-bold">{exp.description}</td>
                    <td className="px-4 py-2.5">
                      <Badge status="yellow">{exp.category}</Badge>
                    </td>
                    <td className="px-4 py-2.5 font-black text-rose-500 font-mono">BDT {exp.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this expense entry?')) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Add Expense Form */}
      <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1">
          <PlusCircle className="w-4 h-4 text-primary" />
          Log Expense
        </h4>
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Expense Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Oxygen cylinders purchase"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-semibold"
            >
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="OT Equipment">OT Equipment</option>
              <option value="Utility">Utility</option>
              <option value="Marketing">Marketing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="General Office">General Office</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Amount (BDT)</label>
            <input
              type="number"
              required
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 1500"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all text-center"
          >
            Record Bill/Expense
          </button>
        </form>
      </div>

    </div>
  );
};
