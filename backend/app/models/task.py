from pydantic import BaseModel

class Task(BaseModel):
    id: int
    type: str
    status: str
    result: str = ""
