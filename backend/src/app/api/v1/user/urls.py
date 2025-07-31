from django.urls import path
from .views import CreateEventView, BookTicketView, UserTicketsView, AllUserDataView, UserTicketsWrapperView

urlpatterns = [
    path('events/create/', CreateEventView.as_view()),
    path('tickets/book/', BookTicketView.as_view()),
    path('tickets/', UserTicketsView.as_view()),
    path('user-bookings/', AllUserDataView.as_view()),
    path('user-profile/', UserTicketsWrapperView.as_view()),
]
