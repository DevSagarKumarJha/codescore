import { useAuthStore } from "../../store/useAuthStore";

export default function ResendVerificationButton() {
  const { resendVerificationMail } = useAuthStore();

  const handleClick = async () => {
    try {
      await resendVerificationMail();
    } catch {
      // Already handled in store via toast
    }
  };

  return <button onClick={handleClick}>Resend Verification Email</button>;
}
