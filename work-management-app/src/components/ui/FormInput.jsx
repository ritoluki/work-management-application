import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Auto-determine autoComplete if not provided
  let autoCompleteValue = autoComplete;
  if (!autoCompleteValue) {
    if (name === 'email') {
      autoCompleteValue = 'email';
    } else if (name === 'password') {
      autoCompleteValue = 'current-password';
    } else if (name === 'confirmPassword') {
      autoCompleteValue = 'new-password';
    } else if (name === 'firstName') {
      autoCompleteValue = 'given-name';
    } else if (name === 'lastName') {
      autoCompleteValue = 'family-name';
    } else {
      autoCompleteValue = 'off';
    }
  }
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          autoComplete={autoCompleteValue}
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-10' : 'pr-3'} py-3
            border rounded-lg text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            placeholder-gray-500 dark:placeholder-gray-400
            transition-colors duration-200
            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;