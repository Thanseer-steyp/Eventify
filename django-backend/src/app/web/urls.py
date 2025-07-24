from django.urls import path
from .views import SignupView, LoginView, CreateEventView,EventListView,EventDetailView,BookTicketView, UserTicketsView
from .views import AllUserBookingsView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path('events/', EventListView.as_view(), name='event-list'),
    path('events/create/', CreateEventView.as_view()), 
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('tickets/book/', BookTicketView.as_view(), name='book-ticket'),
    path('tickets/', UserTicketsView.as_view(), name='user-tickets'),
    path('user-bookings/', AllUserBookingsView.as_view(), name='user-bookings'),
]