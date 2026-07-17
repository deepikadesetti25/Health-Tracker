from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    DISEASE_CHOICES = [
        ('diabetes', 'Diabetes'),
        ('hypertension', 'Hypertension'),
        ('obesity', 'Obesity'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    disease_type = models.CharField(
        max_length=20,
        choices=DISEASE_CHOICES
    )

    def __str__(self):
        return self.name


class FoodScan(models.Model):
    username = models.CharField(max_length=150, blank=True)
    image = models.ImageField(upload_to="food_images/", blank=True, null=True)
    food_name = models.CharField(max_length=200, blank=True)
    calories = models.IntegerField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    portion = models.CharField(max_length=100, blank=True, null=True)
    fiber = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    sodium = models.FloatField(default=0)
    vitamins = models.TextField(blank=True, null=True)
    minerals = models.TextField(blank=True, null=True)
    recommendation = models.TextField(blank=True, null=True)
    health_score = models.CharField(max_length=20, default="0")
    risk_level = models.CharField(max_length=20, default="🟢")
    better_healthy_alternative = models.TextField(blank=True, null=True)
    daily_intake_percentage = models.CharField(max_length=20, default="0%")
    confidence_score = models.CharField(max_length=20, default="0%")
    ingredients_summary = models.TextField(blank=True, null=True)
    usefulness_summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.food_name}"


from django.db import models

class FoodImage(models.Model):
    image = models.ImageField(upload_to="food_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name