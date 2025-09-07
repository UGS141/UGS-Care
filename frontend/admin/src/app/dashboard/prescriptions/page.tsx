'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PrescriptionsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample prescriptions data (in a real app, this would come from an API)
  const prescriptions = [
    { 
      id: 'RX-2023-001', 
      patientName: 'John Doe', 
      patientEmail: 'john@example.com',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'City Hospital',
      date: '2023-06-10',
      status: 'active',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' },
        { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '3 days' }
      ],
      notes: 'Take with food. Complete the full course of antibiotics.'
    },
    { 
      id: 'RX-2023-002', 
      patientName: 'Emily Davis', 
      patientEmail: 'emily@example.com',
      doctorName: 'Dr. Michael Wilson',
      hospitalName: 'Metro Medical Center',
      date: '2023-06-08',
      status: 'active',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days' }
      ],
      notes: 'Take in the morning. Monitor blood pressure regularly.'
    },
    { 
      id: 'RX-2023-003', 
      patientName: 'Sarah Brown', 
      patientEmail: 'sarah@example.com',
      doctorName: 'Dr. Robert Johnson',
      hospitalName: 'City Hospital',
      date: '2023-05-25',
      status: 'expired',
      medications: [
        { name: 'Prednisone', dosage: '20mg', frequency: 'Once daily', duration: '5 days' },
        { name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed', duration: '30 days' }
      ],
      notes: 'Taper prednisone as directed. Use inhaler before exercise if needed.'
    },
    { 
      id: 'RX-2023-004', 
      patientName: 'David Miller', 
      patientEmail: 'david@example.com',
      doctorName: 'Dr. Jane Smith',
      hospitalName: 'City Hospital',
      date: '2023-06-12',
      status: 'active',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '90 days' }
      ],
      notes: 'Take metformin with meals to reduce GI side effects. Regular blood tests required.'
    },
    { 
      id: 'RX-2023-005', 
      patientName: 'Lisa Taylor', 
      patientEmail: 'lisa@example.com',
      doctorName: 'Dr. Michael Wilson',
      hospitalName: 'Metro Medical Center',
      date: '2023-05-15',
      status: 'expired',
      medications: [
        { name: 'Ciprofloxacin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' }
      ],
      notes: 'Avoid dairy products and antacids while taking this medication.'
    },
  ];

  // Filter prescriptions based on search term and status filter
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Status badge color mapping
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Prescription Management</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Prescription
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track all prescriptions issued by doctors to patients.
        </p>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by patient, doctor, or prescription ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-64">
            <label htmlFor="status" className="sr-only">
              Filter by Status
            </label>
            <select
              id="status"
              name="status"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <li key={prescription.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {prescription.id}
                        </p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[prescription.status as keyof typeof statusColors]}`}>
                          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <p><span className="font-medium">Patient:</span> {prescription.patientName}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p><span className="font-medium">Doctor:</span> {prescription.doctorName}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p><span className="font-medium">Hospital:</span> {prescription.hospitalName}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <p><span className="font-medium">Date:</span> {prescription.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a 
                        href={`/dashboard/prescriptions/${prescription.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View
                      </a>
                      {prescription.status === 'active' && (
                        <a 
                          href={`/dashboard/prescriptions/${prescription.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">Medications:</p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="bg-gray-50 px-4 py-2 rounded-md">
                          <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                          <p className="text-sm text-gray-500">{medication.dosage}, {medication.frequency}</p>
                          <p className="text-sm text-gray-500">Duration: {medication.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {prescription.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">Notes:</p>
                      <p className="mt-1 text-sm text-gray-500">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">No prescriptions found matching the search criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}