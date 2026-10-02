from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
import logging

from .models import Ticket, Customer
from .serializers import (
    CustomerSerializer,
    TicketSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer
)
from ai_service.service import analyze_ticket_message
from ai_service.exceptions import (
    AIServiceError,
    AITimeoutError,
    AIValidationError,
    AIAPIError
)

logger = logging.getLogger(__name__)


class TicketListCreateView(APIView):
    """
    GET  /api/tickets/       - List all tickets with search and filtering
    POST /api/tickets/       - Create a new ticket (with customer auto-linking)
    """

    def get(self, request):
        queryset = Ticket.objects.select_related('customer').all()

        # Query filters
        search = request.query_params.get('search', '').strip()
        status_param = request.query_params.get('status', '').strip()
        priority_param = request.query_params.get('priority', '').strip()
        category_param = request.query_params.get('category', '').strip()

        if search:
            queryset = queryset.filter(
                Q(customer__name__icontains=search) |
                Q(customer__email__icontains=search) |
                Q(customer__phone__icontains=search) |
                Q(message__icontains=search) |
                Q(summary__icontains=search)
            )

        if status_param:
            queryset = queryset.filter(status=status_param)

        if priority_param:
            queryset = queryset.filter(priority=priority_param)

        if category_param:
            queryset = queryset.filter(category=category_param)

        serializer = TicketSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket = serializer.save()
        return Response(
            {
                "message": "Ticket created successfully",
                "ticket_id": ticket.id,
                "ticket": TicketSerializer(ticket).data
            },
            status=status.HTTP_201_CREATED
        )


class TicketDetailUpdateView(APIView):
    """
    GET   /api/tickets/{id}/ - Retrieve detailed ticket
    PATCH /api/tickets/{id}/ - Update status or edit response
    """

    def get_object(self, pk):
        return get_object_or_404(Ticket.objects.select_related('customer'), pk=pk)

    def get(self, request, pk):
        ticket = self.get_object(pk)
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        ticket = self.get_object(pk)
        serializer = TicketUpdateSerializer(ticket, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket = serializer.save()
        return Response(
            {
                "message": "Ticket updated successfully",
                "ticket": TicketSerializer(ticket).data
            },
            status=status.HTTP_200_OK
        )


class TicketAnalyzeView(APIView):
    """
    POST /api/tickets/{id}/analyze/ - Analyze customer message with AI
    """

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket.objects.select_related('customer'), pk=pk)

        try:
            ai_result = analyze_ticket_message(ticket.message)
        except AITimeoutError as err:
            logger.error("AI service timed out for ticket %s: %s", pk, err)
            return Response(
                {"error": "AI service request timed out. Please retry."},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except AIValidationError as err:
            logger.error("AI validation failed for ticket %s: %s", pk, err)
            return Response(
                {"error": f"AI returned an invalid response: {str(err)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except (AIAPIError, AIServiceError) as err:
            logger.error("AI API failure for ticket %s: %s", pk, err)
            return Response(
                {"error": "AI service is currently unavailable. Please retry."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as err:
            logger.exception("Unexpected error during AI analysis: %s", err)
            return Response(
                {"error": "Failed to analyze ticket with AI."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Update and persist AI analysis in MySQL
        ticket.category = ai_result["category"]
        ticket.priority = ai_result["priority"]
        ticket.sentiment = ai_result["sentiment"]
        ticket.summary = ai_result["summary"]
        ticket.recommended_action = ai_result["recommended_action"]
        ticket.ai_reply = ai_result["suggested_reply"]
        ticket.save()

        return Response(
            {
                "message": "Ticket analyzed successfully",
                "analysis": ai_result,
                "ticket": TicketSerializer(ticket).data
            },
            status=status.HTTP_200_OK
        )


class TicketStatsView(APIView):
    """
    GET /api/tickets/stats/ - Get aggregated dashboard metrics
    """

    def get(self, request):
        total = Ticket.objects.count()
        high_priority = Ticket.objects.filter(
            priority__in=[Ticket.PRIORITY_HIGH, Ticket.PRIORITY_CRITICAL]
        ).count()
        pending = Ticket.objects.filter(status=Ticket.STATUS_PENDING).count()
        resolved = Ticket.objects.filter(status=Ticket.STATUS_RESOLVED).count()
        in_progress = Ticket.objects.filter(status=Ticket.STATUS_IN_PROGRESS).count()

        category_counts = (
            Ticket.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            "total": total,
            "high_priority": high_priority,
            "pending": pending,
            "resolved": resolved,
            "in_progress": in_progress,
            "categories": list(category_counts),
        }, status=status.HTTP_200_OK)
