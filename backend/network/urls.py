from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NodeViewSet, LinkViewSet, TopologyViewSet, MetricsViewSet

router = DefaultRouter()
router.register(r'nodes', NodeViewSet)
router.register(r'links', LinkViewSet)
router.register(r'topology', TopologyViewSet, basename='topology')
router.register(r'metrics', MetricsViewSet, basename='metrics')

urlpatterns = [
    path('', include(router.urls)),
]
