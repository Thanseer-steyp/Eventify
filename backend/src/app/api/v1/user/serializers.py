from rest_framework import serializers
from api.v1.public.serializers import EventSerializer
from general.models import Event, Booking
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'event_title', 'event_date', 'quantity', 'booked_at']



class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(read_only=True)
    bookings = TicketSerializer(source='tickets', many=True, read_only=True)
    created_events = EventSerializer(source='events', many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id','first_name', 'username', 'email', 'bookings', 'created_events']

