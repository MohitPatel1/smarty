import React from 'react'
import showNotification from 'lib/showNotification'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    showNotification('An error occurred. Attempting to recover...', 'warning')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an error but is trying to recover.</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
} 