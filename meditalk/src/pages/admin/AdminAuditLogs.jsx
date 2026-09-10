import { useState } from "react";
import { FileText, Search } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Select from "../../components/ui/Select";
import SearchBar from "../../components/ui/SearchBar";
import EmptyState from "../../components/ui/EmptyState";
import { useFetch } from "../../hooks/useFetch";
import { getAuditLogs } from "../../services/adminService";
import { formatDateTime } from "../../constants";

const ROLES = ["", "Patient", "Doctor", "Administrator"];
const STATUSES = ["", "success", "failed"];

export default function AdminAuditLogs() {
  const { data: logs, loading } = useFetch(() => getAuditLogs());
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const rows = (logs || [])
    .filter((l) => !role || l.role === role)
    .filter((l) => !status || l.status === status)
    .filter(
      (l) =>
        !search ||
        (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.action || '').toLowerCase().includes(search.toLowerCase())
    );

  const columns = [
    { key: "timestamp", label: "Timestamp", render: (r) => formatDateTime(r.timestamp) },
    { key: "user_name", label: "User" },
    { key: "role", label: "Role" },
    { key: "action", label: "Action" },
    { key: "entity_type", label: "Resource" },
    { key: "entity_id", label: "Reference" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} label={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Track security and activity across the system." />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search user or action..." className="flex-1" />
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-44">
          {ROLES.map((r) => <option key={r} value={r}>{r || "All Roles"}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.toUpperCase() : "All Status"}</option>)}
        </Select>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 text-center text-ink/40">Loading...</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs found" />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
