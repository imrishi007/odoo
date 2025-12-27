import requests

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYWYxNzg4Mi1mYmYwLTQ2YTctOWY0ZS0xNWQ1NmYwNjE0N2UiLCJyb2xlIjoxLCJleHAiOjE3NjY4MzM2MzB9.f6EW65Mq4iX91VvdWugxrybPLX-Uvr6SFr9pz5-1goM"

# Get requests without limit
r = requests.get('http://localhost:8000/api/requests?limit=5000', 
                 headers={'Authorization': f'Bearer {TOKEN}'})
data = r.json()

print(f'Total requests: {len(data)}')

# Find our test requests
test_requests = [req for req in data if 'Test Request' in req.get('subject', '')]

if test_requests:
    print(f'\n✅ Found {len(test_requests)} test request(s)!')
    for req in test_requests[-5:]:  # Show last 5
        print(f"\n  - ID: {req.get('id')}")
        print(f"  - Subject: {req.get('subject')}")
        print(f"  - Request#: {req.get('request_number')}")
        print(f"  - Stage: {req.get('stage')}")
        print(f"  - Priority: {req.get('priority')}")
        print(f"  - Equipment ID: {req.get('equipment_id')}")
        print(f"  - Maintenance Type: {req.get('maintenance_type')}")
        print(f"  - Description: {req.get('description')}")
        print(f"  - Created: {req.get('created_at')}")
else:
    print('\n❌ No test requests found')
    print('\nShowing latest 5 requests instead:')
    for req in data[-5:]:
        print(f"\n  - ID: {req.get('id')}")
        print(f"  - Subject: {req.get('subject')}")
        print(f"  - Created: {req.get('created_at')}")
