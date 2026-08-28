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
    buyerType: '',
    gstin: '',
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
            role: 'BUYER',
            phone: formData.phone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user && !authData.session) {
        navigate('/auth/buyer', { state: { message: 'Please check your email to verify your account.' } });
        return;
      }

      if (authData.user) {
        navigate('/buyer/dashboard');
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
        <h1 className={styles.title}>{t('auth.buyerSignupTitle')}</h1>
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
