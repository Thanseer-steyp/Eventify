from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

class EventGallery(models.Model):
    event = models.ForeignKey(
        'Event', 
        on_delete=models.CASCADE, 
        related_name='gallery_images'
    )
    image = models.ImageField(upload_to='event_gallery/')

    def __str__(self):
        return f"Gallery image for {self.event.title}"

        
class Event(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    max_attendees = models.PositiveIntegerField()
    date = models.DateField()
    time = models.TimeField()
    duration = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    guest = models.CharField(max_length=100, blank=True)
    guest_image = models.ImageField(upload_to='guest_images/', null=True, blank=True)
    image = models.ImageField(upload_to='event_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.date}"







class Booking(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.custom_id} : {self.user.username} booked {self.quantity} tickets on '{self.event.title} - {self.event.date}'"

    @property
    def custom_id(self):
        first_letter = self.event.title[0].upper() if self.event.title else "E"
        return f"BK{first_letter}{self.id}"



class Ticket(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="tickets")
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    ticket_number = models.PositiveIntegerField()

    class Meta:
        unique_together = ('event', 'ticket_number')  

    def __str__(self):
        return f"Ticket #{self.ticket_number} of '{self.event.title}' under Booking ID {self.booking.id}"
