// A simple confirmation dialog (no Bootstrap JavaScript needed).
// Usage:
//   <ConfirmModal show={!!target} title="Delete?" message="..." onConfirm={...} onCancel={...} />
export default function ConfirmModal({
  show,
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h5 className="mb-2">{title}</h5>
        <p className="text-muted-space">{message}</p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className={`btn ${danger ? "btn-danger" : "btn-fs"}`} onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
