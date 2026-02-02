"""
Basic tests for BeBetter backend.
Run: pytest tests/
"""
import pytest
from app.nutrition import calculate_bmi, calculate_bmr, calculate_nutrition_targets

def test_bmi_calculation():
    # BMI = weight(kg) / (height(m))^2
    # For 70kg, 175cm: BMI = 70 / (1.75)^2 = 22.86
    bmi = calculate_bmi(70, 175)
    assert abs(bmi - 22.86) < 0.1

def test_bmr_calculation():
    # Mifflin-St Jeor for male, 80kg, 180cm, 25yo
    bmr = calculate_bmr(80, 180, 25, 'M')
    assert 1500 < bmr < 1800  # rough range

def test_nutrition_targets():
    targets = calculate_nutrition_targets(
        weight_kg=70,
        height_cm=175,
        age=25,
        gender='M',
        goal='muscle_gain',
        activity_level='moderate'
    )
    assert 'daily_calories' in targets
    assert targets['protein_g'] > 0
    assert targets['carbs_g'] > 0
    assert targets['fats_g'] > 0
    print(f"✓ Targets for 70kg male, muscle gain: {targets}")

def test_fat_loss_targets():
    targets = calculate_nutrition_targets(
        weight_kg=80,
        height_cm=170,
        age=30,
        gender='F',
        goal='fat_loss',
        activity_level='active'
    )
    assert targets['daily_calories'] < 2000  # should be deficit
    print(f"✓ Fat loss targets: {targets}")

if __name__ == '__main__':
    test_bmi_calculation()
    test_bmr_calculation()
    test_nutrition_targets()
    test_fat_loss_targets()
    print("\n✓ All tests passed!")
