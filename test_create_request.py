"""
Test script to create a maintenance request via the API
"""
import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"
# You'll need to login first to get a token, or use the one from localStorage
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYWYxNzg4Mi1mYmYwLTQ2YTctOWY0ZS0xNWQ1NmYwNjE0N2UiLCJyb2xlIjoxLCJleHAiOjE3NjY4MzM2MzB9.f6EW65Mq4iX91VvdWugxrybPLX-Uvr6SFr9pz5-1goM"

# Headers
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Test 1: Get existing equipment to use for the request
print("=" * 60)
print("Test 1: Getting equipment list...")
print("=" * 60)
response = requests.get(f"{API_BASE_URL}/api/equipment", headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    equipment_list = response.json()
    print(f"Found {len(equipment_list)} equipment items")
    if equipment_list:
        # Use the first equipment item
        first_equipment = equipment_list[0]
        print(f"Using equipment: {first_equipment.get('name')} (ID: {first_equipment.get('id')})")
        equipment_id = first_equipment.get('id')
    else:
        print("ERROR: No equipment found!")
        exit(1)
else:
    print(f"ERROR: {response.text}")
    exit(1)

# Test 2: Create a new maintenance request
print("\n" + "=" * 60)
print("Test 2: Creating new maintenance request...")
print("=" * 60)

new_request = {
    "subject": "Test Request - Engine Maintenance",
    "description": "Testing the create functionality - routine engine check",
    "equipment_id": equipment_id,
    "maintenance_type": "preventive",
    "priority": "2",
    "scheduled_date": None  # Changed to None - will be omitted in JSON
}

print(f"Request data: {json.dumps(new_request, indent=2)}")

response = requests.post(
    f"{API_BASE_URL}/api/requests",
    headers=headers,
    json=new_request
)

print(f"Status: {response.status_code}")

if response.status_code == 201:
    created_request = response.json()
    print(f"SUCCESS! Created request:")
    print(f"  - ID: {created_request.get('id')}")
    print(f"  - Request Number: {created_request.get('request_number')}")
    print(f"  - Subject: {created_request.get('subject')}")
    print(f"  - Stage: {created_request.get('stage')}")
    print(f"  - Priority: {created_request.get('priority')}")
    request_id = created_request.get('id')
else:
    print(f"ERROR: {response.text}")
    exit(1)

# Test 3: Verify the request was saved by retrieving it
print("\n" + "=" * 60)
print("Test 3: Verifying request was saved...")
print("=" * 60)

response = requests.get(f"{API_BASE_URL}/api/requests/{request_id}", headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    retrieved_request = response.json()
    print(f"SUCCESS! Retrieved request:")
    print(f"  - Subject: {retrieved_request.get('subject')}")
    print(f"  - Description: {retrieved_request.get('description')}")
    print(f"  - Stage: {retrieved_request.get('stage')}")
    print(f"  - Created At: {retrieved_request.get('created_at')}")
else:
    print(f"ERROR: {response.text}")
    exit(1)

# Test 4: Get all requests to see if our new one appears
print("\n" + "=" * 60)
print("Test 4: Getting all maintenance requests...")
print("=" * 60)

response = requests.get(f"{API_BASE_URL}/api/requests", headers=headers)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    all_requests = response.json()
    print(f"Total requests in system: {len(all_requests)}")
    
    # Find our newly created request
    our_request = next((r for r in all_requests if r.get('id') == request_id), None)
    if our_request:
        print(f"✓ Our new request appears in the list!")
    else:
        print(f"✗ Our new request does NOT appear in the list!")
else:
    print(f"ERROR: {response.text}")

print("\n" + "=" * 60)
print("All tests complete!")
print("=" * 60)
