'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // Sample appointments data (in a real app, this would come from an API)
  const appointments = [
    { 
      id: 1, 
      patientName: 'John Doe', 
      patientEmail: 'john@example.com',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'City Hospital',
      date: '2023-06-15',
      time: '10:00 AM',
      status: 'scheduled',
      type: 'General Checkup',
      notes: 'Regular health checkup'
    },
    { 
      id: 2, 
      patientName: 'Emily Davis', 
      patientEmail: 'emily@example.com',
      doctorName: 'Dr. Michael Wilson',
      hospitalName: 'Metro Medical Center',
      date: '2023-06-15',
      time: '2:30 PM',
      status: 'completed',
      type: 'Follow-up',
      notes: 'Post-surgery follow-up'
    },
    { 
      id: 3, 
      patientName: 'Sarah Brown', 
      patientEmail: 'sarah@example.com',
      doctorName: 'Dr. Robert Johnson',
      hospitalName: 'City Hospital',
      date: '2023-06-16',
      time: '9:15 AM',
      status: 'scheduled',
      type: 'Specialist Consultation',
      notes: 'Cardiology consultation'
    },
    { 
      id: 4, 
      patientName: 'David Miller', 
      patientEmail: 'david@example.com',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'City Hospital',
      date: '2023-06-14',
      time: '11:45 AM',
      status: 'cancelled',
      type: 'General Checkup',
      notes: 'Patient cancelled due to emergency'
    },
    { 
      id: 5, 
      patientName: 'Lisa Taylor', 
      patientEmail: 'lisa@example.com',
      doctorName: 'Dr. Michael Wilson',
      hospitalName: 'Metro Medical Center',
      date: '2023-06-16',
      time: '4:00 PM',
      status: 'scheduled',
      type: 'Vaccination',
      notes: 'COVID-19 vaccination'
    },
  ];

  // Filter appointments based on status and date filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = filterDate === 'all' || appointment.date === filterDate;
    
    return matchesStatus && matchesDate;
  });

  // Get unique dates for filter dropdown
  const uniqueDates = ['all', ...new Set(appointments.map(appointment => appointment.date))];

  // Status badge color mapping
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Appointment Management</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Schedule New Appointment
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track all patient appointments across hospitals and doctors.
        </p>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="sm:w-64">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Filter by Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sm:w-64">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Filter by Date
            </label>
            <select
              id="date"
              name="date"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {date === 'all' ? 'All Dates' : date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="mt-6 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Doctor & Hospital
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {appointment.patientName.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                          <div className="text-sm text-gray-500">{appointment.hospitalName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status as 'scheduled' | 'completed' | 'cancelled']}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/dashboard/appointments/${appointment.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            View
                          </a>
                          {appointment.status === 'scheduled' && (
                            <>
                              <a href={`/dashboard/appointments/${appointment.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                Edit
                              </a>
                              <button className="text-red-600 hover:text-red-900">
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">No appointments found matching the selected filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}