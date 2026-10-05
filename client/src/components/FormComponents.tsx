import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function TextInput({ label, error, required, ...props }: TextInputProps) {
  return (
    <label className="form-group">
      <span>
        {label}
        {required && <span className="required">*</span>}
      </span>
      <input {...props} />
      {error && <span className="error-message">{error}</span>}
    </label>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function TextArea({ label, error, required, ...props }: TextAreaProps) {
  return (
    <label className="form-group">
      <span>
        {label}
        {required && <span className="required">*</span>}
      </span>
      <textarea {...props} />
      {error && <span className="error-message">{error}</span>}
    </label>
  );
}

export function SelectInput({ label, options, error, required, ...props }: any) {
  return (
    <label className="form-group">
      <span>
        {label}
        {required && <span className="required">*</span>}
      </span>
      <select {...props}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </label>
  );
}
