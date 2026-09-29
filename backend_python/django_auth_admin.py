"""
ApexMetrics - Django Authentication, RBAC & Administrative Framework
=====================================================================
Role in Architecture:
- Provides bulletproof enterprise authentication, password hashing (Argon2 / PBKDF2),
  and fine-grained Role-Based Access Control (RBAC).
- Administrative portal for managing system users, API tokens, partitioning schedules,
  and reviewing security audit logs.
- ORM models mapped to PostgreSQL partitioned tables with custom Router & Managers.
"""

import os
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# Custom User Manager for Enterprise Authentication
class EnterpriseUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'django_admin')
        return self.create_user(email, username, password, **extra_fields)

# Custom User Model with RBAC Roles
class EnterpriseUser(AbstractUser):
    ROLE_CHOICES = [
        ('django_admin', 'Administrator (Full System & Partition Control)'),
        ('data_engineer', 'Data Engineer (Pipelines, Celery, SQL Query Engine)'),
        ('security_auditor', 'Security Auditor (Compliance & Anomaly Reviews)'),
        ('business_analyst', 'Business Analyst (Read-Only Dashboards & Exports)'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='business_analyst')
    department = models.CharField(max_length=100, default="Engineering Analytics")
    api_token = models.CharField(max_length=64, unique=True, null=True, blank=True)
    mfa_enabled = models.BooleanField(default=True)
    max_query_timeout_sec = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    objects = EnterpriseUserManager()

    def has_partition_permission(self) -> bool:
        """Only django_admin and data_engineer can trigger manual partition rotations."""
        return self.role in ['django_admin', 'data_engineer']

    def can_execute_raw_sql(self) -> bool:
        return self.role in ['django_admin', 'data_engineer']

# Historical Log Model (Partitioned Table Wrapper)
class TelemetryLogPartitioned(models.Model):
    """
    Django ORM representation of the PostgreSQL partitioned table.
    Managed = False because table partitions are managed by native PostgreSQL DDL and pg_partman.
    """
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(db_index=True)
    service_name = models.CharField(max_length=64, db_index=True)
    endpoint = models.CharField(max_length=255)
    latency_ms = models.FloatField()
    status_code = models.IntegerField()
    method = models.CharField(max_length=10)
    client_ip = models.GenericIPAddressField(null=True, blank=True)
    region = models.CharField(max_length=32)
    is_anomaly = models.BooleanField(default=False, db_index=True)
    anomaly_score = models.FloatField(default=0.0)
    payload_bytes = models.IntegerField(default=0)
    user_id = models.CharField(max_length=64, null=True, blank=True)

    class Meta:
        db_table = 'telemetry_event_partitioned'
        managed = False  # Schema handled via schema_optimized.sql
        verbose_name = _('Telemetry Event (Partitioned)')
        verbose_name_plural = _('Telemetry Events (Partitioned)')
        ordering = ['-created_at']

# Security Audit Log Model
class SecurityAuditLog(models.Model):
    user = models.ForeignKey(EnterpriseUser, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255)
    status = models.CharField(max_length=30, default='SUCCESS')
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    class Meta:
        db_table = 'security_audit_log'
        indexes = [
            models.Index(fields=['timestamp', 'user']),
        ]

# Django Admin Customization
class EnterpriseUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'mfa_enabled', 'is_staff', 'last_active')
    list_filter = ('role', 'is_staff', 'mfa_enabled')
    search_fields = ('username', 'email', 'department')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('RBAC & Permissions'), {'fields': ('role', 'department', 'is_staff', 'is_superuser', 'groups')}),
        (_('Security Settings'), {'fields': ('mfa_enabled', 'api_token', 'max_query_timeout_sec')}),
    )

class SecurityAuditAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'status', 'ip_address')
    list_filter = ('status', 'action')
    search_fields = ('user__username', 'ip_address')
    readonly_fields = ('timestamp', 'user', 'action', 'status', 'ip_address', 'details')

# In actual Django setup:
# admin.site.register(EnterpriseUser, EnterpriseUserAdmin)
# admin.site.register(SecurityAuditLog, SecurityAuditAdmin)
