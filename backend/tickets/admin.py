from django.contrib import admin
from .models import Customer, Ticket


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email', 'phone')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer',
        'category',
        'priority',
        'sentiment',
        'status',
        'created_at',
    )
    list_filter = ('status', 'priority', 'category', 'sentiment', 'created_at')
    search_fields = ('customer__name', 'customer__email', 'message', 'summary')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
