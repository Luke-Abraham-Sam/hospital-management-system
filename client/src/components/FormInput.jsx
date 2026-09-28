import React from 'react';

const FormInput = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  options = [], // for select type
  disabled = false,
  rows = 3 // for textarea
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors bg-white ${
            error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300'
          }`}
        >
          {options.map((opt, i) => (
            <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
            error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300'
          }`}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
            error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300'
          }`}
        />
      )}

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default FormInput;
