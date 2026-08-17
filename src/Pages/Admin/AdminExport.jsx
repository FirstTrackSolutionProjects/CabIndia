// src/Pages/Admin/AdminExport.jsx
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AdminExport() {
  const [loading, setLoading] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleExport = async (type, format = 'csv') => {
    setLoading(type);
    try {
      const response = await api.get(`/api/admin/export/${type}`, {
        params: {
          format,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`✅ ${type} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(null);
    }
  };

  const exportTypes = [
    { id: 'users', label: 'Users', icon: '👤', color: 'blue' },
    { id: 'rides', label: 'Rides', icon: '🚗', color: 'green' },
    { id: 'payments', label: 'Payments', icon: '💰', color: 'yellow' },
    { id: 'drivers', label: 'Captains', icon: '👨‍✈️', color: 'purple' },
    { id: 'tickets', label: 'Support Tickets', icon: '🎫', color: 'red' },
  ];

  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20',
    red: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">📊 Export Data</h3>
          <p className="text-gray-400 text-sm">Export data for analysis and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-yellow-400/50"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-yellow-400/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {exportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleExport(type.id)}
            disabled={loading === type.id}
            className={`p-4 rounded-xl border transition-all text-center ${colors[type.color]} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
              {loading === type.id ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>Exports are generated as CSV files</span>
        <div className="flex gap-4">
          <span>📅 Date range optional</span>
          <span>📊 Includes all columns</span>
        </div>
      </div>
    </div>
  );
}