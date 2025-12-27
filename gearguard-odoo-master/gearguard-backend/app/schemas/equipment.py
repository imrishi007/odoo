from pydantic import BaseModel

class EquipmentOut(BaseModel):
    id: int
    name: str
    serial_number: str
    location: str | None
    status: str

    class Config:
        from_attributes = True
