import React, { useEffect, useState } from "react";
import axios from "axios";
import { Stethoscope, Plus, Edit as EditIcon, Trash2, Search, Download } from "lucide-react";

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API = "http://127.0.0.1:8000/api/doctors/";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(API);
        setDoctors(res.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  const addOrUpdateDoctor = async () => {
    if (!name || !specialization) return alert("Fill all fields!");
    try {
      if (editingId) {
        await axios.put(API + editingId + "/", { name, specialization });
        setEditingId(null);
      } else {
        await axios.post(API, { name, specialization });
      }
      setName(""); setSpecialization("");

      const res = await axios.get(API);
      setDoctors(res.data);
    } catch (error) {
      console.error("Error adding/updating doctor:", error);
    }
  };

  const editDoctor = (d) => {
    setEditingId(d.id);
    setName(d.name);
    setSpecialization(d.specialization);
  };

  const deleteDoctor = async (id) => {
    try {
      await axios.delete(API + id + "/");
      const res = await axios.get(API);
      setDoctors(res.data);
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const handleTopRightAdd = () => {
    setEditingId(null);
    setName(""); setSpecialization("");
  };

  const exportToCSV = () => {
    if (doctors.length === 0) return alert("No doctors to export!");
    const headers = ["ID,Name,Specialization"];
    const csvRows = doctors.map(d => `${d.id},"${d.name}","${d.specialization}"`);
    const csvContent = headers.concat(csvRows).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "doctors_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] text-white p-2.5 rounded-full flex items-center justify-center">
            <Stethoscope size={22} />
          </div>
          <h2 className="text-[1.3rem] font-bold text-[#1e293b]">Doctor</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 placeholder:text-slate-400"
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
          <input 
            className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal" 
            placeholder="Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <input 
            className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal" 
            placeholder="Specialization" 
            value={specialization} 
            onChange={e => setSpecialization(e.target.value)} 
          />
          <button 
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-6 py-2.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
            onClick={addOrUpdateDoctor}
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="p-6 pt-0">
        <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3">
          <ul className="flex flex-col gap-1.5">
            {filteredDoctors.map(d => (
              <li key={d.id} className="flex items-center justify-between p-3 py-4 bg-white rounded-lg transition-all duration-200 border border-slate-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
                <div className="flex items-center gap-4 text-[15px] font-medium text-slate-700 pl-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-bold">{d.name}</span>
                    <span className="text-sm text-slate-500 font-normal">{d.specialization}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); editDoctor(d); }}
                    className="bg-yellow-50 hover:bg-yellow-400 text-yellow-700 hover:text-yellow-950 px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <EditIcon size={14} strokeWidth={2.5} />
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteDoctor(d.id); }}
                    className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {filteredDoctors.length === 0 && (
              <li className="p-4 text-center text-sm text-slate-500 font-medium">No doctors found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Doctor;