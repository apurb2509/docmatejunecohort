import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import html2pdf from "html2pdf.js";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/context/UserProfileContext";

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

  // Doctor form state
  const [diagnosis, setDiagnosis] = useState("");
  const [testSurgery, setTestSurgery] = useState("");
  const [medications, setMedications] = useState("");
  const [dosageInstructions, setDosageInstructions] = useState("");
  const [followUpAdvice, setFollowUpAdvice] = useState("");
  const [notesObservations, setNotesObservations] = useState("");

  // Get doctor info from Clerk
  const { user } = useUser();
  const { profile } = useUserProfile();
  const [doctorName, setDoctorName] = useState("Dr. John Doe");
  const [doctorSpecialization, setDoctorSpecialization] = useState("General Physician");

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

    // Set doctor info from user profile
    if (user && profile) {
      setDoctorName(user.fullName ? `Dr. ${user.fullName}` : "Dr. John Doe");
      setDoctorSpecialization(profile.specialization || "General Physician");
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setAiResult("");
    setDiagnosis("");
    setTestSurgery("");
    setMedications("");
    setDosageInstructions("");
    setFollowUpAdvice("");
    setNotesObservations("");
    try {
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
      const formattedResult = `
Note: The following prescription is AI-generated and intended for informational purposes only. It must be reviewed and confirmed by a licensed medical professional before use.
${result
        .split("\n")
        .map((line) => {
          const match = line.match(/^(\d+\. .+?:)/);
          if (match) {
            return `${line}\n`;
          }
          return line;
        })
        .join("\n")}
`;

      setAiResult(formattedResult.trim());

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

  const handleAutofill = () => {
    if (!aiResult) {
      alert("No AI result available to autofill.");
      return;
    }
    const lines = aiResult.split("\n");
    const extractValue = (prefix: string): string => {
      const line = lines.find((line) => line.startsWith(prefix));
      return line ? line.replace(prefix, "").trim().replace(/[\.\:\s]+$/, "") : "";
    };

    setDiagnosis(extractValue("1. Diagnosis:"));
    setTestSurgery(extractValue("2. Test/Surgery Suggested:"));
    setMedications(extractValue("3. Medications:"));
    setDosageInstructions(extractValue("4. Dosage and Instructions:"));
    setFollowUpAdvice(extractValue("5. Follow-up advice:"));
    setNotesObservations(extractValue("6. Notes/Observations:"));
  };

  const handleDownloadPDF = () => {
    if (
      !title ||
      !patientName ||
      !age ||
      !gender ||
      !diagnosis ||
      !testSurgery ||
      !medications ||
      !dosageInstructions ||
      !followUpAdvice ||
      !notesObservations
    ) {
      alert("Please fill out all required fields before downloading the PDF.");
      return;
    }

    const pdfContentDiv = document.createElement("div");
    pdfContentDiv.style.padding = "20px";
    pdfContentDiv.style.width = "800px";
    document.body.appendChild(pdfContentDiv);

    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    pdfContentDiv.innerHTML = `
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .doctor-info {
          font-size: 16px;
          margin-bottom: 5px;
        }
        .contact-info {
          font-size: 14px;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 12px;
          vertical-align: top;
        }
        th {
          background-color: #e5e7eb;
          font-weight: bold;
          color: #1f2937;
        }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signature {
          text-align: center;
          margin-top: 40px;
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #000;
          margin: 0 auto;
          margin-top: 50px;
        }
        .stamp-placeholder {
          width: 100px;
          height: 100px;
          border: 1px dashed #999;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .prescription-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1e40af;
        }
      </style>
      <div class="header">
        <div class="clinic-name">N6T Technologies</div>
        <div class="doctor-info">${doctorName}, ${doctorSpecialization}</div>
        <div class="contact-info">
          Email: info@n6t.com | Phone: +91 1234 5678 | Address: Medical Complex, Bangalore
        </div>
      </div>
      <div class="prescription-title">MEDICAL PRESCRIPTION</div>
      <table>
        <tr><th style="width: 30%;">Patient Name:</th><td>${title} ${patientName}</td></tr>
        <tr><th>Age:</th><td>${age}</td></tr>
        <tr><th>Gender:</th><td>${gender}</td></tr>
        <tr><th>Date & Time:</th><td>${formattedTime}</td></tr>
        <tr><th>Diagnosis:</th><td>${diagnosis}</td></tr>
        <tr><th>Test/Surgery Suggested:</th><td>${testSurgery}</td></tr>
        <tr><th>Medications:</th><td>${medications}</td></tr>
        <tr><th>Dosage & Instructions:</th><td>${dosageInstructions}</td></tr>
        <tr><th>Follow-up Advice:</th><td>${followUpAdvice}</td></tr>
        <tr><th>Notes / Observations:</th><td>${notesObservations}</td></tr>
      </table>
      <div class="footer">
        <div class="signature">
          <div class="stamp-placeholder">Doctor's Stamp</div>
          <div class="signature-line"></div>
          <p><strong>Signature:</strong></p>
        </div>
        <div style="font-size: 0.8em; color: #666;">
          <p>This is a computer generated prescription</p>
          <p>Valid only with doctor's signature and stamp</p>
        </div>
      </div>
    `;

    html2pdf()
      .set({
        margin: 10,
        filename: `Prescription_${patientName.replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfContentDiv)
      .save()
      .then(async () => {
        document.body.removeChild(pdfContentDiv);

        // Refresh recent prescriptions after download
        const { data: newData } = await supabase
          .from("prescriptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (newData) setRecentPrescriptions(newData as Prescription[]);
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        alert("Failed to generate PDF. Please try again.");
        document.body.removeChild(pdfContentDiv);
      });
  };

  const refreshPrescriptions = async () => {
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
  };

  const handleDownloadFromList = (entry: Prescription) => {
    const {
      patient_name: pName,
      age: pAge,
      gender: pGender,
      title: pTitle,
      ai_result: aiRes,
    } = entry;

    const diagnosis = extractAIField(aiRes, "1. Diagnosis:");
    const testSurgery = extractAIField(aiRes, "2. Test/Surgery Suggested:");
    const medications = extractAIField(aiRes, "3. Medications:");
    const dosageInstructions = extractAIField(aiRes, "4. Dosage and Instructions:");
    const followUpAdvice = extractAIField(aiRes, "5. Follow-up advice:");
    const notesObservations = extractAIField(aiRes, "6. Notes/Observations:");

    const pdfContentDiv = document.createElement("div");
    pdfContentDiv.style.padding = "20px";
    pdfContentDiv.style.width = "800px";
    document.body.appendChild(pdfContentDiv);

    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    pdfContentDiv.innerHTML = `
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .doctor-info {
          font-size: 16px;
          margin-bottom: 5px;
        }
        .contact-info {
          font-size: 14px;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 12px;
          vertical-align: top;
        }
        th {
          background-color: #e5e7eb;
          font-weight: bold;
          color: #1f2937;
        }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signature {
          text-align: center;
          margin-top: 40px;
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #000;
          margin: 0 auto;
          margin-top: 50px;
        }
        .stamp-placeholder {
          width: 100px;
          height: 100px;
          border: 1px dashed #999;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .prescription-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1e40af;
        }
      </style>
      <div class="header">
        <div class="clinic-name">N6T Technologies</div>
        <div class="doctor-info">${doctorName}, ${doctorSpecialization}</div>
        <div class="contact-info">
          Email: info@n6t.com | Phone: +91 1234 5678 | Address: Medical Complex, Bangalore
        </div>
      </div>
      <div class="prescription-title">MEDICAL PRESCRIPTION</div>
      <table>
        <tr><th style="width: 30%;">Patient Name:</th><td>${pTitle} ${pName}</td></tr>
        <tr><th>Age:</th><td>${pAge}</td></tr>
        <tr><th>Gender:</th><td>${pGender}</td></tr>
        <tr><th>Date & Time:</th><td>${formattedTime}</td></tr>
        <tr><th>Diagnosis:</th><td>${diagnosis}</td></tr>
        <tr><th>Test/Surgery Suggested:</th><td>${testSurgery}</td></tr>
        <tr><th>Medications:</th><td>${medications}</td></tr>
        <tr><th>Dosage & Instructions:</th><td>${dosageInstructions}</td></tr>
        <tr><th>Follow-up Advice:</th><td>${followUpAdvice}</td></tr>
        <tr><th>Notes / Observations:</th><td>${notesObservations}</td></tr>
      </table>
      <div class="footer">
        <div class="signature">
          <div class="stamp-placeholder">Doctor's Stamp</div>
          <div class="signature-line"></div>
          <p><strong>Signature:</strong></p>
        </div>
        <div style="font-size: 0.8em; color: #666;">
          <p>This is a computer generated prescription</p>
          <p>Valid only with doctor's signature and stamp</p>
        </div>
      </div>
    `;

    html2pdf()
      .set({
        margin: 10,
        filename: `Prescription_${pName.replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfContentDiv)
      .save()
      .then(() => {
        document.body.removeChild(pdfContentDiv);
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        alert("Failed to generate PDF. Please try again.");
        document.body.removeChild(pdfContentDiv);
      });
  };

  const extractAIField = (text: string, prefix: string): string => {
    const lines = text.split("\n");
    const match = lines.find((line) => line.startsWith(prefix));
    return match ? match.replace(prefix, "").trim() : "";
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
          <div className="bg-gradient-to-br from-[#21314d] to-[#2e5ba3] border border-gray-700 rounded-xl p-6 h-[600px] flex flex-col">
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
                ) : (
                  "Generate AI Prescription"
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gray-900 border bg-gradient-to-br from-[#21314d] to-[#2e5ba3] border border-gray-700 border-[#2e5ba3] rounded-xl p-6 h-[600px] overflow-y-auto">
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
                  onClick={handleAutofill}
                >
                  Autofill Prescription
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Form (to be filled by the doctor) */}
        <div className="bg-gray-800 border bg-gradient-to-br from-[#21314d] to-[#2e5ba3] border border-gray-700 border-[#2e5ba3] border-opacity-30 rounded-xl p-6 shadow-md space-y-3">
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
          <div>
            <label className="block text-gray-300 mb-1">Diagnosis</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., Type 2 Diabetes Mellitus"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Test/Surgery Suggested</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., CBC, MRI, or Appendectomy"
              value={testSurgery}
              onChange={(e) => setTestSurgery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Medications</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., Metformin 500mg twice a day"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Dosage & Instructions</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., After meals, 12-hour gap"
              value={dosageInstructions}
              onChange={(e) => setDosageInstructions(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Follow-up Advice</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., Review after 15 days with fasting sugar report"
              value={followUpAdvice}
              onChange={(e) => setFollowUpAdvice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Notes / Observations</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white"
              rows={2}
              placeholder="e.g., Patient should avoid sugary food."
              value={notesObservations}
              onChange={(e) => setNotesObservations(e.target.value)}
            />
          </div>
          <div className="text-right mt-4">
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-gradient-to-br from-[#21314d] to-[#2e5ba3] border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Prescriptions</h3>
            <button
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              onClick={refreshPrescriptions}
            >
              Refresh List
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 text-white border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700">#</th>
                  <th className="py-2 px-4 border-b border-gray-700">Patient Name</th>
                  <th className="py-2 px-4 border-b border-gray-700">Age</th>
                  <th className="py-2 px-4 border-b border-gray-700">Download</th>
                </tr>
              </thead>
              <tbody>
                {recentPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">
                      No prescriptions found
                    </td>
                  </tr>
                ) : (
                  recentPrescriptions.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-700 text-center">{index + 1}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{entry.patient_name}</td>
                      <td className="py-3 px-4 border-b border-gray-700 text-center">{entry.age}</td>
                      <td className="py-3 px-4 border-b border-gray-700 text-center">
                        <button
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 rounded"
                          onClick={() => handleDownloadFromList(entry)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Prescriptions;