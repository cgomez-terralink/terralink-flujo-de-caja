from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    name: str
    initials: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    initials: str
    is_active: bool
    role: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
