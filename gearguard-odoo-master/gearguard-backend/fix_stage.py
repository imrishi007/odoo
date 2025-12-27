"""Fix stage value from 'draft' to 'new'"""
import os

os.chdir(r'C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\gearguard-odoo-master\gearguard-backend')

with open('app/api/requests.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace stage="draft" with stage="new"
content = content.replace('stage="draft"', 'stage="new"')

with open('app/api/requests.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed stage value from 'draft' to 'new'")
print("Restart backend to apply changes.")
