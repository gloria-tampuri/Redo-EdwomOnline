import { useMutation, useQuery, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface VerifyTokenResponse {
  success: boolean;
  email: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const useForgotPassword = (): UseMutationResult<
  ForgotPasswordResponse,
  Error,
  { email: string }
> => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axios.post<ForgotPasswordResponse>(
        '/api/auth/forgot-password',
        data
      );
      return response.data;
    },
  });
};

export const useVerifyResetToken = (
  token: string | null
): UseQueryResult<VerifyTokenResponse, Error> => {
  return useQuery({
    queryKey: ['verifyResetToken', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      const response = await axios.get<VerifyTokenResponse>(
        `/api/auth/verify-reset-token?token=${token}`
      );
      return response.data;
    },
    enabled: !!token,
    retry: 1,
  });
};

export const useResetPassword = (): UseMutationResult<
  ResetPasswordResponse,
  Error,
  { token: string; newPassword: string }
> => {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await axios.post<ResetPasswordResponse>(
        '/api/auth/reset-password',
        data
      );
      return response.data;
    },
  });
};
