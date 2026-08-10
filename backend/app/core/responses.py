from typing import Any


def success_response(
    message: str,
    data: Any = None,
) -> dict:
    """
    Standard success response.
    """
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(
    message: str,
    errors: Any = None,
) -> dict:
    """
    Standard error response.

    Note:
    FastAPI HTTPException already returns its own format.
    This helper is mainly useful if you later implement
    custom exception handlers.
    """
    return {
        "success": False,
        "message": message,
        "errors": errors,
    }