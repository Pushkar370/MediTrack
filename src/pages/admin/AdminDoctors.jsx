import { useState } from "react";
import { Stethoscope, Plus, Pencil, Eye, Power } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../context/ToastContext";
import { doctors as seed } from "../../data/mockData";
import { SPECIALTIES } from "../../constants";

export default function AdminDoctors() {
  const toast = useToast();
  const [list, setList] = useState(seed);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [toggle, setToggle] = useState(null);

  const rows = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));

  function openAdd() {
    setEditing({});
    setForm({ name: "", specialty: SPECIALTIES[0], email: "", phone: "", experience: 1, availability: "Available", status: "active" });
  }
  function openEdit(d) {
    setEditing(d);
    setForm(d);
  }
  function save() {
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    if (editing.id) {
      setList((l) => l.map((d) => (d.id === editing.id ? { ...d, ...form } : d)));
      toast.success("Doctor updated (mock)");
    } else {
      const id = "D-" + (200 + list.length + 1);
      setList((l) => [{ id, ...form }, ...l]);
      toast.success("Doctor added (mock)");
    }
    setEditing(null);
  }
  function confirmToggle() {
    setList((l) => l.map((d) => (d.id === toggle.id ? { ...d, status: toggle.next } : d)));
    toast.success(`Doctor ${toggle.next === "active" ? "activated" : "deactivated"} (mock)`);
    setToggle(null);
  }

  const columns = [
    { key: "id", label: "Doctor ID" },
    { key: "name", label: "Name" },
    { key: "specialty", label: "Specialty" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "experience", label: "Experience (yrs)", render: (r) => r.experience },
    { key: "availability", label: "Availability", render: (r) => <StatusBadge status={r.availability.toLowerCase()} label={r.availability} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={() => toast.info("Doctor profile (mock)")}><Eye className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant={r.status === "active" ? "secondary" : "success"} onClick={() => setToggle({ id: r.id, next: r.status === "active" ? "inactive" : "active" })}>
            <Power className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" subtitle="Manage clinic doctors and availability."
        action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Doctor</Button>} />

      <SearchBar value={search} onChange={(v) => setSearch(v)} placeholder="Search by name or specialty..." className="max-w-md" />

      <div className="card">
        {rows.length === 0 ? <EmptyState icon={Stethoscope} title="No doctors found" /> : <DataTable columns={columns} data={rows} />}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Doctor" : "Add Doctor"} size="lg"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Specialty" value={form.specialty || ""} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Experience (years)" type="number" value={form.experience || 0} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} />
          <Select label="Availability" value={form.availability || "Available"} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            <option>Available</option>
            <option>Busy</option>
          </Select>
        </div>
      </Modal>

      <ConfirmationModal open={!!toggle} onClose={() => setToggle(null)} onConfirm={confirmToggle}
        title={toggle?.next === "active" ? "Activate doctor?" : "Deactivate doctor?"}
        message={`Are you sure you want to ${toggle?.next === "active" ? "activate" : "deactivate"} this doctor?`} />
    </div>
  );
}
