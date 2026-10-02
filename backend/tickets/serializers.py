from rest_framework import serializers
from .models import Customer, Ticket


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Customer name is required.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Customer email is required.")
        return value.strip().lower()


class TicketSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'customer',
            'message',
            'category',
            'priority',
            'sentiment',
            'summary',
            'recommended_action',
            'ai_reply',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TicketCreateSerializer(serializers.Serializer):
    customer = CustomerSerializer()
    message = serializers.CharField(
        min_length=5,
        error_messages={
            'blank': "Support message is required.",
            'min_length': "Support message must be at least 5 characters long."
        }
    )

    def create(self, validated_data):
        customer_data = validated_data.pop('customer')
        email = customer_data['email'].strip().lower()
        name = customer_data['name'].strip()
        phone = customer_data.get('phone', '').strip()

        # Find or create customer by email
        customer, created = Customer.objects.get_or_create(
            email=email,
            defaults={'name': name, 'phone': phone}
        )
        if not created and (name or phone):
            # Update customer details if provided
            updated = False
            if name and customer.name != name:
                customer.name = name
                updated = True
            if phone and customer.phone != phone:
                customer.phone = phone
                updated = True
            if updated:
                customer.save()

        # Create the ticket
        ticket = Ticket.objects.create(
            customer=customer,
            message=validated_data['message'].strip(),
            status=Ticket.STATUS_PENDING
        )
        return ticket


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'status',
            'ai_reply',
            'priority',
            'category',
            'sentiment',
            'summary',
            'recommended_action',
        ]
        extra_kwargs = {
            'status': {'required': False},
            'ai_reply': {'required': False},
            'priority': {'required': False},
            'category': {'required': False},
            'sentiment': {'required': False},
            'summary': {'required': False},
            'recommended_action': {'required': False},
        }

    def validate_status(self, value):
        allowed = [s[0] for s in Ticket.STATUS_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid status '{value}'. Allowed: {allowed}")
        return value

    def validate_priority(self, value):
        allowed = [p[0] for p in Ticket.PRIORITY_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid priority '{value}'. Allowed: {allowed}")
        return value

    def validate_category(self, value):
        allowed = [c[0] for c in Ticket.CATEGORY_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid category '{value}'. Allowed: {allowed}")
        return value

    def validate_sentiment(self, value):
        allowed = [s[0] for s in Ticket.SENTIMENT_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid sentiment '{value}'. Allowed: {allowed}")
        return value
