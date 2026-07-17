from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet,
    FoodScanViewSet,
    get_ai_recommendation,
    upload_image,
    analyze_food,
    signup,
    get_health_insights,
    send_reminder,
)

router = DefaultRouter()
router.register(r'users', UserProfileViewSet)
router.register(r'food-scans', FoodScanViewSet)

urlpatterns = router.urls + [
    path("signup/", signup),
    path("ai-recommendation/", get_ai_recommendation),
    path("upload-image/", upload_image),
    path("analyze-food/", analyze_food),
    path("health-insights/", get_health_insights),
    path("send-reminder/", send_reminder),
]
