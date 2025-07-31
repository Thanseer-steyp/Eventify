from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.contrib.auth.models import User
from web.models import Event, Ticket
from .serializers import TicketSerializer, UserBookingSerializer, UserTicketsWrapperSerializer
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

class UserTicketsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user).order_by("-booked_at")
        wrapper_serializer = UserTicketsWrapperSerializer({
            "first_name": request.user.first_name,
            "bookings": tickets
        })
        return Response(wrapper_serializer.data)

class AllUserDataView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.prefetch_related('tickets__event').all()
        serializer = UserBookingSerializer(users, many=True)
        return Response(serializer.data)

class UserTicketsWrapperView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user).order_by("-booked_at")
        serializer = UserTicketsWrapperSerializer({
            "first_name": request.user.first_name,
            "bookings": tickets
        })
        return Response(serializer.data)
