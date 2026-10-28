// Title row used at the top of every page. Buttons can be passed as children.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="text-muted-space small mt-1">{subtitle}</div>}
      </div>
      <div className="d-flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
