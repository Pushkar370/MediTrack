import { useEffect, useRef } from "react";
import { Users, UserCheck, CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import { BarChart, LineChart, DonutChart } from "../../components/charts/Charts";
import { useFetch } from "../../hooks/useFetch";
import { getDashboardStats, getAnalytics } from "../../services/adminService";

export default function AdminDashboard() {
  const { data: stats, loading, reload: reloadStats } = useFetch(() => getDashboardStats("admin"));
  const { data: analytics, reload: reloadAnalytics } = useFetch(() => getAnalytics());
  const intervalRef = useRef(null);

  useEffect(() => {
    // Auto-refresh stats every 60 seconds for live data
    intervalRef.current = setInterval(() => {
      reloadStats();
      reloadAnalytics();
    }, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [reloadStats, reloadAnalytics]);

  if (loading || !stats) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Clinic-wide overview and metrics." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} tone="primary" />
        <StatCard icon={UserCheck} label="Total Doctors" value={stats.totalDoctors} tone="sage" />
        <StatCard icon={CalendarDays} label="Today's Appointments" value={stats.todayAppointments} tone="accent" />
        <StatCard icon={CheckCircle2} label="Completed Consultations" value={stats.completedConsultations} tone="success" />
        <StatCard icon={XCircle} label="Cancelled Appointments" value={stats.cancelledAppointments} tone="danger" />
        <StatCard icon={Clock} label="Pending Appointments" value={stats.pendingAppointments} tone="accent" />
      </div>

      {analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Appointment Trends">
            <BarChart labels={analytics.appointmentTrends?.labels || []} data={analytics.appointmentTrends?.data || []} />
          </Card>
          <Card title="Patient Registrations">
            <LineChart labels={analytics.patientRegistrations?.labels || []} data={analytics.patientRegistrations?.data || []} color="#3A8D5D" />
          </Card>
          <Card title="Consultation Trends">
            <LineChart labels={analytics.consultationTrends?.labels || []} data={analytics.consultationTrends?.data || []} color="#8FB9B2" />
          </Card>
          <Card title="Appointment Status">
            <DonutChart labels={analytics.appointmentStatus?.labels || []} data={analytics.appointmentStatus?.data || []} />
          </Card>
          <Card title="Patient Demographics">
            <DonutChart labels={analytics.patientDemographics?.labels || []} data={analytics.patientDemographics?.data || []}
              colors={["#2F6F68", "#8FB9B2", "#F4C95D", "#D9534F", "#3A8D5D"]} />
          </Card>
          <Card title="Doctor Workload">
            <BarChart labels={analytics.doctorWorkload?.labels || []} data={analytics.doctorWorkload?.data || []} color="#3A8D5D" />
          </Card>
        </div>
      )}
    </div>
  );
}
