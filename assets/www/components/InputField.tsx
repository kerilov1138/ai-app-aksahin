
import React from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  type?: 'number';
  icon?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'number', icon }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fas ${icon} text-slate-400 text-sm`}></i>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`block w-full rounded-lg border border-slate-200 bg-white py-2.5 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900 ${icon ? 'pl-10' : 'px-4'}`}
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default InputField;
