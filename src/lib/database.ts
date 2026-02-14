import { supabase } from "./supabase";

/* ===============================
   CLIENT — CREATE REQUEST
================================ */
export const createServiceRequest = async (payload: any) => {
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      ...payload,
      status: "submitted",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/* ===============================
   CLIENT — GET OWN REQUESTS
================================ */
export const fetchServiceRequests = async (client_id: string) => {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .eq("client_id", client_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/* ===============================
   ADMIN — ALL REQUESTS
================================ */
export const adminListRequests = async () => {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
};

/* ===============================
   ADMIN — UPDATE STATUS
================================ */
export const adminUpdateRequest = async (id: string, status: string) => {
  const { error } = await supabase
    .from("service_requests")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

/* ===============================
   PROVIDER JOBS
================================ */
export const providerJobs = async (provider_id: string) => {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .eq("assigned_provider_id", provider_id);

  if (error) throw error;
  return data || [];
};/* ===============================
   PROVIDER DIRECTORY (PUBLIC LIST)
================================ */
export const fetchProviders = async () => {
  try {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("verified", true);

    if (error) {
      console.error("fetchProviders error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("fetchProviders crash:", err);
    return [];
  }
};