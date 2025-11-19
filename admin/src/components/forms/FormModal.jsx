import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * FormField  Component
 * Reusable form field with label and validation
 */
export function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * FormModal Component
 * Reusable modal for create/edit forms
 */
export default function FormModal({
  open,
  onOpenChange,
  title,
  description,
  fields = [],
  values = {},
  onChange,
  onSubmit,
  loading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}) {
  const handleFieldChange = (fieldName, value) => {
    onChange({ ...values, [fieldName]: value });
  };

  const renderField = (field) => {
    const value = values[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={field.error}
          >
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              rows={field.rows || 3}
            />
          </FormField>
        );

      case 'select':
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={field.error}
          >
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              disabled={field.disabled || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={field.disabled || loading}
              className="h-4 w-4"
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );

      case 'number':
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={field.error}
          >
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          </FormField>
        );

      default: // text input
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={field.error}
          >
            <Input
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
            />
          </FormField>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {fields.map(renderField)}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
