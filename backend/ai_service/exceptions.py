class AIServiceError(Exception):
    """Base exception for all AI service operations."""
    pass


class AIConfigurationError(AIServiceError):
    """Raised when AI service configuration (e.g., API key or URL) is missing or invalid."""
    pass


class AITimeoutError(AIServiceError):
    """Raised when the external AI provider API times out."""
    pass


class AIAPIError(AIServiceError):
    """Raised when the AI provider returns a non-200 HTTP status."""
    pass


class AIValidationError(AIServiceError):
    """Raised when AI response is not valid JSON or violates schema constraints."""
    pass
