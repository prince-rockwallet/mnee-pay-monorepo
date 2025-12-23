import { CustomField } from '../types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { formatCurrency } from '../lib/currency';
import { useCheckout } from '../store';

interface DynamicFormProps {
  fields: CustomField[];
  onFieldChange?: (fieldId: string, value: any) => void;
}

export function DynamicForm({ fields, onFieldChange }: DynamicFormProps) {
  const { formData, updateFormData, errors } = useCheckout();

  const handleChange = (fieldId: string, value: any) => {
    updateFormData({
      customFields: {
        ...formData.customFields,
        [fieldId]: value,
      },
    });
    onFieldChange?.(fieldId, value);
  };

  const shouldShowField = (field: CustomField): boolean => {
    if (!field.dependsOn) return true;

    const dependentValue = formData.customFields[field.dependsOn.fieldId];
    return dependentValue === field.dependsOn.value;
  };

  const renderField = (field: CustomField) => {
    if (!shouldShowField(field)) return null;

    const value = formData.customFields[field.id] ?? field.defaultValue ?? '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                error ? 'border-destructive' : ''
              }`}
              rows={4}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleChange(field.id, val)}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {option.price !== undefined && option.price !== 0 && (
                        <span className="ml-2 text-muted-foreground">
                          {option.price > 0 ? '+' : ''}
                          {formatCurrency(option.price, 'USD')}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      disabled={option.disabled}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {option.price !== undefined && option.price !== 0 && (
                    <span className="text-sm text-muted-foreground">
                      {option.price > 0 ? '+' : ''}
                      {formatCurrency(option.price, 'USD')}
                    </span>
                  )}
                </label>
              ))}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value === true}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
            </Label>
            {error && (
              <p className="text-sm text-destructive ml-6">{error}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => renderField(field))}
    </div>
  );
}
