import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react'

export type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  type?: string
  autoComplete?: string
  trailing?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange' | 'type' | 'placeholder' | 'autoComplete'>

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  trailing,
  ...inputProps
}: TextFieldProps) {
  return (
    <label htmlFor={id} className="grid gap-3 text-sm">
      <span className="uppercase tracking-[0.32em] text-[0.7rem] font-semibold text-text-muted">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-[0.75rem] border border-border-soft/60 bg-bg-surface px-4 py-4 pr-12 text-sm text-text-primary outline-none transition duration-200 ease-out placeholder:text-text-muted hover:border-border-soft/90 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/15"
          {...inputProps}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-3 flex items-center text-sm text-text-muted">
            {trailing}
          </div>
        ) : null}
      </div>
    </label>
  )
}
