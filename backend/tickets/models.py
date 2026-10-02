from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=150, help_text="Customer full name")
    email = models.EmailField(db_index=True, help_text="Customer contact email")
    phone = models.CharField(max_length=30, blank=True, default='', help_text="Customer contact phone")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.email})"


class Ticket(models.Model):
    # Status Choices
    STATUS_PENDING = 'Pending'
    STATUS_IN_PROGRESS = 'In Progress'
    STATUS_RESOLVED = 'Resolved'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
    ]

    # Priority Choices
    PRIORITY_LOW = 'Low'
    PRIORITY_MEDIUM = 'Medium'
    PRIORITY_HIGH = 'High'
    PRIORITY_CRITICAL = 'Critical'

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]

    # Category Choices
    CATEGORY_PAYMENT = 'Payment Issue'
    CATEGORY_ORDER = 'Order Issue'
    CATEGORY_ACCOUNT = 'Account Issue'
    CATEGORY_TECHNICAL = 'Technical Issue'
    CATEGORY_DELIVERY = 'Delivery Issue'
    CATEGORY_REFUND = 'Refund Issue'
    CATEGORY_OTHER = 'Other'

    CATEGORY_CHOICES = [
        (CATEGORY_PAYMENT, 'Payment Issue'),
        (CATEGORY_ORDER, 'Order Issue'),
        (CATEGORY_ACCOUNT, 'Account Issue'),
        (CATEGORY_TECHNICAL, 'Technical Issue'),
        (CATEGORY_DELIVERY, 'Delivery Issue'),
        (CATEGORY_REFUND, 'Refund Issue'),
        (CATEGORY_OTHER, 'Other'),
    ]

    # Sentiment Choices
    SENTIMENT_POSITIVE = 'Positive'
    SENTIMENT_NEUTRAL = 'Neutral'
    SENTIMENT_NEGATIVE = 'Negative'

    SENTIMENT_CHOICES = [
        (SENTIMENT_POSITIVE, 'Positive'),
        (SENTIMENT_NEUTRAL, 'Neutral'),
        (SENTIMENT_NEGATIVE, 'Negative'),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='tickets',
        help_text="Customer who submitted the ticket"
    )
    message = models.TextField(help_text="Original customer support message")

    # AI Analysis Fields
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_OTHER,
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_MEDIUM,
        db_index=True
    )
    sentiment = models.CharField(
        max_length=20,
        choices=SENTIMENT_CHOICES,
        default=SENTIMENT_NEUTRAL
    )
    summary = models.TextField(
        blank=True,
        default='',
        help_text="AI-generated summary of the problem"
    )
    recommended_action = models.TextField(
        blank=True,
        default='',
        help_text="AI-recommended resolution step"
    )
    ai_reply = models.TextField(
        blank=True,
        default='',
        help_text="AI-suggested response reviewed/edited by employee"
    )

    # Workflow Status
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Ticket #{self.id} - {self.customer.name} [{self.status}]"
