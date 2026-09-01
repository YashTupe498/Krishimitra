import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FormMessage } from '../../../components/ui/FormMessage';
import { supabase } from '../../../services/supabase/client';
import { ROUTES } from '../../../constants/routes';
import styles from './AuthForm.module.css';
import { getAuthErrorMessage } from '../../../utils/authErrors';

export const BuyerSignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    buyerType: 'wholesaler',
    gstin: '',
    state: '',
    district: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(t('authPages.passwordsMatch'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create the auth user (NO options.data — avoid trigger issues)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error('[Signup] Auth error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Signup failed — no user returned.');
      }

      console.log('[Signup] Auth user created:', authData.user.id);

      // Step 2: If we have a session, insert the profile row directly
      if (authData.session) {
        const profilePayload = {
          id: authData.user.id,
          email: formData.email,
          role: 'BUYER' as const,
          account_type: 'BUYER' as const,
          full_name: formData.fullName,
          phone: formData.phone || '',
          district: formData.district || '',
          state: formData.state || '',
          preferred_language: 'en',
          organization_name: formData.companyName || '',
          registration_reference: formData.gstin || '',
          buyer_type: formData.buyerType || '',
        };

        console.log('[Signup] Inserting profile:', profilePayload);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profilePayload]);

        if (profileError) {
          console.error('[Signup] Profile insert error:', JSON.stringify(profileError, null, 2));
          throw new Error(
            `Profile creation failed: ${profileError.message}` +
            (profileError.details ? ` (${profileError.details})` : '') +
            (profileError.hint ? ` Hint: ${profileError.hint}` : '')
          );
        }

        console.log('[Signup] Profile created successfully');
        navigate(ROUTES.BUYER_DASHBOARD);
      } else {
        navigate('/auth/buyer', { 
          state: { message: 'Please check your email to verify your account.' } 
        });
      }
    } catch (err: any) {
      console.error('[Signup] Error:', err);
      setError(getAuthErrorMessage(err, t('authPages.errorOccurred')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('auth.createAccount')}</h2>
        <p className={styles.subtitle}>Tell us a little about how you source.</p>
      </div>

      <FormMessage type="error" message={error} />

      <div className={styles.grid2}>
        <Input
          label={t('auth.fullName')}
          required
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
        />
        <Input
          label={t('authPages.companyName')}
          required
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
        />
      </div>

      <div className={styles.grid2}>
        <Input
          label={t('authPages.email')}
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
        <Input
          label={t('authPages.mobileNumber')}
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className={styles.grid2}>
        <Select
          label={t('authPages.state')}
          options={[
            { value: 'MH', label: t('authPages.maharashtra') },
            { value: 'GJ', label: t('authPages.gujarat') },
            { value: 'MP', label: t('authPages.madhyaPradesh') }
          ]}
          value={formData.state}
          onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
        />
        <Select
          label={t('authPages.district')}
          options={[
            { value: 'nashik', label: t('authPages.nashik') },
            { value: 'pune', label: t('authPages.pune') },
            { value: 'ahmednagar', label: t('authPages.ahmednagar') }
          ]}
          value={formData.district}
          onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
        />
      </div>

      <div className={styles.grid2}>
        <Select
          label={t('authPages.buyerType')}
          options={[
            { value: 'wholesaler', label: t('authPages.wholesaler') },
            { value: 'processor', label: t('authPages.processor') },
            { value: 'retailer', label: t('authPages.retailer') }
          ]}
          value={formData.buyerType}
          onChange={(value) => setFormData(prev => ({ ...prev, buyerType: value }))}
        />
        <Input
          label={t('authPages.gstin')}
          value={formData.gstin}
          onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
        />
      </div>

      <div className={styles.grid2}>
        <div className={styles.passwordContainer}>
          <Input
            label={t('authPages.password')}
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? t('authPages.creating') : t('authPages.createAccountBtn')}
      </Button>
    </form>
  );
};
