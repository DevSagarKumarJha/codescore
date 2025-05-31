import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ResendVerificationButton from "../components/Buttons/ResendEmailVerification";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const EmailVerificationPage = () => {
  const { token } = useParams();
  const { authUser, isCheckingAuth } = useAuthStore();

  const [status, setStatus] = useState("Verifying...");
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Wait until auth check is done
      if (isCheckingAuth) return;

      // If already verified, don't call API
      if (authUser?.isEmailVerified) {
        setStatus("✅ Email is already verified.");
        return;
      }

      // If not verified, try verifying with the token
      try {
        await axiosInstance.post(`/auth/verify/${token}`);
        setStatus("✅ Email verified successfully!");
      } catch (err) {
        setStatus("❌ Invalid or expired token.");
        setShowResendButton(true);
        throw err
      }
    };

    if (token) verifyEmail();
  }, [token, authUser, isCheckingAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        {showResendButton && <ResendVerificationButton />}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
