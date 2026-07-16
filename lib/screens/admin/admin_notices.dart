import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminNotices extends StatefulWidget {
  const AdminNotices({super.key});

  @override
  State<AdminNotices> createState() => _AdminNoticesState();
}

class _AdminNoticesState extends State<AdminNotices> {
  final _noticeTitleCtrl = TextEditingController();
  final _noticeContentCtrl = TextEditingController();
  String _noticeTarget = 'All';

  @override
  void dispose() {
    _noticeTitleCtrl.dispose();
    _noticeContentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Central School Board Broadcasts',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 12),

          Card(
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Post New Circular/Announcement',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _noticeTitleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Circular Title',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _noticeContentCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Circular Description / Details',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: _noticeTarget,
                    decoration: const InputDecoration(
                      labelText: 'Target Group Audience',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'All',
                        child: Text('All (Parents & Teachers)'),
                      ),
                      DropdownMenuItem(
                        value: 'Parents',
                        child: Text('Parents Only'),
                      ),
                      DropdownMenuItem(
                        value: 'Teachers',
                        child: Text('Teachers Only'),
                      ),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _noticeTarget = val);
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: AppTheme.accentAmber,
                      minimumSize: const Size.fromHeight(48),
                    ),
                    icon: const Icon(Icons.publish_rounded),
                    label: const Text(
                      'Publish Broadcast Notification',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      if (_noticeTitleCtrl.text.isEmpty || _noticeContentCtrl.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please satisfy title and content')),
                        );
                        return;
                      }
                      service.addNotice(
                        _noticeTitleCtrl.text,
                        _noticeContentCtrl.text,
                        _noticeTarget,
                        'Administration Office',
                      );
                      _noticeTitleCtrl.clear();
                      _noticeContentCtrl.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Successfully broadcasted to Notice Boards!'),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Currently Dispatched Broadcasts',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 8),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: service.notices.length,
            itemBuilder: (context, idx) {
              final n = service.notices[idx];
              return Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              n.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.accentAmber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              n.targetGroup,
                              style: const TextStyle(
                                fontSize: 9,
                                color: AppTheme.primaryNavy,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        n.content,
                        style: const TextStyle(fontSize: 11, color: Colors.black54),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'By: ${n.authorName}',
                            style: const TextStyle(
                              fontSize: 9,
                              color: Colors.grey,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            n.date,
                            style: const TextStyle(fontSize: 9, color: Colors.grey),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }
}
