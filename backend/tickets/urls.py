from django.urls import path
from .views import (
    TicketListCreateView,
    TicketDetailUpdateView,
    TicketAnalyzeView,
    TicketStatsView,
)

app_name = 'tickets'

urlpatterns = [
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/stats/', TicketStatsView.as_view(), name='ticket-stats'),
    path('tickets/<int:pk>/', TicketDetailUpdateView.as_view(), name='ticket-detail-update'),
    path('tickets/<int:pk>/analyze/', TicketAnalyzeView.as_view(), name='ticket-analyze'),
]
