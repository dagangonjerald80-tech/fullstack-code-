import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarCheck, Plus, Edit as EditIcon, Trash2, Search, Download } from "lucide-react";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        setAppointments(resAppointments.data);
        setPatients(resPatients.data);
        setDoctors(resDoctors.data);
      } catch (error) {
        console.error("Error fetching appointments data:", error);
      }
    };
    fetchData();
  }, []);

  const addOrUpdateAppointment = async () => {
    if (!patient || !doctor || !date) return alert("Select all fields!");
    try {
      if (editingId) {
        await axios.put(API_APPOINTMENT + editingId + "/", { patient, doctor, date });
        setEditingId(null);
      } else {
        await axios.post(API_APPOINTMENT, { patient, doctor, date });
      }
      setPatient(""); setDoctor(""); setDate("");

      const res = await axios.get(API_APPOINTMENT);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error adding/updating appointment:", error);
    }
  };

  const editAppointment = (a) => {
    setEditingId(a.id);
    setPatient(a.patient);
    setDoctor(a.doctor);
    setDate(a.date);
  };

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(API_APPOINTMENT + id + "/");
      const res = await axios.get(API_APPOINTMENT);
      setAppointments(res.data);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleTopRightAdd = () => {
    setEditingId(null);
    setPatient(""); setDoctor(""); setDate("");
  };

  const exportToCSV = () => {
    if (appointments.length === 0) return alert("No appointments to export!");
    const headers = ["ID,Patient Name,Doctor Name,Date"];
    const csvRows = appointments.map(a => {
      const pName = patients.find(p => p.id === a.patient)?.name || "Unknown";
      const dName = doctors.find(d => d.id === a.doctor)?.name || "Unknown";
      return `${a.id},"${pName}","${dName}",${a.date}`;
    });
    const csvContent = headers.concat(csvRows).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "appointments_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAppointments = appointments.filter(a => {
    const pName = patients.find(p => p.id === a.patient)?.name || "";
    const dName = doctors.find(d => d.id === a.doctor)?.name || "";
    const searchLow = searchTerm.toLowerCase();
    return pName.toLowerCase().includes(searchLow) || dName.toLowerCase().includes(searchLow);
  });

  const getStatusBadge = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const appDate = new Date(dateString);
    appDate.setHours(0, 0, 0, 0);

    if (appDate.getTime() === today.getTime()) {
      return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">Today</span>;
    } else if (appDate > today) {
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">Upcoming</span>;
    } else {
      return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">Past</span>;
    }
  };

  return (
    <div className="bg-white rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 pb-2 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#f59e0b] text-white p-2.5 rounded-full flex items-center justify-center">
            <CalendarCheck size={22} />
          </div>
          <h2 className="text-[1.3rem] font-bold text-[#1e293b]">Appointment</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by patient or doctor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-64 placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Inputs Configuration Area */}
      <div className="p-6 pb-4">
        <div className="flex gap-2">
          <select 
            className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-white"
            value={patient} 
            onChange={e => setPatient(e.target.value)}
          >
            <option value="" disabled>Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <select 
            className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-white"
            value={doctor} 
            onChange={e => setDoctor(e.target.value)}
          >
            <option value="" disabled>Select Doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
          </select>
          
          <input 
            type="date" 
            className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-white" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
          
          <button 
            className="bg-[#3b82f6] hover:bg-blue-600 border border-blue-500 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
            onClick={addOrUpdateAppointment}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {/* Note: The mock image shows the 'Add' button in blue for Appointment, wait - no, 
              in the image the Appointment 'Add' button is blue, while the other two are grey.
              I will make the main 'Add' button in appointment blue with an icon just to match that. */}
        </div>
      </div>

      {/* List Area */}
      <div className="p-6 pt-0">
        <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
          <ul className="flex flex-col gap-1.5">
            {filteredAppointments.map(a => (
              <li key={a.id} className="flex items-center justify-between p-3 py-4 bg-white rounded-lg transition-all duration-200 border border-slate-200 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
                <div className="flex items-center gap-4 text-[15px] font-medium text-slate-700 pl-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-bold flex items-center gap-3">
                      {patients.find(p => p.id === a.patient)?.name || a.patient} 
                      <span className="text-slate-400 font-normal">with</span> 
                      Dr. {doctors.find(d => d.id === a.doctor)?.name || a.doctor}
                      {getStatusBadge(a.date)}
                    </span>
                    <span className="text-sm text-slate-500 font-normal mt-1 flex items-center gap-1.5">
                      <CalendarCheck size={14} className="text-amber-500" />
                      {a.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); editAppointment(a); }}
                    className="bg-yellow-50 hover:bg-yellow-400 text-yellow-700 hover:text-yellow-950 px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <EditIcon size={14} strokeWidth={2.5} />
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteAppointment(a.id); }}
                    className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {filteredAppointments.length === 0 && (
              <li className="p-4 text-center text-sm text-slate-500 font-medium">No appointments found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Appointment;