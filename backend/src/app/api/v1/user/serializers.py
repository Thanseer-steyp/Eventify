from rest_framework import serializers
from web.models import Event, Ticket
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'event_title', 'event_date', 'quantity', 'booked_at']

class UserTicketsWrapperSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    bookings = TicketSerializer(many=True)

class UserBookingSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'tickets']
