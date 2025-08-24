from django.urls import path
from .views import EventListView, EventDetailView

urlpatterns = [
    path('events/', EventListView.as_view()),
    path('events/<int:pk>/', EventDetailView.as_view()),
]
