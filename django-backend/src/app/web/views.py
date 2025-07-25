from django.contrib.auth import authenticate
from django.contrib.auth.models import User


from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework import status

from .serializers import SignupSerializer, LoginSerializer, EventSerializer, TicketSerializer
from .serializers import UserBookingSerializer,UserTicketsWrapperSerializer
from .models import Event,Ticket


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Response({
                "msg": "User created successfully",
                "first_name": user.first_name,
                "access": access_token,
                "refresh": refresh_token
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                })
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateEventView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request, format=None):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    

class EventDetailView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer







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
        user = request.user
        tickets = Ticket.objects.filter(user=user).order_by("-booked_at")
        serializer = TicketSerializer(tickets, many=True)

        # Wrap the result
        wrapper_data = {
            "first_name": user.first_name,
            "bookings": serializer.data
        }

        wrapper_serializer = UserTicketsWrapperSerializer(wrapper_data)
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
        user = request.user
        tickets = Ticket.objects.filter(user=user).order_by("-booked_at")

        serializer = UserTicketsWrapperSerializer({
            "first_name": user.first_name,
            "bookings": tickets
        })

        return Response(serializer.data)