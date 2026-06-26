// ─────────────────────────────────────────────────────────────────────────────
//  SHARED WORKOUT DATA CONTRACT
//
//  This file is the SINGLE SOURCE OF TRUTH for the shape of `workout.data`
//  (the JSON column stored in Supabase's `workouts.data`).
//
//  Both ProgramBuilderPage (coach) and StudentPage (student) MUST go through
//  `normalizeProgramDays` when reading data, and `serializeProgramDays` when
//  writing data. Neither page should invent its own parsing heuristics —
//  if the shape ever needs to change, change it here ONLY.
//
//  Canonical shape of `workout.data` (exactly what is stored in Supabase):
//
//  [
//    {
//      id: string,
//      name: string,              // day name, e.g. "روز اول — پوش"
//      exercises: [
//        {
//          pid: string,            // unique id of this exercise *within the program*
//          exerciseId: string,     // id pointing back into the exercise bank (EXERCISES / customExercises)
//          name: string,
//          muscle: string,
//          sets: string|number,
//          reps: string,
//          weight: string,
//          rest: string,
//          rir: string,
//          rpe: string,
//          tempo: string,
//          technique: string,
//          notes: string,          // coach's per-exercise note
//          videoUrl: string,       // direct video link (youtube/mp4) for this exercise
//          imageUrl: string,       // static image for this exercise
//          description: string,   // how-to / description text for this exercise
//        },
//        ...
//      ]
//    },
//    ...
//  ]
// ─────────────────────────────────────────────────────────────────────────────

let _wdUid = 0;
export const genWdId = () => `id-${Date.now()}-${_wdUid++}`;

// Every field an Exercise can have, with its safe default value.
// This is the canonical list referenced by the project requirements:
// name, sets, reps, weight, rest, rir, rpe, tempo, notes, videoUrl, imageUrl, description.
export const EXERCISE_FIELD_DEFAULTS = {
  pid: "",
  exerciseId: "",
  name: "",
  muscle: "",
  sets: "",
  reps: "",
  weight: "",
  rest: "",
  rir: "",
  rpe: "",
  tempo: "",
  technique: "هیچکدام",
  notes: "",
  videoUrl: "",
  video2Url: "",
  imageUrl: "",
  gifUrl: "",
  description: "",
};

/**
 * Build a brand-new program-exercise entry from a bank exercise (EXERCISES or customExercises).
 * This is the ONLY place that should construct a new exercise entry for a program,
 * so that every field the project requires is always present and always copied
 * from the source exercise (bank or custom), never silently dropped.
 */
export function createProgramExercise(bankExercise, overrides = {}) {
  return {
    ...EXERCISE_FIELD_DEFAULTS,
    pid: genWdId(),
    exerciseId: bankExercise?.id ?? "",
    name: bankExercise?.name ?? "",
    muscle: bankExercise?.muscle ?? "",
    sets: 4,
    reps: "8-10",
    weight: "",
    rest: "90",
    tempo: "2-0-2",
    rpe: "8",
    rir: "2",
    technique: "هیچکدام",
    notes: "",
    // Copy media/description straight from the bank exercise so the student
    // can always see video / image / gif / how-to, exactly as the coach defined it.
    videoUrl: bankExercise?.videoUrl ?? "",
    video2Url: bankExercise?.video2Url ?? "",
    imageUrl: bankExercise?.imageUrl ?? "",
    gifUrl: bankExercise?.gifUrl ?? "",
    description: bankExercise?.desc ?? bankExercise?.description ?? "",
    ...overrides,
  };
}

/**
 * Normalize ONE exercise entry coming from anywhere (fresh in-memory state,
 * Supabase row, or older/legacy saved data) into the canonical shape.
 * Tolerates legacy field names (note -> notes, desc -> description, etc.)
 * but the canonical output always has every field defined.
 */
export function normalizeExercise(raw, index = 0) {
  if (!raw || typeof raw !== "object") {
    return { ...EXERCISE_FIELD_DEFAULTS, pid: genWdId(), name: `حرکت ${index + 1}` };
  }
  return {
    pid: raw.pid ?? raw.id ?? genWdId(),
    exerciseId: raw.exerciseId ?? raw.exercise_id ?? "",
    name: raw.name ?? raw.exerciseName ?? raw.title ?? `حرکت ${index + 1}`,
    muscle: raw.muscle ?? "",
    sets: raw.sets ?? raw.set ?? "",
    reps: raw.reps ?? raw.rep ?? "",
    weight: raw.weight ?? "",
    rest: raw.rest ?? raw.restTime ?? "",
    rir: raw.rir ?? "",
    rpe: raw.rpe ?? "",
    tempo: raw.tempo ?? "",
    technique: raw.technique ?? "هیچکدام",
    notes: raw.notes ?? raw.note ?? "",
    videoUrl: raw.videoUrl ?? raw.video_url ?? "",
    video2Url: raw.video2Url ?? raw.video2_url ?? "",
    imageUrl: raw.imageUrl ?? raw.image_url ?? "",
    gifUrl: raw.gifUrl ?? raw.gif_url ?? "",
    description: raw.description ?? raw.desc ?? "",
  };
}

/**
 * Normalize ONE day entry. Always returns { id, name, exercises: [] }
 * with every exercise normalized. A day with no exercises array becomes
 * an empty array, never null/undefined, so callers never need an extra
 * defensive check.
 */
export function normalizeDay(raw, index = 0) {
  if (!raw || typeof raw !== "object") {
    return { id: genWdId(), name: `روز ${index + 1}`, exercises: [] };
  }
  const exercisesArr = Array.isArray(raw.exercises) ? raw.exercises : [];
  return {
    id: raw.id ?? genWdId(),
    name: raw.name ?? raw.title ?? `روز ${index + 1}`,
    exercises: exercisesArr.map((ex, i) => normalizeExercise(ex, i)),
  };
}

/**
 * THE canonical parser. Takes whatever is in `workout.data` (the raw value
 * read back from Supabase) and ALWAYS returns a clean array of days in the
 * canonical shape. This is what both ProgramBuilderPage and StudentPage call.
 *
 * Accepts:
 *  - the canonical shape: an array of day objects -> normalized as-is
 *  - null/undefined -> []
 *  - anything else unexpected -> [] (never throws, never silently drops only
 *    *some* days — if it's not a recognizable array of days, treat as empty
 *    rather than guessing)
 */
export function normalizeProgramDays(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((day, i) => normalizeDay(day, i));
  }
  // Defensive fallback for any pre-existing legacy rows that might have been
  // saved as { days: [...] } instead of a bare array. We still go through
  // the same normalizeDay so the result is identical either way.
  if (Array.isArray(data.days)) {
    return data.days.map((day, i) => normalizeDay(day, i));
  }
  return [];
}

/**
 * THE canonical serializer. Takes the in-memory `days` array (already in
 * canonical shape because the builder only ever produces that shape via
 * createProgramExercise/normalizeDay) and returns exactly what should be
 * written to the Supabase `data` column.
 */
export function serializeProgramDays(days) {
  return (Array.isArray(days) ? days : []).map((day, i) => {
    const normalized = normalizeDay(day, i);
    return {
      id: normalized.id,
      name: normalized.name,
      exercises: normalized.exercises.map((ex) => ({ ...ex })),
    };
  });
}

export function countExercises(days) {
  return (Array.isArray(days) ? days : []).reduce(
    (acc, d) => acc + (Array.isArray(d.exercises) ? d.exercises.length : 0),
    0
  );
}
