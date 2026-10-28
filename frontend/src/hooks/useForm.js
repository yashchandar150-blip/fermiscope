import { useState } from "react";

// Small helper for forms.
// Usage:  const [form, setForm, handleChange] = useForm({ title: "" });
//         <input name="title" value={form.title} onChange={handleChange} />
export default function useForm(initialValues) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return [form, setForm, handleChange];
}
