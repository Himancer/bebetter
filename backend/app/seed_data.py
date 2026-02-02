"""
Seed foods database with common foods and macros (per 100g).
Data sourced from USDA FoodData Central and nutrition databases.
"""

FOODS_DATA = [
    # Grains
    {"name": "rice_white_cooked", "calories_100g": 130, "protein_100g": 2.7, "carbs_100g": 28, "fat_100g": 0.3, "fiber_100g": 0.4, "sugar_100g": 0, "sodium_100g": 5},
    {"name": "rice_brown_cooked", "calories_100g": 111, "protein_100g": 2.6, "carbs_100g": 23, "fat_100g": 0.9, "fiber_100g": 1.8, "sugar_100g": 0.3, "sodium_100g": 7},
    {"name": "roti", "calories_100g": 206, "protein_100g": 4.3, "carbs_100g": 43, "fat_100g": 0.5, "fiber_100g": 1.8, "sugar_100g": 0, "sodium_100g": 380},
    {"name": "bread_white", "calories_100g": 265, "protein_100g": 9, "carbs_100g": 49, "fat_100g": 3.3, "fiber_100g": 2.7, "sugar_100g": 5, "sodium_100g": 513},
    {"name": "bread_whole_wheat", "calories_100g": 247, "protein_100g": 13.7, "carbs_100g": 42.7, "fat_100g": 2.4, "fiber_100g": 6.8, "sugar_100g": 0, "sodium_100g": 446},
    {"name": "oats", "calories_100g": 389, "protein_100g": 16.9, "carbs_100g": 66.3, "fat_100g": 6.9, "fiber_100g": 10.6, "sugar_100g": 0, "sodium_100g": 30},
    
    # Proteins
    {"name": "chicken_breast", "calories_100g": 165, "protein_100g": 31, "carbs_100g": 0, "fat_100g": 3.6, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 73},
    {"name": "chicken_thigh", "calories_100g": 209, "protein_100g": 26, "carbs_100g": 0, "fat_100g": 11, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 75},
    {"name": "egg_whole", "calories_100g": 155, "protein_100g": 13, "carbs_100g": 1.1, "fat_100g": 11, "fiber_100g": 0, "sugar_100g": 1.1, "sodium_100g": 124},
    {"name": "egg_white", "calories_100g": 52, "protein_100g": 11, "carbs_100g": 1.3, "fat_100g": 0.2, "fiber_100g": 0, "sugar_100g": 1.3, "sodium_100g": 166},
    {"name": "paneer", "calories_100g": 208, "protein_100g": 25.2, "carbs_100g": 1.2, "fat_100g": 11.7, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 236},
    {"name": "salmon", "calories_100g": 206, "protein_100g": 22, "carbs_100g": 0, "fat_100g": 13, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 59},
    {"name": "tuna_canned", "calories_100g": 99, "protein_100g": 23, "carbs_100g": 0, "fat_100g": 0.8, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 384},
    {"name": "beef_lean", "calories_100g": 180, "protein_100g": 26, "carbs_100g": 0, "fat_100g": 8, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 75},
    {"name": "tofu", "calories_100g": 76, "protein_100g": 8.1, "carbs_100g": 1.9, "fat_100g": 4.8, "fiber_100g": 1.2, "sugar_100g": 0, "sodium_100g": 7},
    
    # Vegetables
    {"name": "broccoli", "calories_100g": 34, "protein_100g": 2.8, "carbs_100g": 7, "fat_100g": 0.4, "fiber_100g": 2.4, "sugar_100g": 1.7, "sodium_100g": 64},
    {"name": "spinach", "calories_100g": 23, "protein_100g": 2.9, "carbs_100g": 3.6, "fat_100g": 0.4, "fiber_100g": 2.2, "sugar_100g": 0.4, "sodium_100g": 79},
    {"name": "carrot", "calories_100g": 41, "protein_100g": 0.9, "carbs_100g": 10, "fat_100g": 0.2, "fiber_100g": 2.8, "sugar_100g": 4.7, "sodium_100g": 69},
    {"name": "sweet_potato", "calories_100g": 86, "protein_100g": 1.6, "carbs_100g": 20, "fat_100g": 0.1, "fiber_100g": 3, "sugar_100g": 4.2, "sodium_100g": 55},
    {"name": "broccoli_raw", "calories_100g": 34, "protein_100g": 2.8, "carbs_100g": 7, "fat_100g": 0.4, "fiber_100g": 2.4, "sugar_100g": 1.7, "sodium_100g": 64},
    
    # Fruits
    {"name": "banana", "calories_100g": 89, "protein_100g": 1.1, "carbs_100g": 23, "fat_100g": 0.3, "fiber_100g": 2.6, "sugar_100g": 12, "sodium_100g": 1},
    {"name": "apple", "calories_100g": 52, "protein_100g": 0.3, "carbs_100g": 14, "fat_100g": 0.2, "fiber_100g": 2.4, "sugar_100g": 10, "sodium_100g": 2},
    {"name": "orange", "calories_100g": 47, "protein_100g": 0.9, "carbs_100g": 12, "fat_100g": 0.1, "fiber_100g": 2.4, "sugar_100g": 9, "sodium_100g": 0},
    {"name": "berries_mixed", "calories_100g": 57, "protein_100g": 1.2, "carbs_100g": 14, "fat_100g": 0.3, "fiber_100g": 2.4, "sugar_100g": 10, "sodium_100g": 2},
    
    # Dairy
    {"name": "milk_whole", "calories_100g": 61, "protein_100g": 3.2, "carbs_100g": 4.8, "fat_100g": 3.3, "fiber_100g": 0, "sugar_100g": 4.8, "sodium_100g": 44},
    {"name": "greek_yogurt", "calories_100g": 59, "protein_100g": 10, "carbs_100g": 3.3, "fat_100g": 0.4, "fiber_100g": 0, "sugar_100g": 3.3, "sodium_100g": 46},
    {"name": "cheese", "calories_100g": 402, "protein_100g": 25, "carbs_100g": 1.3, "fat_100g": 33, "fiber_100g": 0, "sugar_100g": 0.7, "sodium_100g": 621},
    
    # Nuts & Seeds
    {"name": "almonds", "calories_100g": 579, "protein_100g": 21.2, "carbs_100g": 22, "fat_100g": 50, "fiber_100g": 12.5, "sugar_100g": 4.4, "sodium_100g": 1},
    {"name": "peanut_butter", "calories_100g": 588, "protein_100g": 25.8, "carbs_100g": 20, "fat_100g": 50, "fiber_100g": 6, "sugar_100g": 5, "sodium_100g": 404},
    
    # Oils & Fats
    {"name": "olive_oil", "calories_100g": 884, "protein_100g": 0, "carbs_100g": 0, "fat_100g": 100, "fiber_100g": 0, "sugar_100g": 0, "sodium_100g": 0},
]

PORTIONS_DATA = [
    # Example portions for common foods
    {"food_name": "rice_white_cooked", "portion_name": "small", "grams": 100},
    {"food_name": "rice_white_cooked", "portion_name": "medium", "grams": 200},
    {"food_name": "rice_white_cooked", "portion_name": "large", "grams": 300},
    
    {"food_name": "roti", "portion_name": "single", "grams": 50},
    {"food_name": "roti", "portion_name": "double", "grams": 100},
    
    {"food_name": "chicken_breast", "portion_name": "small", "grams": 100},
    {"food_name": "chicken_breast", "portion_name": "medium", "grams": 150},
    {"food_name": "chicken_breast", "portion_name": "large", "grams": 200},
    
    {"food_name": "egg_whole", "portion_name": "single", "grams": 50},
    {"food_name": "egg_whole", "portion_name": "double", "grams": 100},
    
    {"food_name": "banana", "portion_name": "small", "grams": 100},
    {"food_name": "banana", "portion_name": "medium", "grams": 120},
]
