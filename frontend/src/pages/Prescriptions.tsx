
import MainLayout from "@/components/layout/MainLayout";

const Prescriptions = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-400 border-opacity-20">
          <h1 className="text-3xl font-bold text-white mb-2">AI Prescriptions</h1>
          <p className="text-gray-300">Generate AI-powered prescriptions based on patient symptoms and medical history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Prescription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Patient Symptoms</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Describe patient symptoms..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Medical History</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Relevant medical history..."
                  rows={3}
                />
              </div>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 w-full">
                Generate AI Prescription
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Prescriptions</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">John Smith</h4>
                    <p className="text-gray-400 text-sm">Hypertension Treatment</p>
                  </div>
                  <span className="text-xs text-cyan-400">2 hours ago</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">Maria Garcia</h4>
                    <p className="text-gray-400 text-sm">Diabetes Management</p>
                  </div>
                  <span className="text-xs text-cyan-400">4 hours ago</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">David Johnson</h4>
                    <p className="text-gray-400 text-sm">Antibiotic Therapy</p>
                  </div>
                  <span className="text-xs text-cyan-400">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;
