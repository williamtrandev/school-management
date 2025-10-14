from django.db import models
import uuid


class Classroom(models.Model):
    """Lớp học"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)  # A1, A2, B1, B2
    grade = models.ForeignKey('grade.Grade', on_delete=models.CASCADE, related_name='classrooms')
    homeroom_teacher = models.ForeignKey(
        'user_management.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='homeroom_classrooms',
        limit_choices_to={'role': 'teacher'}
    )
    # Removed is_special field - no longer needed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'classrooms'
        verbose_name = 'Lớp học'
        verbose_name_plural = 'Lớp học'
        unique_together = ['name', 'grade']

    def __str__(self):
        return f"{self.grade.name}{self.name}"

    @property
    def full_name(self):
        return f"{self.grade.name}{self.name}" 