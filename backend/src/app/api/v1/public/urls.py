from django.urls import path
from .views import EventListView, EventDetailView,EventUpdateView

urlpatterns = [
    path('events/', EventListView.as_view()),
    path('events/<int:pk>/', EventDetailView.as_view()),
    path('events/update/<int:pk>/', EventUpdateView.as_view()),
]
