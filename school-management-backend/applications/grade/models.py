from django.db import models
import uuid


class Grade(models.Model):
    """Khối lớp"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, unique=True)  # 10, 11, 12
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'
        verbose_name = 'Khối lớp'
        verbose_name_plural = 'Khối lớp'

    def __str__(self):
        return self.name 