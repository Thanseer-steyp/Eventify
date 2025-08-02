from rest_framework import serializers
from web.models import Event
from django.db.models import Sum

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
            'guest', 'image', 'created_at', 'organizer',
            'organizer_email', 'total_bookings', 'max_attendees',
            'tickets_sold', 'tickets_left',  
        ]

    def get_organizer(self, obj):
        return obj.user.first_name or obj.user.username

    def get_organizer_email(self, obj):
        return obj.user.email

    def get_tickets_sold(self, obj):
        return obj.ticket_set.aggregate(Sum('quantity'))['quantity__sum'] or 0

    def get_tickets_left(self, obj):
        return obj.max_attendees - self.get_tickets_sold(obj)

    def get_total_bookings(self, obj):
        return obj.ticket_set.count()
