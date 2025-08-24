from rest_framework import serializers
from api.v1.public.serializers import EventSerializer
from general.models import Event, Booking,Ticket
from django.contrib.auth import get_user_model

User = get_user_model()

class SingleTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['ticket_number']


class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    event_time = serializers.TimeField(source='event.time', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    total_payment = serializers.SerializerMethodField()
    tickets_id = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'event_title', 'event_date', 'event_time',
            'event_location', 'quantity', 'booked_at',
            'total_payment', 'tickets_id'
        ]

    def get_total_payment(self, obj):
        return obj.event.price * obj.quantity if obj.event.price else 0

    def get_tickets_id(self, obj):
        # Take first letter of event title for prefix
        event_prefix = obj.event.title[0].upper() if obj.event.title else "E"

        # Create formatted ticket IDs: e.g. #M1, #M2, #M3
        tickets = [f"{event_prefix}{ticket.ticket_number}" for ticket in obj.tickets.all()]
        return ", ".join(tickets)

    def get_id(self, obj):
        # First letter of event title + booking ID
        first_letter = obj.event.title[0].upper() if obj.event.title else "E"
        return f"BK{first_letter}{obj.id}"




class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(read_only=True)
    bookings = BookingSerializer(source='tickets', many=True, read_only=True)
    created_events = EventSerializer(source='events', many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id','first_name', 'username', 'email', 'bookings', 'created_events']

