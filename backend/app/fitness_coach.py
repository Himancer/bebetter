"""
BetterMe - AI Fitness Coach
Open-source fitness chatbot using rule-based responses
Can be upgraded to use local LLM (Ollama, LLaMA2, etc)

Research-backed responses from:
- Journal of the International Society of Sports Nutrition
- Medicine & Science in Sports & Exercise
- Strength and Conditioning Journal
"""

FITNESS_KNOWLEDGE_BASE = {
    'workout_routines': {
        'beginner': {
            'response': 'Great! Here\'s a beginner-friendly routine:\n\n**Monday (Push):**\n• 3 sets Bench Press 8-10 reps\n• 3 sets Incline Press 8-10 reps\n• 3 sets Bicep Curls 10-12 reps\n\n**Wednesday (Pull):**\n• 3 sets Lat Pulldown 10-12 reps\n• 3 sets Rows 8-10 reps\n• 3 sets Leg Curls 10-12 reps\n\n**Friday (Legs):**\n• 3 sets Squats 6-8 reps\n• 3 sets Leg Press 8-10 reps\n• 3 sets Calf Raises 12-15 reps\n\nRest 60-90 seconds between sets. Add 2.5kg weekly when hitting target reps.',
            'keywords': ['beginner', 'start', 'new to', 'routine', 'program'],
        },
        'intermediate': {
            'response': 'For intermediate training, try an Upper/Lower split:\n\n**Upper A:**\n• Bench Press 4x5 @ RPE 8\n• Bent Row 4x5\n• Incline Press 3x8\n• Pull-ups 3x6-8\n\n**Lower A:**\n• Squat 4x5\n• Deadlift 2x3\n• Front Squat 3x6\n• Leg Curls 3x8-10\n\n**Upper B:**\n• Overhead Press 4x5\n• Lat Pulldown 4x6-8\n• Dumbbell Press 3x8\n• Barbell Rows 3x5\n\n**Lower B:**\n• Leg Press 4x6-8\n• RDL 3x5\n• Leg Extensions 3x10-12\n• Walking Lunges 3x8\n\nTrain 4x/week with 1-2 min rest between compound sets.',
            'keywords': ['intermediate', 'progress', 'split', 'compound', 'strength'],
        },
        'hiit': {
            'response': 'HIIT for Fat Loss (3x per week, rest days between):\n\n**Tabata Protocol (20min total):**\n• 30 sec work : 30 sec rest\n• Jump Squats\n• Burpees\n• Mountain Climbers\n• Jump Rope\n\nRepeat 8 rounds (4 min) per exercise.\n\n**Why HIIT works:**\n• Burns 30% more fat than steady cardio (Sports Med, 2018)\n• EPOC (Excess Post-Exercise Oxygen): elevated metabolism for 24-48 hours\n• Preserves muscle better than long cardio\n\n⚠️ WARNING: Very intense. Start with 1-2 per week if new to exercise.',
            'keywords': ['hiit', 'fat loss', 'cardio', 'quick', 'intense', 'fast'],
        },
    },
    
    'nutrition': {
        'protein': {
            'response': 'Protein Guidelines (ISSN, 2017):\n\n**For Muscle Gain:**\n• 1.6-2.2g per kg of body weight\n• Example: 80kg person = 128-176g protein/day\n• Spread across 4-5 meals (20-40g per meal)\n\n**Best Protein Sources:**\n• Chicken Breast: 31g per 100g\n• Eggs: 6g per egg\n• Greek Yogurt: 10g per 100g\n• Salmon: 22g per 100g\n• Whey Protein: 25g per scoop\n\n**Pro Tip:** Combine with carbs post-workout for 30% faster muscle growth (JISSN, 2019)',
            'keywords': ['protein', 'macros', 'eating', 'meals', 'gain', 'muscle'],
        },
        'fat_loss': {
            'response': 'Fat Loss Nutrition Strategy:\n\n**Caloric Deficit:** 300-500 kcal below maintenance\n• 20% deficit = sustainable fat loss\n• 30% deficit = faster but may lose muscle\n\n**Macro Split for Fat Loss:**\n• Protein: 30-35% (preserves muscle)\n• Carbs: 40-45% (fuels training)\n• Fat: 20-25% (hormone health)\n\n**Appetite Management:**\n• High protein = 25% more satiety\n• Fiber: 25-30g/day\n• Drink 3-4L water daily\n\n**Foods to Focus On:**\n• Eggs, Greek Yogurt, Lean Meat\n• Oats, Brown Rice, Sweet Potato\n• Broccoli, Spinach, Peppers\n• Almonds, Olive Oil (measured portions)\n\n**Expected Rate:** 0.5-1 kg fat loss per week',
            'keywords': ['fat loss', 'diet', 'lose weight', 'calories', 'deficit'],
        },
    },
    
    'recovery': {
        'sleep': {
            'response': 'Sleep & Recovery (critical for gains!):\n\n**Sleep Duration:**\n• 7-9 hours optimal for muscle recovery\n• 1 hour less sleep = 14% reduction in strength\n• Growth hormone peaks at hour 3-4 of sleep (Sleep Health, 2021)\n\n**Sleep Quality Tips:**\n• Cool room (16-19°C ideal)\n• No screens 1 hour before bed\n• Consistent bedtime (circadian rhythm)\n• Magnesium supplement (400mg) before bed\n\n**Why It Matters:**\n• Testosterone: 20% lower with poor sleep\n• Cortisol (stress): elevated, promotes belly fat\n• Protein synthesis: reduced 50% on poor sleep\n\n💡 Pro: Track sleep with fitness watch for personalized recovery',
            'keywords': ['sleep', 'recovery', 'rest', 'tired', 'sore'],
        },
        'stretching': {
            'response': 'Stretching & Mobility:\n\n**Static Stretching (POST-WORKOUT):**\nHold 30 seconds, 2-3 sets per muscle group\n• Hamstring Stretch\n• Quad Stretch\n• Chest Doorway Stretch\n• Shoulder & Tricep Stretch\n\n**Dynamic Stretching (PRE-WORKOUT):**\n10 reps each, controlled movements\n• Leg Swings\n• Arm Circles\n• Cat-Cow Stretch\n• Bodyweight Squats\n\n**Myth Buster:** Static stretching pre-workout REDUCES strength by 5-10% (ACSM, 2016)\n\n**Foam Rolling:**\n• 30-60 sec per muscle group\n• Reduces muscle tension, improves range of motion\n• Better than stretching for soreness prevention',
            'keywords': ['stretch', 'mobility', 'sore', 'pain', 'flexibility'],
        },
    },
    
    'goals': {
        'bulk': {
            'response': 'Muscle Building (Bulking) Plan:\n\n**Caloric Surplus:** +300-500 kcal above maintenance\n• 80kg person at 2000 kcal maintenance → eat 2300-2500 kcal\n• Expect: 0.5-1 kg weight gain per week\n\n**Macro Targets:**\n• Protein: 1.8-2.2g per kg (160-176g for 80kg)\n• Carbs: 4-6g per kg (320-480g)\n• Fat: 0.8-1.2g per kg (64-96g)\n\n**Best Foods:**\n• Rice, Oats, Pasta (carbs)\n• Chicken, Salmon, Beef (protein)\n• Olive Oil, Nuts, Avocado (healthy fats)\n\n**Training Focus:**\n• Progressive overload: Add 2.5kg weekly\n• Compound movements (Squat, Deadlift, Bench)\n• 3-4 sets x 6-8 reps for hypertrophy\n• Rest 60-90 sec between sets\n\n💪 Reality: 10kg muscle gain in 1 year = realistic natural progress',
            'keywords': ['bulk', 'gain', 'muscle', 'bigger', 'size'],
        },
        'cut': {
            'response': 'Fat Loss (Cutting) Plan:\n\n**Caloric Deficit:** -300-500 kcal below maintenance\n• Creates 210,000-350,000 kcal deficit per week = 0.5-1 kg fat loss\n\n**Macro Strategy to Preserve Muscle:**\n• Protein: 2.2g per kg (highest priority!)\n• Carbs: 3-4g per kg\n• Fat: 0.8-1g per kg\n\n**Strength Training (CRITICAL):**\n• Keep lifting heavy (6-8 reps)\n• Signals muscles: \"keep me, I\'m useful\"\n• May lose some strength (-10%), but muscle preserved\n\n**Cardio:** 150 min moderate/week (walking, cycling)\n- Easier to sustain than HIIT when cutting\n\n**Timeline:**\n• 10kg fat loss = ~10 weeks at 1kg/week\n• Final 2-3 weeks slower (adaptive thermogenesis)\n\n**Supplements to Consider:**\n• Creatine (proven muscle preservation)\n• Caffeine (mild appetite suppressant)\n• Fiber supplements (satiety)',
            'keywords': ['cut', 'lose fat', 'shred', 'lean', 'definition'],
        },
    },
    
    'general': {
        'motivation': {
            'response': '💪 Motivation Boost:\n\n"Motivation is what gets you started. Habit is what keeps you going." - Jim Ryun\n\n**Keys to Consistency:**\n1. Start small (2x/week is better than 0)\n2. Attach to existing habit (after breakfast → workout)\n3. Track progress (app, journal, photos)\n4. Find your \"why\" (health, confidence, strength)\n5. Celebrate small wins (consistency > perfection)\n\n**The Truth:**\n• First 2 weeks: hard (motivation peaks)\n• Week 3-4: plateau (habit forming)\n• Week 5+: autopilot (identity shift)\n\nYou\'re not motivated because you work out. You work out, and THEN motivation follows. Start today! 🚀',
            'keywords': ['motivation', 'stuck', 'inconsistent', 'lazy', 'cant'],
        },
        'hello': {
            'response': '👋 Hey there! I\'m BetterMe, your AI Fitness Coach!\n\nI can help with:\n• 💪 Workout routines (beginner → advanced)\n• 🥗 Nutrition & macro planning\n• 🔥 Fat loss strategies\n• 📈 Muscle building programs\n• 😴 Recovery & sleep optimization\n• 📊 Progress tracking\n\nJust ask me anything about fitness, and I\'ll give you science-backed advice!\n\n**Examples:**\n• "Give me a beginner workout"\n• "How much protein do I need?"\n• "How to lose fat fast?"\n• "I\'m sore, what should I do?"',
            'keywords': ['hi', 'hello', 'hey', 'start', 'help'],
        },
    }
}

def get_betterme_response(user_message: str) -> str:
    """
    Generate response from BetterMe chatbot using rule-based knowledge base
    Can be easily upgraded to use local LLM (Ollama, Llama2, Mistral)
    """
    user_message_lower = user_message.lower()
    
    # Search through knowledge base
    for category, topics in FITNESS_KNOWLEDGE_BASE.items():
        for topic, content in topics.items():
            keywords = content['keywords']
            
            # Check if any keywords match
            if any(keyword in user_message_lower for keyword in keywords):
                return content['response']
    
    # Default response if no keywords match
    return """I didn't quite catch that! Here are some things I can help with:

💪 **Workouts:** "Give me a beginner routine", "HIIT for fat loss", "5-day split"
🥗 **Nutrition:** "How much protein?", "Calorie deficit", "Meal timing"
🔥 **Goals:** "Build muscle", "Lose fat", "Get stronger"
😴 **Recovery:** "Sleep tips", "Stretching", "Why am I sore?"
📊 **General:** "Motivation tips", "Track progress"

What would you like to know? 💪"""

# For testing
if __name__ == '__main__':
    test_messages = [
        "Hello",
        "Give me a beginner workout routine",
        "How much protein should I eat?",
        "I want to lose fat fast",
        "Why can't I sleep?",
        "How do I get bigger muscles?",
    ]
    
    for msg in test_messages:
        response = get_betterme_response(msg)
        print(f"\n👤 User: {msg}")
        print(f"🤖 BetterMe:\n{response}")
        print("-" * 60)
