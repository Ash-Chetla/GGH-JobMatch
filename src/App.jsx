import { useState, useRef } from "react";

const C = {
  white: "#FFFFFF",
  bg: "#F7F8FA",
  card: "#FFFFFF",
  border: "#E8EBF0",
  borderLight: "#F0F2F5",
  accent: "#1A7A4A",
  accentLight: "#E8F5EE",
  accentMid: "#2EA86A",
  text: "#0D1117",
  textMid: "#4A5568",
  muted: "#8A94A6",
  danger: "#E53E3E",
  dangerLight: "#FFF5F5",
  warn: "#D97706",
  warnLight: "#FFFBEB",
  good: "#1A7A4A",
  goodLight: "#E8F5EE",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
};

const scoreColor = (s) => s >= 75 ? C.good : s >= 50 ? C.warn : C.danger;
const scoreBg = (s) => s >= 75 ? C.goodLight : s >= 50 ? C.warnLight : C.dangerLight;
const scoreLabel = (s) => s >= 75 ? "Strong Match" : s >= 50 ? "Partial Match" : "Weak Match";

const CircleScore = ({ score }) => {
  const r = 52, circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle cx="68" cy="68" r={r} fill="none" stroke={C.border} strokeWidth="8" />
      <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 68 68)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      <text x="68" y="62" textAnchor="middle" fill={C.text} fontSize="30" fontWeight="700" fontFamily="Georgia, serif">{score}</text>
      <text x="68" y="80" textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="Georgia, serif">out of 100</text>
    </svg>
  );
};

const Chip = ({ text, type }) => {
  const styles = {
    found: { bg: C.goodLight, color: C.good, border: "#B7E4CC" },
    missing: { bg: C.dangerLight, color: C.danger, border: "#FEB2B2" },
  }[type] || { bg: C.bg, color: C.textMid, border: C.border };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "4px 12px",
      borderRadius: "20px", fontSize: "12px", fontWeight: "500",
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border}`, margin: "3px", fontFamily: "Georgia, serif"
    }}>{type === "found" ? "✓ " : "○ "}{text}</span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, borderRadius: "16px", border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "24px", ...style }}>{children}</div>
);

const SectionLabel = ({ children, color = C.muted }) => (
  <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color, marginBottom: "12px", fontFamily: "Georgia, serif" }}>{children}</div>
);

// Tab toggle component
const TabToggle = ({ active, tabs, onChange }) => (
  <div style={{ display: "flex", background: C.bg, borderRadius: "10px", padding: "3px", marginBottom: "12px", border: `1px solid ${C.border}` }}>
    {tabs.map(tab => (
      <button key={tab.id} onClick={() => onChange(tab.id)} style={{
        flex: 1, padding: "7px 10px", borderRadius: "7px", border: "none",
        background: active === tab.id ? C.white : "transparent",
        color: active === tab.id ? C.accent : C.muted,
        fontWeight: active === tab.id ? "600" : "400",
        fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif",
        boxShadow: active === tab.id ? C.shadow : "none",
        transition: "all 0.15s"
      }}>{tab.label}</button>
    ))}
  </div>
);

// File upload zone
const FileUploadZone = ({ onFileRead, fileName, label }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const readFile = async (file) => {
    if (!file) return;
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ") + "
";
        }
        onFileRead(text, file.name);
      } catch (e) {
        alert("Could not read PDF. Please try copying and pasting the text instead.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => onFileRead(e.target.result, file.name);
      reader.readAsText(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${dragging ? C.accent : fileName ? C.accent : C.border}`,
        borderRadius: "10px", padding: "28px 20px", textAlign: "center",
        cursor: "pointer", background: fileName ? C.accentLight : dragging ? "#F0FBF5" : C.bg,
        transition: "all 0.2s"
      }}>
      <input ref={inputRef} type="file" accept=".txt,.doc,.docx,.pdf" style={{ display: "none" }}
        onChange={e => readFile(e.target.files[0])} />
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{fileName ? "✅" : "📎"}</div>
      {fileName ? (
        <div style={{ color: C.accent, fontSize: "13px", fontWeight: "600" }}>{fileName}</div>
      ) : (
        <>
          <div style={{ color: C.textMid, fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
            Drop your {label} here
          </div>
          <div style={{ color: C.muted, fontSize: "11px" }}>or click to browse · .txt, .doc, .docx, .pdf</div>
        </>
      )}
    </div>
  );
};

export default function GGHJobMatch() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobFileName, setJobFileName] = useState("");
  const [resumeMode, setResumeMode] = useState("paste"); // paste | upload
  const [jobMode, setJobMode] = useState("paste"); // paste | upload
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyse = async () => {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please provide both your resume and the job description to continue.");
      return;
    }
    setError(""); setLoading(true); setResult(null);
    const prompt = `You are a senior recruitment consultant. Analyse the resume against the job description and return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{"score":<0-100>,"verdict":"<one clear sentence>","foundKeywords":["..."],"missingKeywords":["..."],"tips":[{"category":"<category>","tip":"<actionable advice>"}],"strengths":["<strength>"],"weaknesses":["<weakness>"]}
Provide 4-6 tips, 2-3 strengths, 2-3 weaknesses, 4-8 found keywords, 4-8 missing keywords.
RESUME:\n${resume}\nJOB DESCRIPTION:\n${jobDesc}`;
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.choices[0].message.content;
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const reset = () => { setResult(null); setResume(""); setJobDesc(""); setResumeFileName(""); setJobFileName(""); setError(""); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(26,122,74,0.3)" }}>
                <span style={{ color: "white", fontSize: "15px", fontWeight: "700" }}>G</span>
              </div>
              <div style={{ fontWeight: "700", fontSize: "17px", color: C.text, letterSpacing: "-0.01em" }}>
                GGH <span style={{ color: C.accent }}>JobMatch</span>
              </div>
            </div>
            <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.04em", textAlign: "right" }}>GO GET HIRED CONSULTING PTY LTD.</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
        {!result ? (
          <>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, fontSize: "11px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", marginBottom: "16px", letterSpacing: "0.06em" }}>AI-POWERED RESUME ANALYSIS</div>
              <h1 style={{ fontSize: "36px", fontWeight: "700", color: C.text, margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                Does your resume match<br /><span style={{ color: C.accent }}>the job?</span>
              </h1>
              <p style={{ color: C.textMid, fontSize: "16px", margin: 0, lineHeight: "1.7" }}>
                Upload your resume and paste or link a job description<br />for an instant score and expert tips.
              </p>
            </div>

            {/* Input Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

              {/* Resume Card */}
              <Card>
                <SectionLabel>Your Resume</SectionLabel>
                <TabToggle active={resumeMode} onChange={setResumeMode} tabs={[
                  { id: "paste", label: "📋 Paste Text" },
                  { id: "upload", label: "📎 Upload File" }
                ]} />
                {resumeMode === "paste" ? (
                  <textarea value={resume} onChange={e => setResume(e.target.value)}
                    placeholder="Paste the full text of your resume here..."
                    style={{ width: "100%", height: "220px", border: `1.5px solid ${resume ? C.accent : C.border}`, borderRadius: "10px", padding: "14px", fontSize: "13px", color: C.text, background: resume ? "#FAFFFE" : C.bg, resize: "none", outline: "none", fontFamily: "Georgia, serif", lineHeight: "1.7", boxSizing: "border-box", transition: "all 0.2s" }} />
                ) : (
                  <FileUploadZone label="resume" fileName={resumeFileName}
                    onFileRead={(text, name) => { setResume(text); setResumeFileName(name); }} />
                )}
              </Card>

              {/* Job Description Card */}
              <Card>
                <SectionLabel>Job Description</SectionLabel>
                <TabToggle active={jobMode} onChange={setJobMode} tabs={[
                  { id: "paste", label: "📋 Paste Text" },
                  { id: "upload", label: "📎 Upload File" }
                ]} />
                {jobMode === "paste" && (
                  <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here..."
                    style={{ width: "100%", height: "220px", border: `1.5px solid ${jobDesc ? C.accent : C.border}`, borderRadius: "10px", padding: "14px", fontSize: "13px", color: C.text, background: jobDesc ? "#FAFFFE" : C.bg, resize: "none", outline: "none", fontFamily: "Georgia, serif", lineHeight: "1.7", boxSizing: "border-box", transition: "all 0.2s" }} />
                )}
                {jobMode === "upload" && (
                  <FileUploadZone label="job description" fileName={jobFileName}
                    onFileRead={(text, name) => { setJobDesc(text); setJobFileName(name); }} />
                )}
              </Card>
            </div>

            {error && (
              <div style={{ background: C.dangerLight, border: `1px solid #FEB2B2`, borderRadius: "10px", padding: "12px 16px", color: C.danger, fontSize: "13px", marginBottom: "14px" }}>{error}</div>
            )}

            <button onClick={analyse} disabled={loading} style={{ width: "100%", background: loading ? C.accentMid : C.accent, color: "white", border: "none", borderRadius: "12px", padding: "16px", fontSize: "15px", fontWeight: "600", fontFamily: "Georgia, serif", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(26,122,74,0.25)", transition: "all 0.2s" }}>
              {loading ? "Analysing your resume…" : "Analyse My Resume →"}
            </button>

            <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "28px", paddingTop: "28px", borderTop: `1px solid ${C.border}` }}>
              {["Instant Results", "AI-Powered Analysis", "Expert Tips"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px", color: C.muted, fontSize: "12px" }}>
                  <span style={{ color: C.accent }}>✓</span> {t}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px", marginBottom: "16px" }}>
              <Card style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <SectionLabel>Match Score</SectionLabel>
                <CircleScore score={result.score} />
                <div style={{ marginTop: "12px", background: scoreBg(result.score), color: scoreColor(result.score), fontSize: "13px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", display: "inline-block" }}>{scoreLabel(result.score)}</div>
              </Card>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card><SectionLabel>Overall Verdict</SectionLabel><p style={{ margin: 0, fontSize: "15px", color: C.text, lineHeight: "1.6" }}>{result.verdict}</p></Card>
                <Card><SectionLabel color={C.good}>Keywords Found</SectionLabel><div>{result.foundKeywords?.map(k => <Chip key={k} text={k} type="found" />)}</div></Card>
                <Card><SectionLabel color={C.danger}>Keywords Missing</SectionLabel><div>{result.missingKeywords?.map(k => <Chip key={k} text={k} type="missing" />)}</div></Card>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <Card>
                <SectionLabel color={C.good}>✓ Strengths</SectionLabel>
                {result.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: i < result.strengths.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: C.goodLight, color: C.good, fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "700", marginTop: "2px" }}>✓</div>
                    <span style={{ fontSize: "13px", color: C.text, lineHeight: "1.6" }}>{s}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <SectionLabel color={C.danger}>Areas to Improve</SectionLabel>
                {result.weaknesses?.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: i < result.weaknesses.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: C.dangerLight, color: C.danger, fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "700", marginTop: "2px" }}>!</div>
                    <span style={{ fontSize: "13px", color: C.text, lineHeight: "1.6" }}>{w}</span>
                  </div>
                ))}
              </Card>
            </div>

            <Card style={{ marginBottom: "16px" }}>
              <SectionLabel>Expert Improvement Tips</SectionLabel>
              {result.tips?.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 0", borderBottom: i < result.tips.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <div style={{ background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", borderRadius: "6px", padding: "3px 10px", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", flexShrink: 0, marginTop: "2px" }}>{t.category?.toUpperCase()}</div>
                  <span style={{ fontSize: "13px", color: C.text, lineHeight: "1.7" }}>{t.tip}</span>
                </div>
              ))}
            </Card>

            <div style={{ background: "linear-gradient(135deg, #1A7A4A 0%, #2EA86A 100%)", borderRadius: "16px", padding: "24px 28px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 24px rgba(26,122,74,0.2)" }}>
              <div>
                <div style={{ color: "white", fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>Want a professionally rewritten resume?</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Our experts at Go Get Hired Consulting Pty Ltd. will rewrite your resume to maximise your chances.</div>
              </div>
              <button style={{ background: "white", color: C.accent, border: "none", borderRadius: "10px", padding: "12px 22px", fontSize: "13px", fontWeight: "700", fontFamily: "Georgia, serif", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>Get Expert Help →</button>
            </div>

            <button onClick={reset} style={{ width: "100%", background: "transparent", color: C.textMid, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "14px", fontSize: "14px", fontFamily: "Georgia, serif", cursor: "pointer" }}>← Analyse Another Resume</button>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: "40px", paddingTop: "24px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: "11px", letterSpacing: "0.03em" }}>
          © 2026 Go Get Hired Consulting Pty Ltd. · All rights reserved
        </div>
      </div>
    </div>
  );
}
