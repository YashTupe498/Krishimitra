import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormMessage } from '../../../components/ui/FormMessage';
import { auth } from '../../../services/supabase/auth';
import { profileService } from '../../../services/supabase/profile';
import { ROUTES } from '../../../constants/routes';
import styles from './AuthForm.module.css';
import { useAuth } from '../../../app/providers/AuthProvider';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authData = await auth.signIn({
        email: formData.email,
        password: formData.password
      });

      if (authData.user) {
        // Fetch profile
        const profile = await profileService.getProfile(authData.user.id);
        
        // Let AuthProvider know to fetch the profile too, just in case
        await refreshProfile();
        
        if (profile?.role === 'FARMER') {
          navigate(ROUTES.FARMER_DASHBOARD);
        } else if (profile?.role === 'BUYER') {
          navigate(ROUTES.BUYER_DASHBOARD);
        } else {
          navigate(ROUTES.HOME);
        }
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
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.signIn')}</p>
        </div>
      </div>
      <FormMessage type="error" message={error} />
      
      <Input
        label={t('authPages.email')}
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
      />
      
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

      <div className={styles.forgotPassword}>
        <button type="button" className="text-sm">
          {t('authPages.forgotPassword')}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? t('authPages.loggingIn') : t('authPages.logInBtn')}
      </Button>
    </form>
  );
};
