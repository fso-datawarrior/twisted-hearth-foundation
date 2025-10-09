import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "number" | "textarea";
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  rows?: number;
  className?: string;
  inputMode?: "text" | "email" | "numeric" | "tel" | "url" | "search";
  autoComplete?: string;
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
}

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  max,
  rows = 3,
  className,
  inputMode,
  autoComplete,
  enterKeyHint
}: FormFieldProps) => {
  const baseClasses = "bg-input border-4 border-accent-gold/80 text-foreground placeholder:text-muted-foreground focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/30 focus:shadow-sparkle transition-all duration-300";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={name}
        className="font-subhead text-sm uppercase tracking-wider text-accent-gold"
      >
        {label}
      </Label>
      
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={cn(
            baseClasses,
            error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
            "resize-none"
          )}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          inputMode={inputMode}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          className={cn(
            baseClasses,
            error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20"
          )}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
      
      {error && (
        <p 
          id={`${name}-error`}
          className="font-body text-sm text-accent-red"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;