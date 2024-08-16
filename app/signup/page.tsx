import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <main className="flex flex-col p-4">
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </main>
  );
}