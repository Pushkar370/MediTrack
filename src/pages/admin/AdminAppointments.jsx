import { useState } from "react";
import { CalendarDays, Eye } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { appointments as seed, doctors } from "../../data/mockData";
import { SPECIALTIES, APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPES, formatDate } from "../../constants";

export default function AdminAppointments() {
  const [list, setList] = useState(seed);
  const [filter, setFilter] = useState({ date: "", doctor: "", specialty: "", status: "", type: "" });
  const [view, setView] = useState(null);

  const rows = list.filter((a) =>
    (!filter.date || a.date === filter.date) &&
    (!filter.doctor || a.doctorId === filter.doctor) &&
    (!filter.specialty || a.specialty === filter.specialty) &&
    (!filter.status || a.status === filter.status) &&
    (!filter.type || a.type === filter.type)
  );

  const columns = [
    { key: "id", label: "Appointment ID" },
    { key: "patientName", label: "Patient" },
    { key: "doctorName", label: "Doctor" },
    { key: "date", label: "Date", render: (r) => formatDate(r.date) },
    { key: "time", label: "Time" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => <Button size="sm" variant="outline" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" /> View</Button> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" subtitle="All clinic appointments." />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Input type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
        <Select value={filter.doctor} onChange={(e) => setFilter({ ...filter, doctor: e.target.value })}>
          <option value="">All Doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select value={filter.specialty} onChange={(e) => setFilter({ ...filter, specialty: e.target.value })}>
          <option value="">All Specialties</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          {Object.keys(APPOINTMENT_STATUS_LABELS).map((s) => <option key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</option>)}
        </Select>
        <Select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option>
          {APPOINTMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <div className="card">
        {rows.length === 0 ? <EmptyState icon={CalendarDays} title="No appointments match filters" /> : <DataTable columns={columns} data={rows} />}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={`Appointment ${view?.id}`} size="md"
        footer={<Button onClick={() => setView(null)}>Close</Button>}>
        {view && (
          <div className="space-y-2 text-sm">
            <Row label="Patient" value={view.patientName} />
            <Row label="Doctor" value={view.doctorName} />
            <Row label="Specialty" value={view.specialty} />
            <Row label="Date" value={formatDate(view.date)} />
            <Row label="Time" value={view.time} />
            <Row label="Type" value={view.type} />
            <Row label="Status" value={<StatusBadge status={view.status} />} />
            <Row label="Reason" value={view.reason} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-sage/20 pb-2">
      <span className="text-ink/50">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
