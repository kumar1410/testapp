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

interface TestLoginRequest {
  username: string;
}

interface SendOtpResponse {
  message: string;
  phoneNo: string;
  sessionId: string;
}

interface OtpVerifyResponse {
  message: string;
  token: string;
  user: {
    id: number;
    phoneno: string;
    name: string;
    type: string | null;
    created_on: string;
    updated_on: string;
  };
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    name: string;
    phoneno: string;
  };
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
  try {
    console.log('Attempting test login with:', username);
    const response = await apiClient.post("/auth/test-login", { username });
    console.log('Test login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Test login error:', error.response?.data || error.message);
    throw error;
  }
};

// Send OTP for phone number verification
export const sendOtp = async (
  data: SendOtpRequest
): Promise<ApiEnvelope<SendOtpResponse>> => {
  try {
    console.log('Sending OTP:', data);
    const response = await apiClient.post<ApiEnvelope<SendOtpResponse>>(
      "/auth/send-otp",
      data
    );
    console.log('Send OTP response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Send OTP error:', error.response?.data || error);
    throw error;
  }
};

// Verify OTP for login
export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<ApiEnvelope<OtpVerifyResponse>> => {
  try {
    console.log('Verifying OTP:', data);
    const response = await apiClient.post<ApiEnvelope<OtpVerifyResponse>>(
      "/auth/verify-otp",
      data
    );
    console.log('OTP verification response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('OTP verification error:', error.response?.data || error);
    throw error;
  }
};

// Sign up new user
export const signUp = async (
  data: SignUpRequest
): Promise<ApiEnvelope<SignUpResult>> => {
  const response = await apiClient.post<ApiEnvelope<SignUpResult>>(
    "/users",
    data
  );
  return response.data;
};
