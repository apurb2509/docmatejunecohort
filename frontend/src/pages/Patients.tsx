import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-400 border-opacity-20">
          <h1 className="text-3xl font-bold text-white mb-2">Patient Management</h1>
          <p className="text-gray-300">
            Manage patient records, view medical history, and track treatment progress.
          </p>
        </div>

        {/* Search Section */}
        <div className="rounded-xl p-6 border border-gray-700 space-y-4 bg-gradient-to-br from-[#21314d] to-[#2e5ba3]">
          <h3 className="text-xl font-semibold text-white">Search Patients</h3>
          <p className="text-gray-300">Find patients by name, ID, or medical condition.</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <Input
              type="text"
              placeholder="Search by name, ID or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-gray-800 text-white placeholder-gray-400 border-gray-600"
            />
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-2 rounded-lg hover:opacity-90">
              Search
            </Button>
          </div>
        </div>

        {/* Add Patient & Patient Reports */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Add New Patient Box */}
          <div className="rounded-xl p-6 border border-blue-200 w-full lg:w-1/2 bg-gradient-to-br from-[#21314d] to-[#2e5ba3]">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Patient</h3>
            <p className="text-gray-200 mb-4">
              Register a new patient and create their medical profile.
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:opacity-90">
              Add Patient
            </button>
          </div>

          {/* Patient Reports Box */}
          <div className="rounded-xl p-6 border border-blue-200 w-full lg:w-1/2 bg-gradient-to-br from-[#21314d] to-[#2e5ba3]">
            <h3 className="text-xl font-semibold text-white mb-4">Patient Reports</h3>
            <p className="text-gray-200 mb-4">
              Generate comprehensive patient reports and summaries.
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90">
              Generate
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Patients;
