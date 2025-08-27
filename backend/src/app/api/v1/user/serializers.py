from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.v1.public.serializers import EventSerializer
from general.models import Event, Booking, Ticket

User = get_user_model()


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['ticket_number']


class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_image = serializers.SerializerMethodField()
    event_date = serializers.DateField(source='event.date', read_only=True)
    event_time = serializers.TimeField(source='event.time', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    total_payement = serializers.SerializerMethodField()
    tickets_id = serializers.SerializerMethodField()
    booked_by = serializers.CharField(source='user.username', read_only=True)
    qr_code = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'custom_id',
            'booked_by',
            'event_title',
            'event_image',
            'event_date',
            'event_time',
            'event_location',
            'quantity',
            'booked_at',
            'total_payement',
            'tickets_id',
            'qr_code'
        ]

    def get_total_payement(self, obj):
        return obj.event.price * obj.quantity if obj.event.price else 0

    def get_event_image(self, obj):
        request = self.context.get('request')
        if obj.event.image:
            return request.build_absolute_uri(obj.event.image.url) if request else obj.event.image.url
        return None

    def get_tickets_id(self, obj):
        event_prefix = obj.event.title[0].upper() if obj.event.title else "E"
        tickets = [f"{event_prefix}{ticket.ticket_number}" for ticket in obj.tickets.all()]
        return ", ".join(tickets)

    def get_qr_code(self, obj):
        request = self.context.get("request")
        if obj.qr_code:
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(read_only=True)
    bookings = BookingSerializer(source='tickets', many=True, read_only=True)
    created_events = EventSerializer(source='events', many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'username', 'email', 'bookings', 'created_events']
