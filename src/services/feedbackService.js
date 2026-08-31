import { supabase } from "../services/supabaseClient";

// ENUMS BOUNDARIES
export const feedbackTypeMap = {
  positif: "POSITIVE",
  amelioration: "IMPROVEMENT",
};

export const sentimentMap = {
  satisfait: "SATISFAIT",
  neutre: "NEUTRE",
  ameliorer: "AMELIORER",
};

// CREATE NEZ FEEDBACK
export async function createFeedback({
  recipientId,
  content,
  type,
  sentiment,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Utilisateur non authentifié.");
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      type,
      sentiment,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// RETREIVE/ READ SENT FEEDBACKs
export async function getSentFeedbacks() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Utilisateur non authentifié.");
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .select(`
      id,
      content,
      type,
      sentiment,
      status,
      created_at,
      recipient:profiles!feedbacks_recipient_id_fkey (
        id,
        full_name,
        email,
        gender,
        avatar_url,
        department:departments (
          id,
          name,
          code
        )
      )
    `)
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}


// RETRIEVE / READ RECEIVED FEEDBACKs
export async function getReceivedFeedbacks() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Utilisateur non authentifié.");
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .select(`
      id,
      content,
      type,
      sentiment,
      status,
      created_at,
      sender:profiles!feedbacks_sender_id_fkey (
        id,
        full_name,
        email,
        gender,
        avatar_url,
        department:departments (
          id,
          name,
          code
        )
      )
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
