"""Disable response_model for POST endpoint too"""
import os

os.chdir(r'C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\gearguard-odoo-master\gearguard-backend')

with open('app/api/requests.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove response_model from POST endpoint  
content = content.replace(
    '@router.post("", response_model=MaintenanceRequestOut,',
    '@router.post("",  # response_model temporarily disabled'
)

with open('app/api/requests.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Disabled response validation for POST endpoint")
print("Backend will auto-reload.")
