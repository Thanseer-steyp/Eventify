from django.urls import path
from .views import SignupView, LoginView, CreateEventView,EventListView,EventDetailView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path('events/', EventListView.as_view(), name='event-list'),
    path('events/create/', CreateEventView.as_view()), 
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
]