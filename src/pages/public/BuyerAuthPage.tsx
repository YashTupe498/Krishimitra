import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { BuyerSignupForm } from '../../features/auth/components/BuyerSignupForm';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export const BuyerAuthPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const isSignup = activeTab === 'signup';
  return (
    <AuthLayout role="buyer">
      <div className="auth-page">
        <div className="auth-page__intro">
          <h1 className="auth-page__heading">{isSignup ? t('authPages.createAccount') : t('authPages.welcomeBack')}</h1>
          <p className="auth-page__description">
            {isSignup ? 'Join KrishiMitra and build stronger agricultural partnerships.' : 'Connect with verified farmers and source quality produce.'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
