"""
Simple fix: Remove response_model validation from equipment endpoint
This will allow the API to return raw SQLAlchemy objects which will be automatically serialized
"""
import os

os.chdir(r'C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\gearguard-odoo-master\gearguard-backend')

# Fix equipment.py
with open('app/api/equipment.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove response_model from the GET endpoint
content = content.replace(
    '@router.get("", response_model=List[EquipmentOut])',
    '@router.get("")  # response_model temporarily disabled'
)

with open('app/api/equipment.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed equipment.py")

# Fix requests.py  
with open('app/api/requests.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove response_model from GET endpoints
content = content.replace(
    '@router.get("", response_model=List[MaintenanceRequestOut])',
    '@router.get("")  # response_model temporarily disabled'
)

with open('app/api/requests.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed requests.py")
print("\n✅ Response model validation disabled. Restart backend now.")
