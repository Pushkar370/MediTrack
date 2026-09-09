import { useState } from "react";
import { Users, UserPlus, CalendarDays, Stethoscope, XCircle, Activity, Download, FileDown } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { BarChart, LineChart, DonutChart } from "../../components/charts/Charts";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { getAnalytics } from "../../services/adminService";

export default function AdminAnalytics() {
  const toast = useToast();
  const { data: a, loading } = useFetch(() => getAnalytics());
  const [range, setRange] = useState("30d");

  function exportCsv() {
    if (!a) return;
    const rows = [["Metric", "Value"], ["Weekly Appointments", a.appointmentTrends.data.join("|")], ["Patient Registrations", a.patientRegistrations.data.join("|")]];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meditrack-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported (mock)");
  }

  if (loading || !a) return <div className="py-20 text-center text-ink/40">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Clinic performance and insights."
        action={
          <div className="flex gap-2">
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-36">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("PDF export (mock)")}><FileDown className="h-4 w-4" /> PDF</Button>
          </div>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Patients" value={70} tone="primary" hint="+12 this month" />
        <StatCard icon={UserPlus} label="New Patients" value={12} tone="sage" hint="+3 vs last month" />
        <StatCard icon={CalendarDays} label="Appointments" value={357} tone="accent" />
        <StatCard icon={Stethoscope} label="Consultations" value={210} tone="primary" />
        <StatCard icon={XCircle} label="Cancellation Rate" value="6%" tone="danger" hint="-2% vs last month" />
        <StatCard icon={Activity} label="Utilization" value="88%" tone="success" hint="+5% vs last month" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Weekly Appointments"><BarChart labels={a.appointmentTrends.labels} data={a.appointmentTrends.data} /></Card>
        <Card title="Monthly Patient Registrations"><LineChart labels={a.patientRegistrations.labels} data={a.patientRegistrations.data} color="#3A8D5D" /></Card>
        <Card title="Appointment Status"><DonutChart labels={a.appointmentStatus.labels} data={a.appointmentStatus.data} /></Card>
        <Card title="Specialty-wise Appointments"><BarChart labels={a.specialtyAppointments.labels} data={a.specialtyAppointments.data} color="#8FB9B2" /></Card>
      </div>
    </div>
  );
}
