import { AuthProvider } from './hooks/useAuth';
import { AppRouter } from './app/router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
