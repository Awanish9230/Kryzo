import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-zinc-900 p-6 rounded-xl border border-red-500/20 max-w-2xl w-full overflow-auto">
                        <p className="text-red-400 font-mono mb-4 font-bold">
                            {this.state.error && this.state.error.toString()}
                        </p>
                        <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 text-zinc-500 hover:text-white"
                    >
                        Go Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
