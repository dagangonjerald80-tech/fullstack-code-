import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Stethoscope, CalendarCheck, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, colorClass }) => (
  <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    {/* Decorative background blob */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500 ${colorClass}`}></div>

    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`p-3.5 rounded-2xl shadow-sm text-white ${colorClass}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <TrendingUp size={14} className={!trendUp ? 'rotate-180' : ''} />
          {trend}
        </div>
      )}
    </div>
    <div className="relative z-10 mt-2">
      <h3 className="text-slate-500 font-semibold mb-1 text-sm">{title}</h3>
      <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{
  onNavigate?: (tab: string) => void;
}> = ({ onNavigate }) => {
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [doctorsCount, setDoctorsCount] = useState<number>(0);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [topIllnesses, setTopIllnesses] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  const API_APPOINTMENT = "http://127.0.0.1:8000/api/appointments/";
  const API_PATIENT = "http://127.0.0.1:8000/api/patients/";
  const API_DOCTOR = "http://127.0.0.1:8000/api/doctors/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAppointments, resPatients, resDoctors] = await Promise.all([
          axios.get(API_APPOINTMENT),
          axios.get(API_PATIENT),
          axios.get(API_DOCTOR)
        ]);

        const patients = resPatients.data;
        const doctors = resDoctors.data;
        const appointments = resAppointments.data;

        setPatientsCount(patients.length);
        setDoctorsCount(doctors.length);
        setAppointmentsCount(appointments.length);

        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todaysApts = appointments.filter((app: any) => app.date === today);
        setTodayAppointments(todaysApts.length);

        // Get 3 most recent patients for activity
        const sortedPatients = [...patients].reverse().slice(0, 3);
        setRecentPatients(sortedPatients);

        // Calculate top illnesses
        const illnessCounts: Record<string, number> = {};
        patients.forEach((p: any) => {
          if (p.illness) {
            const illnessName = p.illness.trim();
            illnessCounts[illnessName] = (illnessCounts[illnessName] || 0) + 1;
          }
        });
        
        const sortedIllnesses = Object.entries(illnessCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3); // Top 3
        setTopIllnesses(sortedIllnesses);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Welcome Back, Admin</h2>
          <p className="text-slate-500 font-medium">Here's what's happening at the hospital today.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm flex items-center gap-2 border border-blue-100 shadow-sm">
          <Clock size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Overview Stats */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Patients"
            value={loading ? "..." : patientsCount}
            icon={<Users size={26} strokeWidth={2.5} />}
            trend="+New"
            trendUp={true}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Available Doctors"
            value={loading ? "..." : doctorsCount}
            icon={<Stethoscope size={26} strokeWidth={2.5} />}
            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Total Appointments"
            value={loading ? "..." : appointmentsCount}
            icon={<CalendarCheck size={26} strokeWidth={2.5} />}
            trend={todayAppointments > 0 ? `${todayAppointments} Today` : "None Today"}
            trendUp={todayAppointments > 0}
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate && onNavigate("patients")}
              className="p-6 rounded-3xl text-left border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-150"></div>
              <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 rotate-3 group-hover:rotate-0 transition-transform">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Manage Patients</h4>
              <p className="text-sm text-slate-500 font-medium">View, edit, or register new patients.</p>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("appointments")}
              className="p-6 rounded-3xl text-left border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-150"></div>
              <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 -rotate-3 group-hover:rotate-0 transition-transform">
                <CalendarCheck size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Schedule Sessions</h4>
              <p className="text-sm text-slate-500 font-medium">Manage hospital appointments.</p>
            </button>
          </div>
        </section>

        {/* Analytics & Activity */}
        <div className="flex flex-col gap-6">
          {/* Top Illnesses Analytics */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-50"></div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 relative z-10 flex items-center gap-2">
              <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
              Top Illnesses
            </h2>
            <div className="space-y-4 relative z-10 flex-1">
              {topIllnesses.length > 0 ? (
                topIllnesses.map((illness, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-700">{illness.name}</span>
                      <span className="text-slate-500">{illness.count} patients</span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-400 rounded-full" 
                        style={{ width: `${Math.min((illness.count / (patientsCount || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 font-medium py-4 text-center">Not enough data to calculate top illnesses.</div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden flex-1">
            {/* Subtle bg texture */}
            <div className="absolute top-0 right-0 bg-slate-50 w-full h-32 -skew-y-6 transform origin-top-right -z-0"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            </div>

          <div className="space-y-5 flex-1 relative z-10">
            {recentPatients.length > 0 ? (
              recentPatients.map((p, index) => (
                <div key={p.id || index} className="flex gap-4 items-start group">
                  <div className="mt-0.5 bg-blue-50 text-blue-600 p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 font-bold">New patient registered</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{p.name || 'A patient'} was added.</p>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <Clock size={12} /> Just now
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4 items-start">
                <div className="mt-0.5 bg-slate-50 text-slate-400 p-2.5 rounded-xl shrink-0">
                  <AlertCircle size={18} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">No recent patients yet</p>
                </div>
              </div>
            )}

            {/* System Status Activity */}
            <div className="flex gap-4 items-start pt-2 border-t border-slate-100">
              <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shrink-0">
                <AlertCircle size={18} strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm text-slate-800 font-bold">System Status: Optimal</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">All services are running normally.</p>
              </div>
            </div>
          </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

