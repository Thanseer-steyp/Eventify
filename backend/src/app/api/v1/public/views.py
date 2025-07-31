from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from web.models import Event
from .serializers import EventSerializer
from rest_framework.generics import RetrieveAPIView

class EventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

class EventDetailView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
