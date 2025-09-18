// Direct login for admin/test user (no OTP)
export const testLogin = async ({ username }: { username: string }) => {
  const response = await apiClient.post("/auth/test-login", { username });
  return response.data;
};
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

export const signUp = async (
  data: SignUpRequest
): Promise<ApiEnvelope<SignUpResult>> => {
  const { data: body } = await apiClient.post<ApiEnvelope<SignUpResult>>(
    "/users",
    data
  );
  return body;
};

// API call for sending OTP
// export const sendOtp = async (
//   data: SendOtpRequest
// ): Promise<SendOtpResponse> => {
//   const response = await apiClient.post<SendOtpResponse>(
//     "/auth/send-otp",
//     data
//   );
//   return response.data;
// };

export const sendOtp = async (
  data: SendOtpRequest
): Promise<ApiEnvelope<SendOtpResponse>> => {
  const { data: body } = await apiClient.post<ApiEnvelope<SendOtpResponse>>(
    "/auth/send-otp",
    data
  );
  return body;
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/auth/verify-otp",
    data
  );
  return response.data;
};
