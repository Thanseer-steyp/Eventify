from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from web.models import Event, Ticket
from .serializers import TicketSerializer, UserProfileSerializer
from api.v1.public.serializers import EventSerializer

class CreateEventView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        event_id = request.data.get("event")
        quantity = request.data.get("quantity")
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)

        ticket = Ticket.objects.create(user=request.user, event=event, quantity=quantity)
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=201)


class AllUserDataView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.prefetch_related('tickets__event').all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user).order_by("-booked_at")
        events = Event.objects.filter(user=request.user).order_by("-created_at")
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)