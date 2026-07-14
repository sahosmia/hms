import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full pl-${icon ? '10' : '3'} pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error ? 'border-red-400 focus:ring-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-0.5 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
};

interface SearchableDropdownProps {
  label: string;
  options: { value: string; label: string; sublabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search...',
  error
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center cursor-pointer transition-all hover:border-slate-300 focus-within:ring-2 focus-within:ring-primary ${
          error ? 'border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : ''
        }`}
      >
        <span className="text-slate-700 text-sm">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-12 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fadeIn">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No results found.</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm transition-colors ${
                  opt.value === value ? 'bg-blue-50 text-primary font-semibold' : 'text-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                {opt.sublabel && <div className="text-xs text-slate-400 mt-0.5">{opt.sublabel}</div>}
              </div>
            ))
          )}
        </div>
      )}
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  sublabel?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, sublabel }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <div>
        <label className="text-sm font-medium text-slate-700 block">{label}</label>
        {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-slate-700 font-bengali">
        {label}
      </label>
      <textarea
        className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-none ${
          error ? 'border-red-400 focus:ring-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

interface OtpGridProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

export const OtpGrid: React.FC<OtpGridProps> = ({ length = 4, value, onChange }) => {
  const inputsRef = React.useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return;

    const chars = value.split('');
    chars[index] = num[num.length - 1];
    const newOtp = chars.join('').slice(0, length);
    onChange(newOtp);

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const chars = value.split('');
      if (chars[index]) {
        chars[index] = '';
        onChange(chars.join(''));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        chars[index - 1] = '';
        onChange(chars.join(''));
      }
    }
  };

  return (
    <div className="flex gap-3 justify-center items-center my-4">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { if (el) inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-14 h-14 text-center text-xl font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm transition-all duration-150 focus:ring-offset-2 hover:border-slate-300 focus:scale-105"
        />
      ))}
    </div>
  );
};
