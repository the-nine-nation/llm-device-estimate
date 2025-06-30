'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { HelpIcon } from './tooltip'

// Form Context
interface FormContextValue {
  errors: Record<string, string>
  setError: (name: string, error: string) => void
  clearError: (name: string) => void
}

const FormContext = React.createContext<FormContextValue | null>(null)

export function useFormContext() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider')
  }
  return context
}

// Form Provider
interface FormProviderProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
}

export function FormProvider({ children, onSubmit }: FormProviderProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const setError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const clearError = (name: string) => {
    setErrors(prev => {
      const { [name]: _, ...rest } = prev
      return rest
    })
  }

  return (
    <FormContext.Provider value={{ errors, setError, clearError }}>
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </FormContext.Provider>
  )
}

// Form Field
interface FormFieldProps {
  name: string
  children: React.ReactNode
}

export function FormField({ name, children }: FormFieldProps) {
  const { errors } = useFormContext()
  const error = errors[name]

  return (
    <div className="space-y-2">
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  helpText?: string
}

export function FormLabel({ className, helpText, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center',
        className
      )}
      {...props}
    >
      {children}
      {helpText && (
        <HelpIcon content={helpText} />
      )}
    </label>
  )
}

// Form Input
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
}

export function FormInput({ className, name, ...props }: FormInputProps) {
  const { errors, clearError } = useFormContext()
  const hasError = !!errors[name]

  return (
    <input
      name={name}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      onChange={() => clearError(name)}
      {...props}
    />
  )
}

// Form Select
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  children: React.ReactNode
}

export function FormSelect({ className, name, children, ...props }: FormSelectProps) {
  const { errors, clearError } = useFormContext()
  const hasError = !!errors[name]

  return (
    <select
      name={name}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      onChange={() => clearError(name)}
      {...props}
    >
      {children}
    </select>
  )
}

// Form Textarea
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
}

export function FormTextarea({ className, name, ...props }: FormTextareaProps) {
  const { errors, clearError } = useFormContext()
  const hasError = !!errors[name]

  return (
    <textarea
      name={name}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      onChange={() => clearError(name)}
      {...props}
    />
  )
} 