import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentNotices extends StatelessWidget {
  const StudentNotices({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final bulletins = service.notices;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: bulletins.length,
      itemBuilder: (context, idx) {
        final notice = bulletins[idx];

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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.accentAmber.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        notice.targetGroup.toUpperCase(),
                        style: const TextStyle(
                          color: AppTheme.primaryNavy,
                          fontSize: 8,
                          fontWeight: FontWeight.black,
                        ),
                      ),
                    ),
                    Text(
                      notice.date,
                      style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  notice.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  notice.content,
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade700, height: 1.4),
                ),
                const Divider(height: 24, color: Colors.black12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.person_pin_circle_rounded, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          notice.authorName,
                          style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.primaryNavy,
                        padding: EdgeInsets.zero,
                      ),
                      icon: const Icon(Icons.share, size: 14),
                      label: const Text('Share Circular', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notice circular shared to device clipboard.')),
                        );
                      },
                    )
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
