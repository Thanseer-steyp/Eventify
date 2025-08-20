from django.contrib import admin
from .models import Event, Booking, EventGallery, Ticket

class EventGalleryInline(admin.TabularInline):
    model = EventGallery

class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location')
    inlines = [EventGalleryInline]
    
admin.site.register(Event, EventAdmin)
admin.site.register(Booking)
admin.site.register(Ticket)