import apiClient from "../config/axiosConfig";

interface SignUpRequest {
  name: string;
  phoneno: string;
}

export interface SignUpResult {
  id: number;
  name: string;
  phoneno: string;
}

export interface ApiEnvelope<T> {
  errorMessages: string[] | null;
  isSuccess: boolean;
  result: T;
  statusCode: number;
  totalRecords: number;
}

interface SendOtpRequest {
  phoneNo: string;
}

interface SendOtpResponse {
  success: boolean;
  message: string;
  otp?: string;
}

interface VerifyOtpRequest {
  phoneNo: string;
  otp: string;
}

interface VerifyOtpResponse {
  isSuccess: boolean;
  message: string;
  token?: string;
  result: any;
}

// Direct login for admin/test user (no OTP)
export const testLogin = async ({ username }: { username: string }) => {
  const response = await apiClient.post("/api/v1/auth/test-login", { username });
  return response.data;
};

// Send OTP for phone number verification
export const sendOtp = async (
  data: SendOtpRequest
): Promise<ApiEnvelope<SendOtpResponse>> => {
  const response = await apiClient.post<ApiEnvelope<SendOtpResponse>>(
    "/api/v1/auth/send-otp",
    data
  );
  return response.data;
};

// Verify OTP for login
export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<ApiEnvelope<VerifyOtpResponse>> => {
  const response = await apiClient.post<ApiEnvelope<VerifyOtpResponse>>(
    "/api/v1/auth/verify-otp",
    data
  );
  return response.data;
};

// Sign up new user
export const signUp = async (
  data: SignUpRequest
): Promise<ApiEnvelope<SignUpResult>> => {
  const response = await apiClient.post<ApiEnvelope<SignUpResult>>(
    "/api/v1/users",
    data
  );
  return response.data;
};
