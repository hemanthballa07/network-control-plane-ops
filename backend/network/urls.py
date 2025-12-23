from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NodeViewSet, LinkViewSet, TopologyViewSet

router = DefaultRouter()
router.register(r'nodes', NodeViewSet)
router.register(r'links', LinkViewSet)
router.register(r'topology', TopologyViewSet, basename='topology')

urlpatterns = [
    path('', include(router.urls)),
]
