// One reusable form control: text, number, date, email, password, select, textarea, checkbox.
// Works together with the useForm hook (value + onChange(event)).
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  required = false,
  hint,
  rows = 3,
  placeholder,
  min,
  step,
  disabled = false,
  className = "mb-3",
}) {
  const id = `field-${name}`;

  if (type === "checkbox") {
    return (
      <div className={`form-check ${className}`}>
        <input
          className="form-check-input"
          type="checkbox"
          id={id}
          name={name}
          checked={Boolean(value)}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="form-check-label" htmlFor={id}>
          {label}
        </label>
        {hint && <div className="text-muted-space" style={{ fontSize: "0.75rem" }}>{hint}</div>}
      </div>
    );
  }

  let control;
  if (type === "select") {
    control = (
      <select id={id} name={name} className="form-select" value={value} onChange={onChange} required={required} disabled={disabled}>
        {options.map((opt) => {
          const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          );
        })}
      </select>
    );
  } else if (type === "textarea") {
    control = (
      <textarea id={id} name={name} className="form-control" rows={rows} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} />
    );
  } else {
    control = (
      <input
        id={id}
        name={name}
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        disabled={disabled}
      />
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {control}
      {hint && <div className="text-muted-space mt-1" style={{ fontSize: "0.75rem" }}>{hint}</div>}
    </div>
  );
}
