import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentNotifications extends StatelessWidget {
  const ParentNotifications({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final list = service.parentNotifications;
    final int unreadCount = list.where((n) => !n['isRead']).length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Push Alerts & Broadcast Centre',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                  letterSpacing: 0.5,
                ),
              ),
              if (unreadCount > 0)
                TextButton(
                  onPressed: () {
                    service.markAllNotificationsAsRead();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('All notifications marked as read!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  },
                  child: const Text(
                    'Mark all read',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: list.length,
            itemBuilder: (context, idx) {
              final item = list[idx];
              final id = item['id'] ?? '';
              final title = item['title'] ?? '';
              final body = item['body'] ?? '';
              final time = item['time'] ?? '';
              final bool isRead = item['isRead'] ?? false;

              return Card(
                color: isRead ? Colors.white : const Color(0xFFF0F7FF),
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: isRead ? Colors.grey.shade100 : Colors.blue.withOpacity(0.2),
                    width: 1.5,
                  ),
                ),
                child: InkWell(
                  onTap: () {
                    service.markNotificationAsRead(id);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: isRead ? Colors.grey.shade100 : Colors.blue.withOpacity(0.12),
                          child: Icon(
                            isRead ? Icons.notifications_none_rounded : Icons.notifications_active_rounded,
                            color: isRead ? Colors.grey : Colors.blue.shade700,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      title,
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: isRead ? FontWeight.bold : FontWeight.black,
                                        color: AppTheme.primaryNavy,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    time,
                                    style: TextStyle(fontSize: 8, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                body,
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey.shade700,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
