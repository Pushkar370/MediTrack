import { useState } from "react";
import { Calendar, Plus, Ban, Eye } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { appointments } from "../../data/mockData";
import { formatDate } from "../../constants";

const VIEWS = ["Day", "Week", "Month"];

export default function DoctorCalendar() {
  const toast = useToast();
  const [view, setView] = useState("Month");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7); // August (0-indexed)
  const [modal, setModal] = useState(false);
  const [entry, setEntry] = useState({ type: "available", date: "2026-08-30", note: "" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  function apptsOn(day) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((a) => a.date === ds);
  }

  function handleSaveEntry() {
    toast.success(`${entry.type === "available" ? "Availability" : "Blocked time"} added (mock)`);
    setModal(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Manage your availability and appointments."
        action={
          <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Add Availability</Button>
        }
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={"px-3 py-1.5 rounded-lg text-sm font-medium transition " + (view === v ? "bg-primary text-white" : "bg-white text-ink/60 border border-sage/40")}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="px-2 py-1 rounded-lg border border-sage/40" onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}>←</button>
          <span className="font-medium text-ink w-32 text-center">{new Date(year, month).toLocaleString("en-US", { month: "long" })} {year}</span>
          <button className="px-2 py-1 rounded-lg border border-sage/40" onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}>→</button>
        </div>
      </div>

      <div className="card">
        {view === "Month" ? (
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 font-medium text-ink/50">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const appts = apptsOn(day);
              return (
                <div key={day} className="min-h-[72px] rounded-xl border border-sage/30 p-1.5 text-left hover:bg-background">
                  <span className="text-ink/70 font-medium">{day}</span>
                  <div className="mt-1 space-y-1">
                    {appts.slice(0, 2).map((a) => (
                      <div key={a.id} className={"text-[10px] truncate rounded px-1 py-0.5 " + statusColor(a.status)}>
                        {a.time} {a.patientName.split(" ")[0]}
                      </div>
                    ))}
                    {appts.length > 2 && <div className="text-[10px] text-ink/40">+{appts.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-ink/50">
            <Calendar className="h-10 w-10 mx-auto text-ink/30" />
            <p className="mt-2">{view} view (demo shows Month).</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Legend className="bg-success/15 text-success" label="Booked" />
        <Legend className="bg-accent/20 text-yellow-800" label="Available" />
        <Legend className="bg-danger/10 text-danger" label="Cancelled" />
        <Legend className="bg-sage/30 text-primary" label="Follow-up" />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={entry.type === "available" ? "Add Availability" : "Block Time"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEntry}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Type" value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}>
            <option value="available">Available</option>
            <option value="blocked">Block time</option>
          </Select>
          <Input label="Date" type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} />
          <Input label="Note" value={entry.note} onChange={(e) => setEntry({ ...entry, note: e.target.value })} placeholder="Optional" />
        </div>
      </Modal>
    </div>
  );
}

function statusColor(status) {
  return status === "cancelled"
    ? "bg-danger/10 text-danger"
    : status === "upcoming" || status === "confirmed"
    ? "bg-success/15 text-success"
    : "bg-sage/30 text-primary";
}
function Legend({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={"h-3 w-3 rounded " + className} />
      {label}
    </span>
  );
}
