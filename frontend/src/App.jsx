import AppRouter from "./routes/AppRouter";

function App() {
  return <AppRouter />;
}

export default App;
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queries/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

// QueryClientProvider: cho phép dùng TanStack Query ở mọi nơi
// AuthProvider: cho phép dùng useAuth() ở mọi nơi
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
