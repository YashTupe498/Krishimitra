import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FormMessage } from '../../../components/ui/FormMessage';
import { supabase } from '../../../lib/supabase';
import styles from './AuthForm.module.css';

export const FarmerSignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountType: 'individual',
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'FARMER',
            phone: formData.phone
          }
        }
      });

      if (authError) throw authError;

      // If email confirmation is required, the user won't be signed in automatically
      if (authData.user && !authData.session) {
        // You might want to show a success message here to check email
        navigate('/auth/farmer', { state: { message: 'Please check your email to verify your account.' } });
        return;
      }

      if (authData.user) {
        navigate('/farmer/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('authPages.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('auth.farmerSignupTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.createAccount')}</p>
      </div>

      <FormMessage type="error" message={error} />

      <div className={styles.grid2}>
        <Input
          label={t('auth.fullName')}
          required
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
        />
        <Select
          label={t('authPages.accountType')}
          options={[
            { value: 'individual', label: t('authPages.individualFarmer') },
            { value: 'fpo', label: t('authPages.fpoCooperative') }
          ]}
          value={formData.accountType}
          onChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
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
