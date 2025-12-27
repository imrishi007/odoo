"""
Quick fix script to add converters for integer/UUID fields to the API endpoints
"""

# Fix the equipment endpoint
equipment_api_path = "app/api/equipment.py"

with open(equipment_api_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a conversion function at the beginning if not already there
if "def convert_equipment_response" not in content:
    conversion_func = '''
def convert_equipment_response(equipment):
    """Convert integer and UUID fields to strings for JSON serialization"""
    equipment_dict = equipment.__dict__.copy()
    # Convert health_status to string
    if equipment_dict.get('health_status') is not None:
        equipment_dict['health_status'] = str(equipment_dict['health_status'])
    # Convert UUID fields to strings
    for field in ['id', 'category_id', 'team_id', 'location_id', 'assigned_to_user_id']:
        if equipment_dict.get(field) is not None:
            equipment_dict['health_status'] = str(equipment_dict['health_status'])
            equipment_dict[field] = str(equipment_dict[field])
    return equipment_dict
'''
    
    # Find the first function definition and insert before it
    import_section_end = content.find("\n@router")
    if import_section_end > 0:
        content = content[:import_section_end] + "\n" + conversion_func + content[import_section_end:]
    
    with open(equipment_api_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Added conversion function to equipment.py")

# Now update the GET endpoint to use the conversion
with open(equipment_api_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the return statement in the GET /equipment endpoint
if "return equipment" in content and "convert_equipment_response" not in content:
    # This is a simple approach - find the list comprehension or return
    content = content.replace(
        "return equipment",
        "return [convert_equipment_response(eq) for eq in equipment]"
    )
    
    with open(equipment_api_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Updated GET endpoint to use conversion")

print("\nNow fixing requests.py...")

# Fix the requests endpoint
requests_api_path = "app/api/requests.py"

with open(requests_api_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a conversion function
if "def convert_request_response" not in content:
    conversion_func = '''
def convert_request_response(request):
    """Convert integer and UUID fields to strings for JSON serialization"""
    request_dict = request.__dict__.copy()
    # Convert priority to string
    if request_dict.get('priority') is not None:
        request_dict['priority'] = str(request_dict['priority'])
    # Convert UUID fields to strings
    for field in ['id', 'equipment_id', 'assigned_technician_id', 'created_by_user_id', 'completed_by_user_id']:
        if request_dict.get(field) is not None:
            request_dict[field] = str(request_dict[field])
    return request_dict
'''
    
    import_section_end = content.find("\n@router")
    if import_section_end > 0:
        content = content[:import_section_end] + "\n" + conversion_func + content[import_section_end:]
    
    with open(requests_api_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Added conversion function to requests.py")

print("\n✅ Schema fixes applied!")
print("Now restart the backend server.")
