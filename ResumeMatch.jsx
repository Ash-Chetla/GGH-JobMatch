import { useState } from "react";

const COLORS = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  border: "#2A2A2A",
  accent: "#C8F135",
  accentDim: "#8AAD1A",
  text: "#F0F0F0",
  muted: "#888",
  danger: "#FF5C5C",
  warn: "#FFB547",
  good: "#C8F135",
};

const scoreColor = (score) => {
  if (score >= 75) return COLORS.good;
  if (score >= 50) return COLORS.warn;
  return COLORS.danger;
};

const CircleScore = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#2A2A2A" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="'Courier New', monospace">{score}</text>
      <text x="70" y="84" textAnchor="middle" fill={COLORS.muted} fontSize="11" fontFamily="'Courier New', monospace">/ 100</text>
    </svg>
  );
};

const Tag = ({ text, type }) => {
  const bg = type === "missing" ? "#2A1515" : type === "found" ? "#1A2A10" : "#1A1A2A";
  const border = type === "missing" ? COLORS.danger : type === "found" ? COLORS.good : "#4A4AFF";
  const color = type === "missing" ? COLORS.danger : type === "found" ? COLORS.good : "#8888FF";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "4px",
      background: bg, border: `1px solid ${border}`, color, fontSize: "12px",
      margin: "3px", fontFamily: "'Courier New', monospace", letterSpacing: "0.03em"
    }}>{text}</span>
  );
};

export default function ResumeMatch() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyse = async () => {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please paste both your resume and the job description.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const prompt = `You are an expert recruitment consultant. Analyse the following resume against the job description and return ONLY a JSON object (no markdown, no explanation) with this exact structure:
{
  "score": <number 0-100>,
  "verdict": "<one sentence summary>",
  "foundKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "tips": [
    { "category": "<category>", "tip": "<actionable tip>" },
    ...
  ],
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...]
}

Provide 4-6 tips, 2-3 strengths, 2-3 weaknesses, 4-8 found keywords, and 4-8 missing keywords.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDesc}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setResume(""); setJobDesc(""); setError(""); };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'Courier New', monospace", padding: "0"
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${COLORS.border}`, padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <span style={{ color: COLORS.accent, fontWeight: "800", fontSize: "20px", letterSpacing: "0.05em" }}>GGH </span>
          <span style={{ color: COLORS.text, fontWeight: "800", fontSize: "20px", letterSpacing: "0.05em" }}>JOBMATCH</span>
          <span style={{
            marginLeft: "10px", background: COLORS.accent, color: "#000",
            fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "3px", letterSpacing: "0.1em"
          }}>BY GO GET HIRED CONSULTING PTY LTD.</span>
        </div>
        <div style={{ color: COLORS.muted, fontSize: "11px", letterSpacing: "0.08em" }}>AI RESUME ANALYSER</div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>

        {!result ? (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                Does your resume<br />
                <span style={{ color: COLORS.accent }}>match the job?</span>
              </h1>
              <p style={{ color: COLORS.muted, fontSize: "14px", margin: 0 }}>
                Paste your resume and job description below. Get an instant score, missing keywords, and tips.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {/* Resume Input */}
              <div>
                <label style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, display: "block", marginBottom: "8px" }}>
                  YOUR RESUME
                </label>
                <textarea
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                  placeholder="Paste your resume text here..."
                  style={{
                    width: "100%", height: "320px", background: COLORS.card,
                    border: `1px solid ${resume ? COLORS.accent : COLORS.border}`,
                    borderRadius: "8px", color: COLORS.text, fontSize: "13px",
                    padding: "16px", resize: "none", outline: "none",
                    fontFamily: "'Courier New', monospace", lineHeight: "1.6",
                    boxSizing: "border-box", transition: "border-color 0.2s"
                  }}
                />
              </div>

              {/* Job Description Input */}
              <div>
                <label style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, display: "block", marginBottom: "8px" }}>
                  JOB DESCRIPTION
                </label>
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here..."
                  style={{
                    width: "100%", height: "320px", background: COLORS.card,
                    border: `1px solid ${jobDesc ? COLORS.accent : COLORS.border}`,
                    borderRadius: "8px", color: COLORS.text, fontSize: "13px",
                    padding: "16px", resize: "none", outline: "none",
                    fontFamily: "'Courier New', monospace", lineHeight: "1.6",
                    boxSizing: "border-box", transition: "border-color 0.2s"
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ color: COLORS.danger, fontSize: "13px", marginBottom: "12px" }}>{error}</div>
            )}

            <button
              onClick={analyse}
              disabled={loading}
              style={{
                background: loading ? COLORS.accentDim : COLORS.accent,
                color: "#000", border: "none", borderRadius: "8px",
                padding: "14px 32px", fontSize: "14px", fontWeight: "700",
                fontFamily: "'Courier New', monospace", letterSpacing: "0.08em",
                cursor: loading ? "not-allowed" : "pointer", width: "100%",
                transition: "background 0.2s"
              }}
            >
              {loading ? "ANALYSING YOUR RESUME..." : "ANALYSE MY RESUME →"}
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", marginBottom: "24px" }}>
              {/* Score Card */}
              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: "12px", padding: "24px", textAlign: "center"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: "16px" }}>MATCH SCORE</div>
                <CircleScore score={result.score} />
                <div style={{
                  marginTop: "12px", fontSize: "12px", color: scoreColor(result.score),
                  fontWeight: "700", letterSpacing: "0.05em"
                }}>
                  {result.score >= 75 ? "STRONG MATCH" : result.score >= 50 ? "PARTIAL MATCH" : "WEAK MATCH"}
                </div>
              </div>

              {/* Verdict + Keywords */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px", padding: "20px"
                }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: "8px" }}>VERDICT</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.5" }}>{result.verdict}</div>
                </div>

                <div style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px", padding: "20px"
                }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: "10px" }}>KEYWORDS FOUND</div>
                  <div>{result.foundKeywords?.map(k => <Tag key={k} text={k} type="found" />)}</div>
                </div>

                <div style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px", padding: "20px"
                }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.danger, marginBottom: "10px" }}>MISSING KEYWORDS</div>
                  <div>{result.missingKeywords?.map(k => <Tag key={k} text={k} type="missing" />)}</div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: "12px", padding: "20px"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.good, marginBottom: "12px" }}>✓ STRENGTHS</div>
                {result.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "13px", lineHeight: "1.5" }}>
                    <span style={{ color: COLORS.good, flexShrink: 0 }}>▸</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: "12px", padding: "20px"
              }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.danger, marginBottom: "12px" }}>✗ WEAKNESSES</div>
                {result.weaknesses?.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "13px", lineHeight: "1.5" }}>
                    <span style={{ color: COLORS.danger, flexShrink: 0 }}>▸</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: "12px", padding: "20px", marginBottom: "20px"
            }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: "16px" }}>IMPROVEMENT TIPS</div>
              {result.tips?.map((t, i) => (
                <div key={i} style={{
                  display: "flex", gap: "16px", padding: "12px 0",
                  borderBottom: i < result.tips.length - 1 ? `1px solid ${COLORS.border}` : "none"
                }}>
                  <div style={{
                    background: "#1A1A2A", border: "1px solid #4A4AFF",
                    color: "#8888FF", borderRadius: "4px", padding: "2px 8px",
                    fontSize: "10px", letterSpacing: "0.08em", flexShrink: 0, height: "fit-content"
                  }}>{t.category?.toUpperCase()}</div>
                  <div style={{ fontSize: "13px", lineHeight: "1.6" }}>{t.tip}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{
              background: "#141A08", border: `1px solid ${COLORS.accent}`,
              borderRadius: "12px", padding: "20px", marginBottom: "20px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>Want a professionally rewritten resume?</div>
                <div style={{ color: COLORS.muted, fontSize: "13px" }}>Our experts at Go Get Hired Consulting Pty Ltd. can rewrite your resume to maximise your chances.</div>
              </div>
              <button style={{
                background: COLORS.accent, color: "#000", border: "none",
                borderRadius: "6px", padding: "10px 20px", fontSize: "12px",
                fontWeight: "700", fontFamily: "'Courier New', monospace",
                letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap"
              }}>GET HELP →</button>
            </div>

            <button
              onClick={reset}
              style={{
                background: "transparent", color: COLORS.muted,
                border: `1px solid ${COLORS.border}`, borderRadius: "8px",
                padding: "12px 24px", fontSize: "13px", fontFamily: "'Courier New', monospace",
                letterSpacing: "0.08em", cursor: "pointer", width: "100%"
              }}
            >← ANALYSE ANOTHER RESUME</button>
          </>
        )}
      </div>
    </div>
  );
}
