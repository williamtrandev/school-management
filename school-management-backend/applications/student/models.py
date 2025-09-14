from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from applications.user_management.models import User
from applications.classroom.models import Classroom


class Student(models.Model):
    """Học sinh"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_code = models.CharField(max_length=20, unique=True)  # Mã học sinh
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='students')
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Nam'), ('female', 'Nữ')])
    address = models.TextField(blank=True, null=True)
    parent_phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.user.full_name} - {self.student_code}"

    @property
    def full_name(self):
        return self.user.full_name

    @property
    def email(self):
        return self.user.email

class BehaviorRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Đã từ chối'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='behavior_records')
    violation_type = models.CharField(max_length=100)
    description = models.TextField()
    points_deducted = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_violations')
    rejection_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'behavior_records'
        verbose_name = 'Behavior Record'
        verbose_name_plural = 'Behavior Records'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.violation_type} ({self.get_status_display()})"

    @property
    def classroom(self):
        return self.student.classroom

    @property
    def homeroom_teacher(self):
        return self.student.classroom.homeroom_teacher 