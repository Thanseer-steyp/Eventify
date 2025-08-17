from django.urls import path
from .views import CreateEventView, BookTicketView, AllUserDataView, UserProfileView,CancelBookingView,EditEventView


urlpatterns = [
    path('events/create/', CreateEventView.as_view()),
    path('tickets/book/', BookTicketView.as_view()),
    path('all-user-data/', AllUserDataView.as_view()),
    path('user-profile/', UserProfileView.as_view()),
    path('booking/cancel/<int:booking_id>/', CancelBookingView.as_view()),
    path('events/edit/<int:id>/', EditEventView.as_view()),
]
