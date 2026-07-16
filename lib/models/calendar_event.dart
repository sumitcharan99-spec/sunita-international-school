class CalendarEvent {
  final String id;
  final String title;
  final String description;
  final String date;
  final String type; // 'exam' | 'holiday' | 'event'

  CalendarEvent({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.type,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'date': date,
      'type': type,
    };
  }

  factory CalendarEvent.fromMap(Map<String, dynamic> map, String documentId) {
    return CalendarEvent(
      id: documentId,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      date: map['date'] ?? '',
      type: map['type'] ?? 'event',
    );
  }
}
