import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Silently log and prevent the Vite overlay from taking over
    console.warn("Caught by Boundary:", error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f141f] text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-xs space-y-4">
            <h2 className="text-xl font-bold">Oops! Algo deu errado</h2>
            <p className="text-sm text-white/60">Tivemos um problema técnico. Clique no botão abaixo para recarregar o bot.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors"
            >
              Recarregar Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
