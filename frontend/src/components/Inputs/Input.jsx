import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  type = "text",
  error,
  disabled = false,
  step,
  min,
  max,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <label 
        className="text-[13px] transition-colors"
        style={{ color: 'var(--color-textPrimary)' }}
      >
        {label}
      </label>

      <div className={`input-box ${error ? 'border-red-500' : ''}`}>
        <input
          type={
            type == "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className="w-full bg-transparent outline-none transition-colors"
          style={{ color: 'var(--color-textPrimary)' }}
          value={value}
          onChange={(e) => onChange(e)}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          {...props}
        />

        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEye
                size={22}
                className="cursor-pointer transition-colors"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => toggleShowPassword()}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="cursor-pointer transition-colors"
                style={{ color: 'var(--color-textMuted)' }}
                onClick={() => toggleShowPassword()}
              />
            )}
          </>
        )}
      </div>
      
      {error && (
        <p 
          className="text-xs mt-1 transition-colors"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
