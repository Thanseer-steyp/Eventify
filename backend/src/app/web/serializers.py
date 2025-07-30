from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models import Sum,Count

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
    organizer_email = serializers.SerializerMethodField()
    tickets_left = serializers.SerializerMethodField()
    tickets_sold = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 
            'date', 'time', 'duration', 'location', 'price',
            'special_guest', 'image', 'created_at', 'organizer','organizer_email','total_bookings','max_attendees',
           'tickets_sold', 'tickets_left',  
        ]

    def get_organizer(self, obj):
        name = obj.user.first_name or obj.user.username
        return name.capitalize()
    
    def get_organizer_email(self, obj):
        return obj.user.email

    def get_tickets_sold(self, obj):
        return obj.ticket_set.aggregate(Sum('quantity'))['quantity__sum'] or 0

    def get_tickets_left(self, obj):
        tickets_sold = self.get_tickets_sold(obj)
        return obj.max_attendees - tickets_sold

    def get_total_bookings(self, obj):
        return obj.ticket_set.count()







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
