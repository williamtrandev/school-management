from django.db import models
import uuid


class PointRule(models.Model):
    """Quy tắc tính điểm"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.ForeignKey('event.EventType', on_delete=models.CASCADE, related_name='point_rules')
    condition = models.CharField(max_length=100)  # Điều kiện (VD: "Tốt", "Khá", "Đi trễ")
    points = models.IntegerField()  # Điểm tương ứng
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'point_rules'
        verbose_name = 'Quy tắc điểm'
        verbose_name_plural = 'Quy tắc điểm'
        unique_together = ['event_type', 'condition']

    def __str__(self):
        return f"{self.event_type.name} - {self.condition}: {self.points} điểm" 