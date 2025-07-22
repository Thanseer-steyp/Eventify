from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Event
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
    organizer = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'max_attendees',
            'date', 'time', 'duration', 'location', 'price',
            'special_guest', 'image', 'created_at', 'organizer'
        ]