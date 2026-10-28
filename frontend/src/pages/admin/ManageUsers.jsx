import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import useAuth from "../../hooks/useAuth";
import { deleteUser, getUsers, updateUser } from "../../services/userService";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import ConfirmModal from "../../components/ConfirmModal";
import { RoleBadge } from "../../components/Badges";
import { formatDate, getErrorMessage } from "../../utils/format";

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const debounced = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => getUsers({ search: debounced, role }), [debounced, role]);

  const changeRole = async (u, newRole) => {
    setActionError("");
    setMessage("");
    try {
      await updateUser(u._id, { role: newRole });
      setMessage(`${u.name} is now ${newRole}.`);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(toDelete._id);
      setMessage(`${toDelete.name} and their records were deleted.`);
      setToDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setToDelete(null);
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (u) => <span className="fw-semibold">{u.name}{u._id === me._id && <span className="text-muted-space"> (you)</span>}</span> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (u) => <RoleBadge value={u.role} /> },
    { key: "observationCount", label: "Obs." },
    { key: "analysisCount", label: "Analyses" },
    { key: "reportCount", label: "Reports" },
    { key: "createdAt", label: "Joined", render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      label: "Actions",
      render: (u) =>
        u._id === me._id ? (
          <span className="text-muted-space small">-</span>
        ) : (
          <div className="d-flex gap-1">
            <select className="form-select form-select-sm" style={{ width: 130 }} value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
              <option value="researcher">researcher</option>
              <option value="admin">admin</option>
            </select>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(u)}>Delete</button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Manage Users" subtitle="View registered users, change roles or remove accounts" />
      <div className="space-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-8">
            <input className="form-control" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="researcher">Researchers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-success py-2">{message}</div>}
      <ErrorMessage message={actionError} />
      <ErrorMessage message={error} onRetry={reload} />

      <div className="space-card p-3">
        {loading ? <Loader /> : <DataTable columns={columns} rows={data || []} emptyText="No users found." />}
      </div>

      <ConfirmModal
        show={!!toDelete}
        title="Delete user?"
        message={`${toDelete?.name} (${toDelete?.email}) and ALL their observations, analyses and reports will be permanently deleted.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
