"""
Nutrition optimization engine.
Calculates daily calorie and macro targets based on user goal, BMI, height, weight, age, and activity level.
"""

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    Basal Metabolic Rate using Mifflin-St Jeor equation.
    Returns BMR in kcal/day.
    """
    if gender.lower() in ['m', 'male']:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:  # female or default
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    return bmr

def calculate_tdee(bmr: float, activity_level: str) -> float:
    """
    Total Daily Energy Expenditure.
    activity_level: 'sedentary', 'light', 'moderate', 'active', 'very_active'
    """
    multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9,
    }
    mult = multipliers.get(activity_level.lower(), 1.55)
    return bmr * mult

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """BMI = weight(kg) / (height(m))^2"""
    height_m = height_cm / 100.0
    return weight_kg / (height_m ** 2)

def calculate_nutrition_targets(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    goal: str,
    activity_level: str
) -> dict:
    """
    Returns daily nutrition targets: calories, protein_g, carbs_g, fats_g.
    """
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    bmi = calculate_bmi(weight_kg, height_cm)

    # Adjust TDEE based on goal
    if goal.lower() in ['fat_loss', 'fat loss', 'weight loss', 'cut']:
        daily_calories = tdee * 0.85  # 15% deficit
    elif goal.lower() in ['muscle_gain', 'muscle gain', 'bulk', 'build']:
        daily_calories = tdee * 1.1   # 10% surplus
    else:  # maintenance
        daily_calories = tdee

    # Macro targets
    protein_g = weight_kg * 1.6  # 1.6g per kg (flexible, higher for muscle gain)

    # Remaining calories split 50/50 carbs:fats
    remaining_cals = daily_calories - (protein_g * 4)
    carbs_g = remaining_cals * 0.5 / 4
    fats_g = remaining_cals * 0.5 / 9

    return {
        'daily_calories': round(daily_calories),
        'protein_g': round(protein_g, 1),
        'carbs_g': round(carbs_g, 1),
        'fats_g': round(fats_g, 1),
        'bmr': round(bmr),
        'tdee': round(tdee),
        'bmi': round(bmi, 1),
        'goal': goal,
        'activity_level': activity_level,
    }
