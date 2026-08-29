import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard';
import { getCurrentUser } from '@/lib/current-user';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <OnboardingWizard />;
}
