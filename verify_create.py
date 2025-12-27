import requests

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYWYxNzg4Mi1mYmYwLTQ2YTctOWY0ZS0xNWQ1NmYwNjE0N2UiLCJyb2xlIjoxLCJleHAiOjE3NjY4MzM2MzB9.f6EW65Mq4iX91VvdWugxrybPLX-Uvr6SFr9pz5-1goM"

r = requests.get('http://localhost:8000/api/requests', 
                 headers={'Authorization': f'Bearer {TOKEN}'})
data = r.json()

print(f'Total requests: {len(data)}')
print('\nLatest 3 requests:')
for req in data[-3:]:
    print(f"\n  - ID: {req.get('id')}")
    print(f"  - Subject: {req.get('subject')}")
    print(f"  - Request#: {req.get('request_number')}")
    print(f"  - Stage: {req.get('stage')}")
    print(f"  - Priority: {req.get('priority')}")
    print(f"  - Equipment ID: {req.get('equipment_id')}")
    print(f"  - Created: {req.get('created_at')}")
