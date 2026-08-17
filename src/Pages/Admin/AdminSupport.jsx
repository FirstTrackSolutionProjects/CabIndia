// src/Pages/Admin/AdminSupport.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Ticket, User, Calendar, CheckCircle, Clock, AlertCircle, X, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTicket, setEditingTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/admin/tickets');
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId, data) => {
    try {
      await api.put(`/api/admin/tickets/${ticketId}`, data);
      toast.success('Ticket updated successfully');
      fetchTickets();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'open': 'bg-yellow-500/20 text-yellow-400',
      'in_progress': 'bg-blue-500/20 text-blue-400',
      'resolved': 'bg-green-500/20 text-green-400',
      'closed': 'bg-gray-500/20 text-gray-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'low': 'bg-gray-500/20 text-gray-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'high': 'bg-orange-500/20 text-orange-400',
      'urgent': 'bg-red-500/20 text-red-400',
    };
    return styles[priority] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredTickets = tickets.filter(ticket =>
    (ticket.ticket_id?.toLowerCase().includes(search.toLowerCase()) ||
     ticket.name?.toLowerCase().includes(search.toLowerCase()) ||
     ticket.email?.toLowerCase().includes(search.toLowerCase()) ||
     ticket.category?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || ticket.status === filter)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-gray-500 text-sm">{filteredTickets.length} tickets found</p>
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === status ? 'bg-yellow-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search tickets by ID, user, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-yellow-400/50 transition-all"
          />
        </div>

        {/* Tickets Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Ticket</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Category</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Priority</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-yellow-400" />
                        <span className="font-mono text-sm">{ticket.ticket_id || ticket.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                          {ticket.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ticket.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{ticket.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{ticket.category || '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority || 'medium'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status?.replace('_', ' ') || 'open'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(ticket.created_at || ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setEditingTicket(ticket);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingTicket && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update Ticket</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Ticket ID: <span className="font-mono text-yellow-400">{editingTicket.ticket_id || editingTicket.id}</span></p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select
                    value={editingTicket.status || 'open'}
                    onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-400/50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Priority</label>
                  <select
                    value={editingTicket.priority || 'medium'}
                    onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-400/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-gray-400 block mb-1">Description</p>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                    {editingTicket.description}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateTicket(editingTicket.id, {
                      status: editingTicket.status,
                      priority: editingTicket.priority,
                    })}
                    className="flex-1 py-2 rounded-xl bg-yellow-400 text-gray-950 font-bold hover:bg-yellow-300 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}