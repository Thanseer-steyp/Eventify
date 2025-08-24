from django.urls import path
from .views import CreateEventView, BookTicketView, AllUserDataView, UserProfileView,CancelBookingView,EditEventView


urlpatterns = [
    path('create-event/', CreateEventView.as_view()),
    path('book-tickets/', BookTicketView.as_view()),
    path('all-user-data/', AllUserDataView.as_view()),
    path('user-profile/', UserProfileView.as_view()),
    path('cancel-booking/<int:booking_id>/', CancelBookingView.as_view()),
    path('edit-event/<int:id>/', EditEventView.as_view()),
]
