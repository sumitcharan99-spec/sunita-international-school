import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class StudentDownloads extends StatefulWidget {
  const StudentDownloads({super.key});

  @override
  State<StudentDownloads> createState() => _StudentDownloadsState();
}

class _StudentDownloadsState extends State<StudentDownloads> {
  final List<Map<String, String>> _downloadableFiles = [
    {'title': 'Annual School Calendar 2026-2027', 'format': 'PDF', 'size': '2.4 MB', 'category': 'Calendar'},
    {'title': 'Grade 10A Syllabus & Curriculum Book', 'format': 'PDF', 'size': '5.1 MB', 'category': 'Syllabus'},
    {'title': 'Sunita School Uniform Policy Handbook', 'format': 'PDF', 'size': '1.8 MB', 'category': 'Handbook'},
    {'title': 'PTM General Circular & Meeting Formats', 'format': 'DOCX', 'size': '450 KB', 'category': 'Circular'},
    {'title': 'Monsoon Swimming Camp Enrollment Form', 'format': 'PDF', 'size': '1.1 MB', 'category': 'Form'},
  ];

  String? _downloadingFileId;
  double _downloadProgress = 0.0;

  void _triggerDownload(String fileTitle) {
    setState(() {
      _downloadingFileId = fileTitle;
      _downloadProgress = 0.0;
    });

    // Animate a smooth download progress
    Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 150));
      if (!mounted || _downloadingFileId != fileTitle) return false;
      setState(() {
        _downloadProgress += 0.2;
      });
      if (_downloadProgress >= 1.0) {
        setState(() {
          _downloadingFileId = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🎉 File "$fileTitle" downloaded successfully to your device downloads folder!'),
            backgroundColor: Colors.green,
          ),
        );
        return false;
      }
      return true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Academic Download Center',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const Text(
            'Official reference syllabi, policy booklets, and camp formats',
            style: TextStyle(fontSize: 10, color: Colors.grey),
          ),
          const SizedBox(height: 16),

          ..._downloadableFiles.map((file) {
            final String title = file['title']!;
            final String format = file['format']!;
            final String size = file['size']!;
            final String cat = file['category']!;
            final bool isThisDownloading = _downloadingFileId == title;

            return Card(
              color: Colors.white,
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade100, width: 1.5),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Format icon avatar
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: format == 'PDF' ? Colors.red.shade50 : Colors.blue.shade50,
                          child: Icon(
                            format == 'PDF' ? Icons.picture_as_pdf_rounded : Icons.description_rounded,
                            color: format == 'PDF' ? Colors.red : Colors.blue,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: AppTheme.primaryNavy,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryNavy.withOpacity(0.06),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      cat,
                                      style: const TextStyle(
                                        color: AppTheme.primaryNavy,
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Size: $size • Format: $format',
                                    style: TextStyle(fontSize: 9, color: Colors.grey.shade600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (!isThisDownloading)
                          IconButton(
                            icon: const Icon(Icons.file_download_rounded, color: AppTheme.primaryNavy),
                            onPressed: () => _triggerDownload(title),
                          ),
                      ],
                    ),
                    if (isThisDownloading) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _downloadProgress,
                                backgroundColor: Colors.grey.shade100,
                                color: AppTheme.accentAmber,
                                minHeight: 6,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            '${(_downloadProgress * 100).toInt()}%',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
