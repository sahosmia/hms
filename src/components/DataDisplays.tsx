import React from 'react';

interface TableHeader<T> {
  key: keyof T | '';
  label: string;
  sortable?: boolean;
}

interface TableProps<T> {
  headers: TableHeader<T>[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T | '';
  sortOrder?: 'asc' | 'desc';
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function Table<T>({
  headers,
  data,
  renderRow,
  onSort,
  sortKey,
  sortOrder,
  pagination
}: TableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  onClick={() => header.sortable && onSort && header.key && onSort(header.key as keyof T)}
                  className={`px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider font-bengali ${
                    header.sortable ? 'cursor-pointer select-none hover:text-slate-800 transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {header.label}
                    {header.sortable && header.key === sortKey && (
                      <span className="text-slate-400">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-10 text-center text-sm text-slate-400 font-bengali">
                  কোনো তথ্য পাওয়া যায়নি
                </td>
              </tr>
            ) : (
              data.map((item, idx) => renderRow(item, idx))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between font-bengali">
          <span className="text-xs text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              পূর্ববর্তী
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => pagination.onPageChange(i + 1)}
                className={`px-3 py-1 text-xs rounded border transition-all ${
                  pagination.currentPage === i + 1
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              পরবর্তী
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  status: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const colorMap = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50',
    red: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50',
    gray: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/50'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border font-bengali transition-colors shadow-sm ${colorMap[status]}`}>
      {children}
    </span>
  );
};

interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  completed: boolean;
  active?: boolean;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div className="flow-root font-bengali">
      <ul className="-mb-8">
        {steps.map((step, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx !== steps.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white transition-all duration-200 ${
                      step.completed
                        ? 'bg-primary text-white shadow-md shadow-blue-200'
                        : step.active
                        ? 'bg-blue-100 text-primary border-2 border-primary font-bold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className={`text-sm font-semibold ${step.active ? 'text-primary font-bold' : 'text-slate-800'}`}>
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                  {step.timestamp && (
                    <div className="text-right text-xs whitespace-nowrap text-slate-400 font-sans">
                      {step.timestamp}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  badgeCount?: number;
  badgeColor?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  badgeCount,
  badgeColor = 'blue',
  children
}) => {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-slate-50 rounded-xl p-4 border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 font-bengali flex items-center gap-1.5">
          {title}
          {badgeCount !== undefined && (
            <Badge status={badgeColor}>{badgeCount}</Badge>
          )}
        </h3>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[550px] pr-1">
        {children}
      </div>
    </div>
  );
};
