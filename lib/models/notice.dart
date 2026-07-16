class Notice {
  final String id;
  final String title;
  final String content;
  final String date;
  final String targetGroup;
  final String authorName;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    required this.date,
    required this.targetGroup,
    required this.authorName,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'date': date,
      'targetGroup': targetGroup,
      'authorName': authorName,
    };
  }

  factory Notice.fromMap(Map<String, dynamic> map, String documentId) {
    return Notice(
      id: documentId,
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      date: map['date'] ?? '',
      targetGroup: map['targetGroup'] ?? 'All',
      authorName: map['authorName'] ?? '',
    );
  }
}
