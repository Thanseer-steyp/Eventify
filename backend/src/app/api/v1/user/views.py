from django.conf import settings
from django.core.files.base import ContentFile
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

import qrcode
import io

from general.models import Event, Booking, Ticket
from .serializers import BookingSerializer, UserProfileSerializer
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
        quantity = int(request.data.get("quantity", 1))

        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=404)

        # Check ticket availability
        tickets_sold = Booking.objects.filter(event=event).aggregate(
            total=models.Sum("quantity")
        )["total"] or 0

        if tickets_sold + quantity > event.max_attendees:
            return Response(
                {"error": f"Only {event.max_attendees - tickets_sold} tickets are available"},
                status=400
            )

        # Create booking
        booking = Booking.objects.create(user=request.user, event=event, quantity=quantity)

        # Generate QR code URL
        FRONTEND_BASE_URL = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")
        booking_url = f"{FRONTEND_BASE_URL}/booking/{booking.custom_id}"

        qr_img = qrcode.make(booking_url)
        buffer = io.BytesIO()
        qr_img.save(buffer, format="PNG")
        file_name = f"booking_{booking.id}_qr.png"
        booking.qr_code.save(file_name, ContentFile(buffer.getvalue()), save=True)

        # Create tickets
        last_ticket_number = Ticket.objects.filter(event=event).aggregate(
            models.Max("ticket_number")
        )["ticket_number__max"] or 0

        for i in range(1, quantity + 1):
            Ticket.objects.create(
                booking=booking,
                event=event,
                ticket_number=last_ticket_number + i
            )

        serializer = BookingSerializer(booking, context={'request': request})
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
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        booking.delete()
        return Response({"message": "Booking cancelled successfully"}, status=status.HTTP_200_OK)


class EditEventView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, custom_id):
        try:
            booking_id = int(custom_id[3:])
            booking = Booking.objects.prefetch_related('tickets', 'event').get(
                id=booking_id, user=request.user
            )
        except (Booking.DoesNotExist, ValueError):
            return Response({"error": "Booking not found"}, status=404)

        serializer = BookingSerializer(booking, context={'request': request})
        return Response(serializer.data, status=200)
