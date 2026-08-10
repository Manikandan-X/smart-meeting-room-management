from fastapi import HTTPException, status


class NotFoundException(HTTPException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found.",
        )


class AlreadyExistsException(HTTPException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{resource} already exists.",
        )


class ValidationException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )


class ConflictException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )


class UnauthorizedException(HTTPException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
        )


class ForbiddenException(HTTPException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
        )
        
class InvalidCredentialsException(
    HTTPException,
):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
        
class PermissionDeniedException(
    HTTPException,
):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )