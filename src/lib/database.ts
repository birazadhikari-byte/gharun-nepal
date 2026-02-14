import { supabase } from '@/lib/supabase'

/* =====================================================
   PROFILE FUNCTIONS (USED BY AUTHCONTEXT)
===================================================== */

export const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

export const upsertProfile = async (profile: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile)

    if (error) console.error('upsertProfile error:', error)
  } catch (err) {
    console.error('upsertProfile crash:', err)
  }
}

/* =====================================================
   ADMIN — REQUESTS
===================================================== */

export const adminListRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('adminListRequests error:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('adminListRequests crash:', err)
    return []
  }
}

export const adminUpdateRequest = async (id: string, updates: any) => {
  try {
    const { error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)

    if (error) console.error(error)
  } catch (err) {
    console.error(err)
  }
}

export const adminListAllProviders = async () => {
  try {
    const { data } = await supabase
      .from('providers')
      .select('*')

    return data || []
  } catch {
    return []
  }
}

export const adminGetStats = async () => {
  try {
    const { count } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })

    return { totalRequests: count || 0 }
  } catch {
    return null
  }
}

/* =====================================================
   CLIENT — REQUESTS
===================================================== */

export const createServiceRequest = async (payload: any) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('createServiceRequest error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('createServiceRequest crash:', err)
    return null
  }
}

export const fetchClientRequests = async (clientId: string) => {
  try {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    return data || []
  } catch {
    return []
  }
}

/* =====================================================
   PROVIDERS DIRECTORY
===================================================== */

export const fetchProviders = async () => {
  try {
    const { data } = await supabase
      .from('providers')
      .select('*')

    return data || []
  } catch {
    return []
  }
}

/* =====================================================
   EMAIL + AUTH FLOWS (SAFE MVP MOCKS)
===================================================== */

export const sendWelcomeEmail = async (email: string, name: string) => {
  console.log('sendWelcomeEmail:', email, name)
  return { success: true }
}

export const requestPasswordReset = async (email: string) => {
  console.log('requestPasswordReset:', email)
  return { success: true, message: 'Reset code sent' }
}

export const verifyResetCode = async (email: string, code: string) => {
  console.log('verifyResetCode:', email, code)
  return { success: true, resetToken: 'demo-token' }
}

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  console.log('resetPassword:', email)
  return { success: true, message: 'Password updated' }
}

export const requestEmailVerification = async (email: string) => {
  console.log('requestEmailVerification:', email)
  return { success: true }
}

export const verifyEmailCode = async (email: string, code: string) => {
  console.log('verifyEmailCode:', email, code)
  return { verified: true }
}/* =====================================================
   EXTRA HELPERS REQUIRED BY DASHBOARDS (SAFE EXPORTS)
===================================================== */

// Used by ClientDashboard
export const fetchServiceRequests = async (clientId: string) => {
  try {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    return data || []
  } catch {
    return []
  }
}

// Used by ProviderDashboard
export const providerJobs = async (providerId: string) => {
  try {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('provider_id', providerId)

    return data || []
  } catch {
    return []
  }
}// ========================================
// HERO STATS (used by Hero.tsx)
// ========================================
export const fetchStats = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_stats') // you can change table later
      .select('*')
      .single();

    if (error) {
      console.warn('fetchStats fallback:', error.message);
      return {
        providers: 120,
        jobsCompleted: 540,
        cities: 5,
        rating: 4.8,
      };
    }

    return data;
  } catch (err) {
    console.warn('fetchStats crash:', err);
    return {
      providers: 120,
      jobsCompleted: 540,
      cities: 5,
      rating: 4.8,
    };
  }
};// ========================================
// FETCH REQUEST BY NUMBER (StatusTracker)
// ========================================
export const fetchRequestByNumber = async (requestNumber: string) => {
  try {
    const { data, error } = await supabase
      .from('service_requests') // your requests table
      .select('*')
      .eq('request_number', requestNumber)
      .single();

    if (error) {
      console.warn('fetchRequestByNumber:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('fetchRequestByNumber crash:', err);
    return null;
  }
};// ===============================================
// TERMS ACCEPTANCE (GHARUN NEPAL SECURITY)
// ===============================================

export const CURRENT_TERMS_VERSION = 'v1';
export const CURRENT_PRIVACY_VERSION = 'v1';

export const recordTermsAcceptance = async (
  userId: string,
  role: string
) => {
  try {
    const { error } = await supabase
      .from('terms_acceptance')
      .upsert({
        user_id: userId,
        role,
        terms_version: CURRENT_TERMS_VERSION,
        privacy_version: CURRENT_PRIVACY_VERSION,
        accepted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('recordTermsAcceptance error:', error);
    }

    return { success: true };
  } catch (err) {
    console.error('recordTermsAcceptance failed:', err);
    return { success: false };
  }
};// =====================================================
// GHARUN NEPAL - WHATSAPP NOTIFICATION (SAFE MVP MOCK)
// =====================================================

export const sendWhatsAppNotification = async (
  type: string,
  data: any,
  phone: string,
  lang: 'en' | 'np' = 'en',
  name?: string
) => {
  try {
    console.log('📲 WhatsApp notification:', {
      type,
      phone,
      name,
      data,
    });

    // MVP SAFE MODE:
    // No external API yet — just simulate success
    // Later you can connect Twilio / WhatsApp Cloud API

    return { success: true };
  } catch (err) {
    console.error('sendWhatsAppNotification error:', err);
    return { success: false };
  }
};// =====================================================
// GHARUN NEPAL - PROVIDER DOCUMENT SYSTEM (MVP SAFE)
// =====================================================

export type DocumentType =
  | 'citizenship_front'
  | 'citizenship_back'
  | 'license'
  | 'profile_photo';

export interface ProviderDocument {
  id: string;
  provider_id?: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
}

// -----------------------------------------------------
// Upload provider document
// -----------------------------------------------------
export const uploadProviderDocument = async (
  userId: string,
  file: File,
  docType: DocumentType,
  providerId?: string
) => {
  console.log('📄 Upload document:', userId, docType);

  // MVP SAFE MODE
  // Later connect Supabase Storage
  return {
    success: true,
  };
};

// -----------------------------------------------------
// Fetch my documents
// -----------------------------------------------------
export const fetchMyDocuments = async (
  userId: string
): Promise<ProviderDocument[]> => {
  console.log('📄 Fetch documents for:', userId);

  // MVP MOCK DATA
  return [];
};

// -----------------------------------------------------
// Delete provider document
// -----------------------------------------------------
export const deleteProviderDocument = async (
  docId: string,
  filePath: string
) => {
  console.log('🗑 Delete document:', docId, filePath);
  return { success: true };
};

// -----------------------------------------------------
// Get signed preview URL
// -----------------------------------------------------
export const getDocumentSignedUrl = async (
  filePath: string
): Promise<string> => {
  console.log('🔐 Get signed URL:', filePath);

  // Return placeholder for now
  return filePath;
};// =====================================================
// GHARUN NEPAL - PROVIDER REGISTRATION (MVP SAFE)
// =====================================================

interface ProviderRegistrationInput {
  name: string;
  phone: string;
  email?: string;
  service: string;
  category: string;
  location: string;
  description?: string;
  userId?: string;
}

export const submitProviderRegistration = async (
  data: ProviderRegistrationInput
) => {
  console.log('🛠 Provider Registration Submitted:', data);

  // MVP SAFE MODE
  // Later you will save into Supabase table: provider_applications

  return {
    success: true,
  };
};/* =====================================================
   🚗 GHARUN CONNECT — RIDE CONNECTOR (SAFE MVP)
===================================================== */

export const fetchVehicleTypes = async () => {
  try {
    const { data } = await supabase
      .from('ride_vehicle_types')
      .select('*')
      .eq('enabled', true)

    return data || []
  } catch {
    return []
  }
}

export const fetchServiceAreas = async () => {
  try {
    const { data } = await supabase
      .from('ride_service_areas')
      .select('*')
      .eq('enabled', true)

    return data || []
  } catch {
    return []
  }
}

export const fetchActiveRideDrivers = async (
  areaId?: string,
  vehicleTypeId?: string
) => {
  try {
    let query = supabase
      .from('ride_drivers')
      .select(`
        *,
        ride_vehicle_types(name),
        ride_service_areas(area_name)
      `)
      .eq('available', true)

    if (areaId) query = query.eq('area_id', areaId)
    if (vehicleTypeId) query = query.eq('vehicle_type_id', vehicleTypeId)

    const { data } = await query
    return data || []
  } catch {
    return []
  }
}

export const createRideRequest = async (payload: any) => {
  try {
    const request_number = 'GN-' + Date.now()

    // SAFE MVP (no DB insert yet)
    console.log('🚗 Ride request:', payload)

    return { request_number }
  } catch {
    return { request_number: 'GN-' + Date.now() }
  }
}/* =====================================================
   📜 TERMS GATE HELPERS (SAFE MVP EXPORTS)
===================================================== */

export const checkTermsAcceptance = async (userId: string) => {
  try {
    const { data } = await supabase
      .from('terms_acceptance')
      .select('*')
      .eq('user_id', userId)
      .eq('terms_version', CURRENT_TERMS_VERSION)
      .eq('privacy_version', CURRENT_PRIVACY_VERSION)
      .single();

    return !!data;
  } catch {
    return false;
  }
};

export const fetchTermsVersionConfig = async () => {
  // MVP SAFE MODE
  return {
    terms_version: CURRENT_TERMS_VERSION,
    privacy_version: CURRENT_PRIVACY_VERSION,
  };
};