"""Fix the syntax error in requests.py"""
import os

os.chdir(r'C:\Users\rishi\OneDrive\Desktop\gearguard-cmms\gearguard-cmms\gearguard-odoo-master\gearguard-backend')

with open('app/api/requests.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the syntax error - close the parenthesis properly
content = content.replace(
    '@router.post("",  # response_model temporarily disabled status_code=201)',
    '@router.post("", status_code=201)  # response_model temporarily disabled'
)

with open('app/api/requests.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed syntax error")
