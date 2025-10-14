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


# Add these indexes to Event model
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


class StudentEventPermission(models.Model):
    """Quyền cho phép học sinh được tạo sự kiện trong khoảng thời gian nhất định"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('student.Student', on_delete=models.CASCADE, related_name='event_permissions')
    classroom = models.ForeignKey('classroom.Classroom', on_delete=models.CASCADE, related_name='student_event_permissions')
    granted_by = models.ForeignKey('user_management.User', on_delete=models.CASCADE, related_name='granted_student_event_permissions')
    is_active = models.BooleanField(default=True)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_event_permissions'
        verbose_name = 'Quyền sự kiện học sinh'
        verbose_name_plural = 'Quyền sự kiện học sinh'
        ordering = ['-granted_at']

    def __str__(self):
        try:
            student_name = self.student.user.get_full_name()
        except Exception:
            student_name = str(self.student_id)
        return f"Permission for {student_name} in {getattr(self.classroom, 'full_name', self.classroom_id)}"

    @property
    def is_expired(self) -> bool:
        from django.utils import timezone
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at

    @property
    def is_valid(self) -> bool:
        return self.is_active and not self.is_expired
