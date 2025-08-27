from django.urls import path
from .views import (
    CreateEventView,
    BookTicketView,
    AllUserDataView,
    UserProfileView,
    CancelBookingView,
    EditEventView,
    BookingDetailView
)

urlpatterns = [
    path('create-event/', CreateEventView.as_view(), name='create-event'),
    path('book-tickets/', BookTicketView.as_view(), name='book-tickets'),
    path('all-user-data/', AllUserDataView.as_view(), name='all-user-data'),
    path('user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('cancel-booking/<int:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),
    path('edit-event/<int:id>/', EditEventView.as_view(), name='edit-event'),
    path('booking/<str:custom_id>/', BookingDetailView.as_view(), name='booking-detail'),
]
