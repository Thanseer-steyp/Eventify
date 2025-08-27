from django.contrib import admin
from .models import Event, Booking, EventGallery, Ticket


# Inline for EventGallery inside EventAdmin
class EventGalleryInline(admin.TabularInline):
    model = EventGallery
    extra = 1


# Event admin with gallery inline
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location')
    inlines = [EventGalleryInline]


# Register models
admin.site.register(Event, EventAdmin)
admin.site.register(Booking)
admin.site.register(Ticket)
