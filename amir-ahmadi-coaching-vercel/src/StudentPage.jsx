import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabase";
import { normalizeProgramDays, countExercises } from "./workoutData";

const BRAND = {
  gold: "#D4AF37",
  goldLight: "#E8C766",
  goldDark: "#B8902A",
  bg: "#0A0A0B",
  surface: "#141416",
  surface2: "#1A1A1C",
  border: "#2A2A2D",
  borderLight: "#3A3A3D",
  text: "#F5F0E6",
  textMuted: "#8A8A8F",
  textSub: "#C9C9CC",
  red: "#C25450",
  green: "#7FA876",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIA MODAL — full-screen viewer for video, gif, image
// ─────────────────────────────────────────────────────────────────────────────

function MediaModal({ item, onClose }) {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.95)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 16,
      }}
    >
      {/* Header bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 20px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: BRAND.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#0A0A0B" }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.text }}>{item.title}</div>
            <div style={{ fontSize: 11, color: BRAND.textMuted }}>{item.label}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18,
          }}
        >×</button>
      </div>

      {/* Media content */}
      <div style={{ maxWidth: "90vw", maxHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 60 }}>
        {item.type === "video" && (
          <video
            src={item.url}
            controls
            autoPlay
            playsInline
            style={{
              maxWidth: "90vw", maxHeight: "80vh",
              borderRadius: 12,
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          />
        )}
        {(item.type === "gif" || item.type === "image") && (
          <img
            src={item.url}
            alt={item.title}
            style={{
              maxWidth: "90vw", maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          />
        )}
      </div>

      {/* Tap to close hint */}
      <div style={{ position: "absolute", bottom: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
        برای بستن Esc را بزنید یا خارج از محتوا کلیک کنید
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIA CARD — clickable thumbnail for a single media item
// ─────────────────────────────────────────────────────────────────────────────

function MediaCard({ url, type, label, exerciseName, onClick }) {
  const [hovered, setHovered] = useState(false);

  const typeConfig = {
    video: { emoji: "🎬", color: BRAND.green, bg: `${BRAND.green}20`, border: `${BRAND.green}40` },
    gif:   { emoji: "🎞️", color: "#5E9BD4", bg: "#5E9BD420", border: "#5E9BD440" },
    image: { emoji: "🖼️", color: BRAND.textSub, bg: `${BRAND.textMuted}20`, border: `${BRAND.textMuted}40` },
  };
  const cfg = typeConfig[type] || typeConfig.image;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${hovered ? cfg.color : BRAND.border}`,
        background: BRAND.surface2,
        transition: "all 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.4)` : "none",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 110, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {type === "video" ? (
          <>
            <video
              src={url}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
              preload="metadata"
            />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: BRAND.gold,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 14, marginRight: -2 }}>▶</span>
              </div>
            </div>
          </>
        ) : (
          <img
            src={url}
            alt={exerciseName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {/* Zoom hint on hover */}
        {hovered && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "3px 7px",
            fontSize: 10, color: "#fff",
          }}>
            🔍 بزرگ‌نمایی
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        padding: "8px 10px",
        display: "flex", alignItems: "center", gap: 6,
        background: cfg.bg,
        borderTop: `1px solid ${cfg.border}`,
      }}>
        <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{label}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXERCISE MEDIA SECTION — renders below each exercise if media exists
// ─────────────────────────────────────────────────────────────────────────────

function ExerciseMediaSection({ ex, openModal }) {
  const items = [];
  if (ex.videoUrl?.trim()) items.push({ url: ex.videoUrl.trim(), type: "video", label: "ویدیو ۱" });
  if (ex.video2Url?.trim()) items.push({ url: ex.video2Url.trim(), type: "video", label: "ویدیو ۲" });
  if (ex.gifUrl?.trim()) items.push({ url: ex.gifUrl.trim(), type: "gif", label: "GIF" });
  if (ex.imageUrl?.trim()) items.push({ url: ex.imageUrl.trim(), type: "image", label: "تصویر" });

  if (items.length === 0) return null;

  return (
    <div style={{
      marginTop: 12,
      padding: "12px 14px",
      background: `${BRAND.gold}06`,
      border: `1px solid ${BRAND.gold}25`,
      borderRadius: 12,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: BRAND.gold,
        marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span>🎓</span> آموزش حرکت
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
        gap: 8,
      }}>
        {items.map((item, i) => (
          <MediaCard
            key={i}
            url={item.url}
            type={item.type}
            label={item.label}
            exerciseName={ex.name}
            onClick={() => openModal({ ...item, title: ex.name })}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXERCISE LIST
// ─────────────────────────────────────────────────────────────────────────────

function ExerciseList({ exercises, openModal }) {
  if (!exercises || exercises.length === 0) {
    return (
      <div style={{ color: BRAND.textMuted, fontSize: 12, fontStyle: "italic", padding: "8px 0" }}>
        برای این روز هنوز حرکتی ثبت نشده.
      </div>
    );
  }

  return exercises.map((ex, i) => {
    const detail = [];
    if (ex.sets) detail.push(`${ex.sets} ست`);
    if (ex.reps) detail.push(`${ex.reps} تکرار`);
    if (ex.weight) detail.push(`وزن: ${ex.weight} kg`);
    if (ex.rest) detail.push(`استراحت: ${ex.rest} ثانیه`);
    if (ex.tempo) detail.push(`تمپو: ${ex.tempo}`);
    if (ex.rpe) detail.push(`RPE: ${ex.rpe}`);
    if (ex.rir) detail.push(`RIR: ${ex.rir}`);
    if (ex.technique && ex.technique !== "هیچکدام") detail.push(ex.technique);

    return (
      <div
        key={ex.pid || i}
        style={{
          padding: "14px 0",
          borderBottom: i < exercises.length - 1 ? `1px solid ${BRAND.border}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{
            minWidth: 24, height: 24, borderRadius: "50%",
            background: `${BRAND.gold}25`, color: BRAND.gold,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
          }}>
            {i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.text }}>{ex.name}</div>
            {detail.length > 0 && (
              <div style={{ fontSize: 11, color: BRAND.textMuted, marginTop: 3 }}>{detail.join(" · ")}</div>
            )}
            {ex.notes && (
              <div style={{ fontSize: 11, color: BRAND.textSub, marginTop: 4, fontStyle: "italic" }}>{ex.notes}</div>
            )}
            {ex.description && (
              <div style={{ fontSize: 11, color: BRAND.textSub, marginTop: 6, lineHeight: 1.7 }}>{ex.description}</div>
            )}
          </div>
        </div>
        <ExerciseMediaSection ex={ex} openModal={openModal} />
      </div>
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  DAYS LIST
// ─────────────────────────────────────────────────────────────────────────────

function DaysList({ days, openModal }) {
  if (!days || days.length === 0) {
    return <div style={{ color: BRAND.textMuted, fontSize: 12 }}>این برنامه هنوز روزی ندارد.</div>;
  }

  return days.map((day, di) => (
    <div
      key={day.id || di}
      style={{
        background: BRAND.surface2,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.gold, marginBottom: 10 }}>
        {day.name}
      </div>
      <ExerciseList exercises={day.exercises} openModal={openModal} />
    </div>
  ));
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT PAGE ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentPage() {
  const { id } = useParams();
  const [workouts, setWorkouts] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [openWorkout, setOpenWorkout] = useState(null);
  const [mediaModal, setMediaModal] = useState(null); // { url, type, title, label }

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const [{ data: clientData }, { data: workoutData, error }] = await Promise.all([
        supabase.from("client").select("name").eq("id", id).single(),
        supabase.from("workouts").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      ]);
      if (clientData?.name) setStudentName(clientData.name);
      if (!error && workoutData) {
        setWorkouts(
          workoutData.map((w) => ({
            ...w,
            days: normalizeProgramDays(w.data),
          }))
        );
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const openModal = useCallback((item) => setMediaModal(item), []);
  const closeModal = useCallback(() => setMediaModal(null), []);

  return (
    <div
      style={{
        background: BRAND.bg,
        color: BRAND.text,
        minHeight: "100vh",
        fontFamily: "'Vazirmatn', sans-serif",
        direction: "rtl",
        paddingBottom: 48,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2A2A2D; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @media (max-width: 480px) {
          .media-grid { grid-template-columns: 1fr 1fr !important; }
          .workout-card-header { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: BRAND.surface,
        borderBottom: `1px solid ${BRAND.border}`,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: `linear-gradient(145deg, ${BRAND.goldLight}, ${BRAND.goldDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 16, color: "#0A0A0B", flexShrink: 0,
        }}>
          A
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: BRAND.text }}>امیر احمدی کوچینگ</div>
          <div style={{ fontSize: 12, color: BRAND.textMuted }}>
            {studentName ? `پنل تمرینی: ${studentName}` : "پنل تمرینی شاگرد"}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: BRAND.textMuted, fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            در حال بارگذاری برنامه‌های تمرینی…
          </div>
        ) : workouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.4 }}>🏋️</div>
            <p style={{ color: BRAND.textMuted, fontSize: 15, margin: 0 }}>
              هنوز برنامه‌ای برای شما ثبت نشده است.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.textSub, marginBottom: 16 }}>
              برنامه‌های تمرینی شما
            </div>

            {workouts.map((w) => {
              const isOpen = openWorkout === w.id;
              const exCount = countExercises(w.days);

              return (
                <div
                  key={w.id}
                  style={{
                    background: BRAND.surface,
                    border: `1px solid ${isOpen ? BRAND.gold + "60" : BRAND.border}`,
                    borderRadius: 14,
                    marginBottom: 14,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Workout header */}
                  <div
                    className="workout-card-header"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      cursor: "pointer",
                      userSelect: "none",
                      gap: 12,
                    }}
                    onClick={() => setOpenWorkout(isOpen ? null : w.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.text, marginBottom: 4 }}>
                        {w.title ?? "برنامه تمرینی"}
                      </div>
                      <div style={{ fontSize: 11, color: BRAND.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>{formatDate(w.created_at)}</span>
                        <span>·</span>
                        <span>{w.days.length} روز</span>
                        <span>·</span>
                        <span>{exCount} حرکت</span>
                      </div>
                    </div>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: isOpen ? `${BRAND.gold}20` : BRAND.surface2,
                      border: `1px solid ${isOpen ? BRAND.gold + "50" : BRAND.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isOpen ? BRAND.gold : BRAND.textMuted,
                      fontSize: 16, flexShrink: 0,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}>
                      ▾
                    </div>
                  </div>

                  {/* Workout body */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${BRAND.border}`, padding: "16px 20px" }}>
                      <DaysList days={w.days} openModal={openModal} />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Media Modal */}
      {mediaModal && (
        <MediaModal item={mediaModal} onClose={closeModal} />
      )}
    </div>
  );
}
