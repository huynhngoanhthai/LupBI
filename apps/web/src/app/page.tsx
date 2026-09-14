import { redirect } from 'next/navigation';

// Root path redirect về /dashboard (middleware sẽ chặn về /login nếu chưa auth)
export default function HomePage() {
  redirect('/dashboard');
}
