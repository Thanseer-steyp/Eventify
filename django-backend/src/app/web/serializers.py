from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Event, Ticket


User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()




class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'max_attendees',
            'date', 'time', 'duration', 'location', 'price',
            'special_guest', 'image', 'created_at', 'organizer'
        ]

    def get_organizer(self, obj):
        name = obj.user.first_name or obj.user.username
        return name.capitalize()




class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'event_title', 'event_date', 'quantity', 'booked_at']



class UserTicketsWrapperSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    bookings = TicketSerializer(many=True)









class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Ticket
        fields = ['event_title', 'quantity', 'created_at']

class UserBookingSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'tickets']
