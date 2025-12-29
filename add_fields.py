import json
import re
import random

# Mongolian weekdays
WEEKDAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"]

def extract_experience(description):
    """Extract years of experience from description"""
    # Look for patterns like "10 жил", "5 жилийн", "14 жил ажилласан"
    patterns = [
        r'(\d+)\s*жил',  # Basic pattern
    ]
    
    for pattern in patterns:
        match = re.search(pattern, description)
        if match:
            return int(match.group(1))
    
    # If no match, return random reasonable value between 3-12
    return random.choice([3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

def generate_availability():
    """Generate random availability (1-5 days)"""
    num_days = random.randint(2, 6)  # Most workers available 2-6 days
    days = random.sample(WEEKDAYS, num_days)
    return sorted(days, key=lambda x: WEEKDAYS.index(x))  # Sort by weekday order

# Read the JSON file
with open('public/data/workers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Process each worker
for worker in data['workers']:
    # Add experience field
    worker['experience'] = extract_experience(worker['description'])
    
    # Add availability field
    worker['availability'] = generate_availability()

# Write back to file with nice formatting
with open('public/data/workers.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Successfully updated {len(data['workers'])} workers!")
print("Added fields: experience, availability")
