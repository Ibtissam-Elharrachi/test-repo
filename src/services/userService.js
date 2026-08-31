import { supabase } from "./supabaseClient";

/**
 * Search collaborator profiles by name.
 */

export const searchCollaborators = async (searchValue = "") => {
  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      avatar_url,
      role,
      departments (
        id,
        name
      )
    `)
    .eq("role", "COLLABORATOR")
    .order("full_name", { ascending: true })
    .limit(10);

  if (searchValue.trim()) {
    query = query.ilike(
      "full_name",
      `%${searchValue.trim()}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Error searching collaborators:",
      error
    );

    throw error;
  }

  return data || [];
};


// Get User Indicators State
export const getUserIndicators = async (userId) => {
  if (!userId) {
    throw new Error("Utilisateur non authentifié.");
  }

  // Get current profile / score
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, current_score")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error("Profil utilisateur introuvable.");
  }

  // Count sent feedbacks
  const { count: sentCount, error: sentError } = await supabase
    .from("feedbacks")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("sender_id", userId);

  if (sentError) {
    throw sentError;
  }

  // Count received feedbacks
  const { count: receivedCount, error: receivedError } = await supabase
    .from("feedbacks")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("recipient_id", userId);

  if (receivedError) {
    throw receivedError;
  }

  // Latest interaction
  const { data: latestFeedback, error: latestError } = await supabase
    .from("feedbacks")
    .select("created_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw latestError;
  }

  return {
    globalScore: profile.current_score,
    sentCount: sentCount ?? 0,
    receivedCount: receivedCount ?? 0,
    lastInteraction: latestFeedback?.created_at ?? null,
  };
};


// GET USER CURRENT SCORE EVOLUTION

export async function getScoreEvolution(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Get the current score from the user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, current_score")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw profileError;
  }

  // Calculate the previous calendar month
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const previousMonthStart = new Date(
    currentYear,
    currentMonth - 1,
    1,
    0,
    0,
    0,
    0
  );

  const currentMonthStart = new Date(
    currentYear,
    currentMonth,
    1,
    0,
    0,
    0,
    0
  );

  // Get the latest score recorded during the previous month
  const { data: previousScoreRecord, error: historyError } = await supabase
    .from("score_history")
    .select("score, recorded_at")
    .eq("user_id", userId)
    .gte("recorded_at", previousMonthStart.toISOString())
    .lt("recorded_at", currentMonthStart.toISOString())
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyError) {
    throw historyError;
  }

  const currentScore =
    profile.current_score !== null
      ? Number(profile.current_score)
      : null;

  const previousScore =
    previousScoreRecord?.score !== null &&
    previousScoreRecord?.score !== undefined
      ? Number(previousScoreRecord.score)
      : null;

  // We cannot calculate evolution without both values
  if (
    currentScore === null ||
    previousScore === null ||
    previousScore === 0
  ) {
    return {
      currentScore,
      previousScore,
      evolutionPercentage: null,
      previousRecordedAt: previousScoreRecord?.recorded_at ?? null,
    };
  }

  // Calculate percentage evolution
  const evolutionPercentage =
    ((currentScore - previousScore) / previousScore) * 100;

  return {
    currentScore,
    previousScore,
    evolutionPercentage,
    previousRecordedAt: previousScoreRecord.recorded_at,
  };
}

// CREATE INITIAL SCORE HISTORY 
export async function createInitialScoreHistory(userId, score) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (score === null || score === undefined) {
    throw new Error("Score is required");
  }

  const { data, error } = await supabase
    .from("score_history")
    .insert({
      user_id: userId,
      score: Number(score),
    })
    .select("id, user_id, score, recorded_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}



// GET SCORE HISTORY 
export async function getScoreHistory(userId, range = "1M") {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const now = new Date();
  let startDate = null;

  switch (range) {
    case "1M": {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    }

    case "3M": {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    }

    case "2Y": {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 2);
      break;
    }

    case "TOUT":
      startDate = null;
      break;

    default:
      throw new Error(`Invalid score history range: ${range}`);
  }

  let query = supabase
    .from("score_history")
    .select("id, score, recorded_at")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });

  if (startDate) {
    query = query.gte("recorded_at", startDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}
