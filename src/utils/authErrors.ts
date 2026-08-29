export const getAuthErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (!error) return defaultMessage;
  const msg = typeof error === 'string' ? error : error.message || defaultMessage;
  
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (msg.includes('Invalid login credentials') || msg.includes('Email or password')) {
    return 'Email or password is incorrect.';
  }
  if (msg.includes('violates row-level security') || msg.includes('permission denied') || msg.includes('constraint') || msg.includes('Profile creation failed')) {
    return 'We couldn\'t complete your registration. Please try again.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('Network error')) {
    return 'Please check your internet connection and try again.';
  }
  
  return msg;
};
