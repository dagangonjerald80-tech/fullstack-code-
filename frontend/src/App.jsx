import React, { useState, useEffect } from "react";
import Patient from "./components/Patient";
import Doctor from "./components/Doctor";
import Appointment from "./components/Appointment";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { Plus, Home, UserRound, Stethoscope, Calendar, Settings, Bell } from "lucide-react";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [zoomedImage, setZoomedImage] = useState(null);

  // Notification and Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fetch data to populate notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const [resAppointments, resPatients, resDoctors] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/appointments/").then(r => r.json()),
          fetch("http://127.0.0.1:8000/api/patients/").then(r => r.json()),
          fetch("http://127.0.0.1:8000/api/doctors/").then(r => r.json())
        ]);

        const notifs = [];
        if (resPatients.length > 0) notifs.push(`${resPatients.length} Patients registered`);
        if (resDoctors.length > 0) notifs.push(`${resDoctors.length} Doctors available`);

        const today = new Date().toISOString().split('T')[0];
        const todaysApts = resAppointments.filter(app => app.date === today);
        if (todaysApts.length > 0) notifs.push(`${todaysApts.length} Appointments today`);

        setNotifications(notifs);
      } catch (error) {
        console.error("Error fetching notification data", error);
      }
    };

    fetchNotifications();
    // Refresh notifications every minute (optional)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#f4f6f9] font-sans text-slate-800">
      {/* Sidebar */}
      <div className="w-64 bg-[#31517a] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 p-6 pb-8">
            <div className="bg-white text-[#31517a] p-1.5 rounded-md flex items-center justify-center">
              <Plus size={24} strokeWidth={4} />
            </div>
            <div className="font-semibold text-lg leading-tight">
              Hospital<br />Management
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "dashboard"
                ? "bg-[#548de5] text-white shadow-sm"
                : "hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
            >
              <Home size={20} />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "patients"
                ? "bg-[#548de5] text-white shadow-sm"
                : "hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
            >
              <UserRound size={20} />
              <span className="font-medium">Patients</span>
            </button>
            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "doctors"
                ? "bg-[#548de5] text-white shadow-sm"
                : "hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
            >
              <Stethoscope size={20} />
              <span className="font-medium">Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "appointments"
                ? "bg-[#548de5] text-white shadow-sm"
                : "hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
            >
              <Calendar size={20} />
              <span className="font-medium">Appointments</span>
            </button>

          </nav>
        </div>

        {/* Admin Profile */}
        <div
          className="p-4 m-4 rounded-lg bg-[#274263] flex items-center gap-3 cursor-pointer group"
          onClick={() => setZoomedImage("/lapiz.jpg")}
        >
          <div className="overflow-hidden rounded-full w-10 h-10 bg-slate-200">
            <img
              src="/lapiz.jpg"
              alt="Admin"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
            />
          </div>
          <div>
            <div className="font-medium text-sm">Admin</div>
            <div className="text-xs text-slate-300">jerald@email.com</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white flex items-center justify-between px-8 z-10 shrink-0 border-b border-slate-100 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1f2937]">Hospital Management System</h1>
          <div className="flex items-center gap-5 text-slate-400 relative">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setSettingsOpen(false); }}
                className="hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute top-12 right-0 w-64 bg-white border border-slate-100 shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 text-sm">
                    Notifications
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                        <div key={i} className="p-2.5 hover:bg-slate-50 rounded-lg text-sm text-slate-600 mb-1 last:mb-0 transition-colors">
                          <span className="w-1.5 h-1.5 inline-block rounded-full bg-blue-500 mr-2 shrink-0"></span>
                          {n}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSettingsOpen(!settingsOpen); setIsNotifOpen(false); }}
                className={`p-2 rounded-full transition-all ${settingsOpen ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings size={20} />
              </button>

              {/* Settings Menu Dropdown */}
              {settingsOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white border border-slate-100 shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setSettingsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
            {/* Profile Zoom Trigger */}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8 bg-[#f4f6f9]">
          <div className="max-w-[1000px] mx-auto flex flex-col gap-6 pb-12">
            {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === "patients" && <Patient />}
            {activeTab === "doctors" && <Doctor />}
            {activeTab === "appointments" && <Appointment />}
          </div>
        </main>
      </div>

      {/* Full Screen Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed Profile"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-50 duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default App;
