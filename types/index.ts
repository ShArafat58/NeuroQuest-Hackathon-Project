export interface User {
  id: string;
  full_name: string;
  email: string;
  birthdate: string;
  version: "bangla" | "english";
  current_class: "ssc" | "hsc_1" | "hsc_2" | "ielts";
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: "signup" | "reset";
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    version: "bangla" | "english";
    current_class?: "ssc" | "hsc_1" | "hsc_2" | "ielts";
  };
}
