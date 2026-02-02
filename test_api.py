#!/usr/bin/env python3
import requests
import json
import time

print("=" * 60)
print("BEBETTER APP - FULL FEATURE WALKTHROUGH")
print("=" * 60)

# Give server time to start
time.sleep(2)

BASE_URL = "http://localhost:8000"

# Test 1: Health Check
print("\n1. HEALTH CHECK")
print("-" * 60)
try:
    health = requests.get(f"{BASE_URL}/")
    print(f"Status: {health.status_code}")
    print(f"Response: {health.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Login (using pre-seeded test user)
print("\n2. LOGIN")
print("-" * 60)
login_response = requests.post(
    f"{BASE_URL}/users/login?email=test@example.com&password=password123"
)
print(f"Status: {login_response.status_code}")

if login_response.status_code == 200:
    token_data = login_response.json()
    access_token = token_data.get("access_token")
    print(f"Access Token: {access_token[:40]}...")
    print(f"Token Type: {token_data.get('token_type')}")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Test 3: Get User Profile
    print("\n3. USER PROFILE")
    print("-" * 60)
    profile = requests.get(f"{BASE_URL}/users/profile", headers=headers)
    if profile.status_code == 200:
        user = profile.json()
        print(f"Name: {user.get('name')}")
        print(f"Email: {user.get('email')}")
        print(f"Age: {user.get('age')}")
        print(f"Height: {user.get('height_cm')} cm")
        print(f"Weight: {user.get('weight_kg')} kg")
        print(f"Goal: {user.get('goal')}")
        print(f"Activity Level: {user.get('activity_level')}")
    
    # Test 4: Get Foods Database
    print("\n4. FOOD DATABASE")
    print("-" * 60)
    foods = requests.get(f"{BASE_URL}/foods/", headers=headers)
    if foods.status_code == 200:
        food_list = foods.json()
        print(f"Total foods in database: {len(food_list)}")
        if food_list:
            sample = food_list[0]
            print(f"\nSample Food: {sample.get('name')}")
            print(f"  Calories/100g: {sample.get('calories_100g')}")
            print(f"  Protein/100g: {sample.get('protein_100g')}g")
            print(f"  Carbs/100g: {sample.get('carbs_100g')}g")
            print(f"  Fat/100g: {sample.get('fat_100g')}g")
    
    # Test 5: Get Exercises Database
    print("\n5. EXERCISE DATABASE")
    print("-" * 60)
    exercises = requests.get(f"{BASE_URL}/workouts/exercises", headers=headers)
    if exercises.status_code == 200:
        ex_list = exercises.json()
        print(f"Total exercises available: {len(ex_list)}")
        if ex_list:
            sample_ex = ex_list[0]
            print(f"\nSample Exercise: {sample_ex.get('name')}")
            print(f"  Muscle Group: {sample_ex.get('muscle_group')}")
            print(f"  Equipment: {sample_ex.get('equipment')}")
            print(f"  Difficulty: {sample_ex.get('difficulty')}")
    
    # Test 6: Log a Workout
    print("\n6. LOG WORKOUT")
    print("-" * 60)
    workout = requests.post(
        f"{BASE_URL}/workouts/logs",
        headers=headers,
        json={
            "duration": 60.0,
            "calories_burned": 450.0,
            "items": [
                {"exercise_id": ex_list[0].get('id'), "sets": 3, "reps": 10, "weight": 50.0}
            ]
        }
    )
    print(f"Status: {workout.status_code}")
    if workout.status_code in [200, 201]:
        workout_data = workout.json()
        print(f"Workout logged: ID {workout_data.get('id')}")
        print(f"Duration: {workout_data.get('duration')} min")
        print(f"Calories burned: {workout_data.get('calories_burned')} kcal")
    else:
        print(f"Error: {workout.json()}")
    
    # Test 7: Get Nutrition Summary
    print("\n7. NUTRITION SUMMARY")
    print("-" * 60)
    nutrition = requests.get(f"{BASE_URL}/nutrition/daily-summary", headers=headers)
    if nutrition.status_code == 200:
        nutr = nutrition.json()
        print(f"BMR (Basal Metabolic Rate): {nutr.get('bmr')} kcal/day")
        print(f"Daily Calorie Goal: {nutr.get('daily_calorie_goal')} kcal")
        print(f"Recommended Protein: {nutr.get('protein_target')}g/day")
        print(f"Recommended Carbs: {nutr.get('carbs_target')}g/day")
        print(f"Recommended Fat: {nutr.get('fat_target')}g/day")
    
    # Test 8: AI Chat
    print("\n8. AI COACH (BetterMe) CHAT")
    print("-" * 60)
    chat = requests.post(
        f"{BASE_URL}/ai-chat/message",
        headers=headers,
        json={"message": "Give me a 30-minute HIIT workout routine"}
    )
    print(f"Status: {chat.status_code}")
    if chat.status_code == 200:
        chat_data = chat.json()
        response = chat_data.get("response", "No response")
        print(f"\nBetterMe: {response[:200]}...")
    
    # Test 9: Get Chat History
    print("\n9. CHAT HISTORY")
    print("-" * 60)
    history = requests.get(f"{BASE_URL}/ai-chat/messages", headers=headers)
    if history.status_code == 200:
        messages = history.json()
        print(f"Total messages: {len(messages)}")
        for msg in messages[-3:]:
            print(f"\n  Role: {msg.get('role')}")
            print(f"  Message: {msg.get('message')[:80]}...")

else:
    print(f"Login failed: {login_response.json()}")

print("\n" + "=" * 60)
print("API TEST COMPLETE")
print("=" * 60)
