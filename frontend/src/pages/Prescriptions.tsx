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
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) {
        console.error("Error fetching prescriptions:", error);
      } else if (data) {
        setRecentPrescriptions(data as Prescription[]);
      }
    };
    fetchPrescriptions();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setAiResult("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prescriptionFormatPrompt(symptoms, history),
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Invalid JSON response: " + text.slice(0, 100));
      }

      const data = await res.json();
      const result = data.result || "No result.";
      setAiResult(result);

      const { error: dbError } = await supabase.from("prescriptions").insert([
        {
          title,
          age,
          gender,
          patient_name: patientName,
          symptoms,
          history,
          ai_result: result,
        },
      ]);

      if (dbError) {
        console.error("Supabase insert error:", dbError);
        setError("Failed to save to database: " + dbError.message);
      } else {
        // Refresh recent prescriptions on successful insert
        const { data: newData, error: fetchError } = await supabase
          .from("prescriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (!fetchError && newData) {
          setRecentPrescriptions(newData as Prescription[]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching AI response:", err);
      setError(err.message || "Failed to generate prescription.");
      setAiResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-400 border-opacity-20">
          <h1 className="text-3xl font-bold text-white mb-2">AI Prescriptions</h1>
          <p className="text-gray-300">
            Generate AI-powered prescriptions based on patient symptoms and medical history.
          </p>
        </div>
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
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-gray-300 mb-2">Medical History</label>
                <textarea
                  className="w-full flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none"
                  placeholder="Relevant medical history..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                />
              </div>
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 w-full disabled:opacity-50"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate AI Prescription"}
              </button>
            </div>
          </div>
          {/* Output Section */}
          <div className="bg-gray-900 border border-cyan-700 rounded-xl p-6 h-[600px] overflow-y-auto">
            <h4 className="text-xl font-semibold text-white mb-3">AI Generated Prescription</h4>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {!aiResult && !loading && (
              <p className="text-gray-400 text-sm">
                This section will show the complete AI-generated prescription once generated.
              </p>
            )}
            {loading && <p className="text-gray-300 animate-pulse">Generating...</p>}
            {aiResult && (
              <pre className="whitespace-pre-wrap text-gray-100 overflow-y-auto max-h-96">{aiResult}</pre>
            )}
          </div>
        </div>
        {/* Doctor Form Section */}
        <div className="bg-gray-800 border border-cyan-600 border-opacity-30 rounded-xl p-6 shadow-md space-y-3 col-span-2 w-full">
          <h4 className="text-xl font-semibold text-white mb-3">Prescription (to be filled by the doctor)</h4>
          <div>
            <label className="block text-gray-300 mb-1">Title</label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
            >
              <option>Master</option>
              <option>Miss</option>
              <option>Mr</option>
              <option>Mrs</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Patient Name</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={1}
              placeholder="Enter patient name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Age</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
            >
              {Array.from({ length: 100 }, (_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          {/* Doctor's Fields - not saved, just for UI */}
          {[
            { label: "Diagnosis", placeholder: "e.g., Type 2 Diabetes Mellitus" },
            { label: "Test/Surgery Suggested", placeholder: "e.g., CBC, MRI, or Appendectomy" },
            { label: "Medications", placeholder: "e.g., Metformin 500mg twice a day" },
            { label: "Dosage & Instructions", placeholder: "e.g., After meals, 12-hour gap" },
            { label: "Follow-up Advice", placeholder: "e.g., Review after 15 days with fasting sugar report" },
            { label: "Notes / Observations", placeholder: "e.g., Patient should avoid sugary food." }
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-gray-300 mb-1">{field.label}</label>
              <textarea
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
                rows={2}
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <div className="text-right mt-4">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg">
              Download PDF
            </button>
          </div>
        </div>
        {/* Recent Prescriptions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 overflow-y-auto max-h-[500px]">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Prescriptions</h3>
          <div className="space-y-3">
            {recentPrescriptions.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent prescriptions found.</p>
            ) : (
              recentPrescriptions.map((entry) => (
                <div key={entry.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">Patient: {entry.title} {entry.patient_name}, Age: {entry.age}, Gender: {entry.gender}</h4>
                      <p className="text-gray-400 text-sm">
                        <strong>Symptoms:</strong> {entry.symptoms.slice(0, 80)}...
                      </p>
                      <p className="text-gray-400 text-sm">
                        <strong>AI Result:</strong> {entry.ai_result.slice(0, 80)}...
                      </p>
                    </div>
                    <span className="text-xs text-cyan-400">
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
