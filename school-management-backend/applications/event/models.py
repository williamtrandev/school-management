# Add these indexes to Event model
class Event(models.Model):
    # ... existing fields ...
    
    class Meta:
        indexes = [
            models.Index(fields=['date', 'classroom_id']),
            models.Index(fields=['student_id', 'date']),
            models.Index(fields=['points', 'date']),
            models.Index(fields=['period', 'date']),
            models.Index(fields=['status', 'date']),
            # Composite indexes for common queries
            models.Index(fields=['classroom_id', 'date', 'status']),
            models.Index(fields=['student_id', 'date', 'points']),
        ]