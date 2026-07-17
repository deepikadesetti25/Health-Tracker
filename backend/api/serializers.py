from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"

from .models import FoodImage, FoodScan
from rest_framework import serializers

class FoodImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodImage
        fields = "__all__"

class FoodScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodScan
        fields = "__all__"