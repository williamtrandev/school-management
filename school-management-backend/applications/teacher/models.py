from django.db import models
import uuid


class Teacher(models.Model):
    """Giáo viên"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('user_management.User', on_delete=models.CASCADE, related_name='teacher_profile')
    teacher_code = models.CharField(max_length=20, unique=True)  # Mã giáo viên
    subject = models.CharField(max_length=100, blank=True)  # Môn dạy
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teachers'
        verbose_name = 'Giáo viên'
        verbose_name_plural = 'Giáo viên'

    def __str__(self):
        return f"{self.teacher_code} - {self.user.get_full_name()}" 