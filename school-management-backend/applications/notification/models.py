from django.db import models
import uuid


class Notification(models.Model):
    """Thông báo"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=[
            ('achievement', 'Thành tích'),
            ('violation', 'Vi phạm'),
            ('weekly_report', 'Báo cáo tuần'),
            ('general', 'Thông báo chung')
        ]
    )
    target_classroom = models.ForeignKey(
        'classroom.Classroom', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='notifications'
    )
    target_user = models.ForeignKey(
        'user_management.User', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        'user_management.User', 
        on_delete=models.CASCADE, 
        related_name='created_notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Thông báo'
        verbose_name_plural = 'Thông báo'
        ordering = ['-created_at']

    def __str__(self):
        return self.title 