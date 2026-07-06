from django.db import models

class UserProfile(models.Model):
    DISEASE_CHOICES = [
        ('diabetes', 'Diabetes'),
        ('hypertension', 'Hypertension'),
        ('obesity', 'Obesity'),
    ]

    name = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    disease_type = models.CharField(
        max_length=20,
        choices=DISEASE_CHOICES
    )

    def __str__(self):
        return self.name