from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class EventType(models.Model):
    """Loại sự kiện thi đua"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)  # Học tập, Chuyên cần, Nề nếp, Vệ sinh
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'event_types'
        verbose_name = 'Loại sự kiện'
        verbose_name_plural = 'Loại sự kiện'

    def __str__(self):
        return self.name


class Event(models.Model):
    """Sự kiện thi đua"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE, related_name='events')
    classroom = models.ForeignKey('classroom.Classroom', on_delete=models.CASCADE, related_name='events')
    student = models.ForeignKey(
        'student.Student', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='events'
    )  # Null nếu là sự kiện của cả lớp
    date = models.DateField()
    period = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True, 
        blank=True
    )  # Tiết học (1-10)
    points = models.IntegerField()  # Điểm cộng/trừ
    description = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        'user_management.User', 
        on_delete=models.CASCADE, 
        related_name='recorded_events',
        limit_choices_to={'role__in': ['admin', 'teacher']}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        verbose_name = 'Sự kiện thi đua'
        verbose_name_plural = 'Sự kiện thi đua'
        ordering = ['-date', '-created_at']

    def __str__(self):
        target = self.student.user.get_full_name() if self.student else self.classroom.full_name
        return f"{self.event_type.name} - {target} - {self.date}" 