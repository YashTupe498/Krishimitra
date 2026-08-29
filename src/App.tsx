import { AuthProvider } from './app/providers/AuthProvider';
import { AppRouter } from './app/router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
