import { useState } from "react";
import "./ResumeUpload.css";
import Sidebar from "./Sidebar";
import { MdDescription } from "react-icons/md";
import { BsFileEarmarkArrowDownFill } from "react-icons/bs";

function ResumeUpload({ navigate, user, setUser, theme, setTheme, analysisData, setAnalysisData }) {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState(null);
  const [skills, setSkills] = useState("");
  const [suggestions, setSuggestions] = useState("");

  return (
    <div className="page-wrapper">
      <Sidebar active="resume-upload" navigate={navigate} user={user} />

      <div className="main-content">
        <div className="upload-container">
          
          {/* Page Headers */}
          <div className="upload-header-section">
            <h1 className="upload-title">Welcome, {user?.name || "User"}!</h1>
            <p className="upload-subtitle">
              Upload your resume and job description to analyze your match
            </p>
          </div>

          <div className="upload-box">
            
            {/* --- 1. RESUME UPLOAD SECTION --- */}
            <div className="section-header">
              <MdDescription className="section-icon" size={32} />
              <div className="section-text">
                <h2>Upload Resume</h2>
                <p>Upload your resume in PDF/DOCX format</p>
              </div>
            </div>

            <div className="drop-area">
              <BsFileEarmarkArrowDownFill color="#3563d8" size={70} />
              <h2>Drag & Drop Resume Here</h2>
              <h3>or</h3>

              <input
                type="file"
                id="resume-upload"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />

              <label htmlFor="resume-upload" className="browse-btn">
                Browse Files
              </label>

              {resume && (
                <p className="selected-file-text">
                  Selected File: {resume.name}
                </p>
              )}
            </div>

            {/* --- 2. JOB DESCRIPTION SECTION --- */}
            <div className="section-header" style={{ marginTop: '32px' }}>
              <MdDescription className="section-icon" size={32} />
              <div className="section-text">
                <h2>Job Description</h2>
                <p>Paste your job description here to compare with resume</p>
              </div>
            </div>

            {/* This textarea now has the exact same layout as the drop area! */}
            <textarea
              className="job-textarea"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            {/* --- 3. ANALYZE BUTTON & RESULTS (Untouched Logic) --- */}
            <button
              className="analyze-btn"
              onClick={async () => {
                if (!resume) {
                  alert("Please select a resume");
                  return;
                }

                const formData = new FormData();
                formData.append("resume_file", resume);
                formData.append("job_description", jobDescription);
                formData.append("user_email", user?.email || "test@gmail.com"); 

                try {
                  // ONLY THIS URL WAS CHANGED TO YOUR LIVE BACKEND
                  const response = await fetch("https://tonyleo123-resume-api.hf.space/analyze-resume", {
                    method: "POST",
                    body: formData, 
                  });

                  const data = await response.json();

                  // ADD THIS LINE:
                  setAnalysisData({ ...data, name: resume.name, job: "Analyzed Role" }); 

                  setScore(data.score);
                  setSkills(data.skillsFound);
                  setSuggestions(data.suggestions);

                } catch (error) {
                  console.error(error);
                  alert("Error analyzing resume");
                }
              }}
            >
              Analyze Resume
            </button>

            {score && (
              <div className="result-box">
                <h2>Analysis Result</h2>
                <p><strong>Match Score:</strong> {score}%</p>
                <p><strong>Skills Found:</strong> {skills}</p>
                <p><strong>Suggestions:</strong> {suggestions}</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;