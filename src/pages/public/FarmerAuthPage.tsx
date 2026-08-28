import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FarmerSignupForm } from '../../features/auth/components/FarmerSignupForm';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export const FarmerAuthPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout role="farmer">
      <div>
        <h1 className="h2" style={{ marginBottom: '8px' }}>{t('authPages.welcomeBack')}</h1>
        <p className="body-base" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {t('authPages.welcomeBackDesc')}
        </p>

        <Tabs defaultValue="login">
          <TabsList>
            <TabsTrigger value="login">{t('authPages.tabLogin')}</TabsTrigger>
            <TabsTrigger value="signup">{t('authPages.tabSignup')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="signup">
            <FarmerSignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </AuthLayout>
  );
};
