import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { BuyerSignupForm } from '../../features/auth/components/BuyerSignupForm';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export const BuyerAuthPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout role="buyer">
      <div>
        <h1 className="h2" style={{ marginBottom: '8px' }}>{t('authPages.welcomeBack')}</h1>
        <p className="body-base" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Connect with verified farmers and source quality produce.
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
            <BuyerSignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </AuthLayout>
  );
};
