import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Prescription = {
  id: string;
  title: string;
  patient_name: string;
  age: string;
  gender: string;
  symptoms: string;
  history: string;
  ai_result: string;
  created_at: string;
};

const prescriptionFormatPrompt = (symptoms: string, history: string) =>
  `Patient symptoms: ${symptoms}
Medical history: ${history}
Based on the above, generate an AI prescription in the following format only (do not add any other text, disclaimers, or asterisks):

Analysing the Patient's symptoms and medical history, the best generated AI Prescription is as follows (As AI can make mistakes, kindly recheck thoroughly):

1. Diagnosis: 
2. Test/Surgery Suggested: 
3. Medications: 
4. Dosage and Instructions: 
5. Follow-up advice: 
6. Notes/Observations: 

Fill in each point with the appropriate content. Do not add anything else.`;

const Prescriptions = () => {
  const [title, setTitle] = useState("Mr");
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState("Male");
  const [patientName, setPatientName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setRecentPrescriptions(data as Prescription[]);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load recent prescriptions");
      }
    };
    fetchPrescriptions();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setAiResult("");

    try {
      // Validate inputs
      if (!symptoms.trim() || !history.trim()) {
        throw new Error("Please enter both symptoms and medical history");
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prescriptionFormatPrompt(symptoms, history),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      const result = data.result || "No result generated";
      setAiResult(result);

      // Save to Supabase
      const { error: dbError } = await supabase.from("prescriptions").insert([{
        title,
        age,
        gender,
        patient_name: patientName,
        symptoms,
        history,
        ai_result: result,
      }]);

      if (dbError) throw dbError;

      // Refresh recent prescriptions
      const { data: newData } = await supabase
        .from("prescriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (newData) setRecentPrescriptions(newData as Prescription[]);

    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Failed to generate prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-400 border-opacity-20">
          <h1 className="text-3xl font-bold text-white mb-2">AI Prescriptions</h1>
          <p className="text-gray-300">
            Generate AI-powered prescriptions based on patient symptoms and medical history.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 h-[600px] flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Prescription</h3>
            <div className="flex flex-col gap-4 flex-grow">
              <div className="flex-1 flex flex-col">
                <label className="block text-gray-300 mb-2">Patient Symptoms</label>
                <textarea
                  className="w-full flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none"
                  placeholder="Describe patient symptoms..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-gray-300 mb-2">Medical History</label>
                <textarea
                  className="w-full flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none"
                  placeholder="Relevant medical history..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 w-full disabled:opacity-50 transition-opacity"
                onClick={handleGenerate}
                disabled={loading || !symptoms.trim() || !history.trim()}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : "Generate AI Prescription"}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gray-900 border border-cyan-700 rounded-xl p-6 h-[600px] overflow-y-auto">
            <h4 className="text-xl font-semibold text-white mb-3">AI Generated Prescription</h4>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-medium">Error:</p>
                <p className="text-red-100">{error}</p>
              </div>
            )}

            {!aiResult && !loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  AI generated prescription will appear here.<br />
                  Enter symptoms and medical history to begin.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <svg className="animate-spin h-8 w-8 text-cyan-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-300">Generating prescription...</p>
                </div>
              </div>
            )}

            {aiResult && (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap text-gray-100 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  {aiResult}
                </pre>
                <button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg"
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    alert("Prescription copied to clipboard!");
                  }}
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Prescriptions</h3>
            <button 
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from("prescriptions")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(5);
                  if (error) throw error;
                  setRecentPrescriptions(data as Prescription[]);
                } catch (err) {
                  console.error("Refresh error:", err);
                  setError("Failed to refresh prescriptions");
                }
              }}
            >
              Refresh List
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentPrescriptions.length === 0 ? (
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400">No prescriptions found</p>
              </div>
            ) : (
              recentPrescriptions.map((entry) => (
                <div key={entry.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">
                        {entry.title} {entry.patient_name}, {entry.age} ({entry.gender})
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        <span className="font-semibold">Symptoms:</span> {entry.symptoms.slice(0, 100)}...
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        <span className="font-semibold">AI Result:</span> {entry.ai_result.slice(0, 100)}...
                      </p>
                    </div>
                    <span className="text-xs text-cyan-400 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;