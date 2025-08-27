from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.generics import RetrieveAPIView

from general.models import Event
from .serializers import EventSerializer


class EventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        events = Event.objects.all()

        if query:
            events = events.filter(
                Q(title__icontains=query) |
                Q(category__icontains=query) |
                Q(location__icontains=query) |
                Q(date__icontains=query)
            )

        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


class EventDetailView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
