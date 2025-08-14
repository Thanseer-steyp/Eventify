from django.urls import path
from .views import CreateEventView, BookTicketView, AllUserDataView, UserProfileView


urlpatterns = [
    path('events/create/', CreateEventView.as_view()),
    path('tickets/book/', BookTicketView.as_view()),
    path('all-user-data/', AllUserDataView.as_view()),
    path('user-profile/', UserProfileView.as_view()),
]
