import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentNotices extends StatefulWidget {
  const ParentNotices({super.key});

  @override
  State<ParentNotices> createState() => _ParentNoticesState();
}

class _ParentNoticesState extends State<ParentNotices> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    // Filter notices matching "all" or "parents"
    final rawNotices = service.notices.where((n) {
      final grp = n.targetGroup.toLowerCase();
      return grp == 'all' || grp == 'parents';
    }).toList();

    final filteredNotices = rawNotices.where((n) {
      return n.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          n.content.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Bar
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search notices & circulars...',
              prefixIcon: const Icon(Icons.search_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: Colors.white,
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'School Bulletins & Circulars',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                '${filteredNotices.length} Board Notices',
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey.shade500),
              )
            ],
          ),
          const SizedBox(height: 12),

          filteredNotices.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text('No active notices match your query.', style: TextStyle(color: Colors.grey.shade500)),
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredNotices.length,
                  itemBuilder: (context, idx) {
                    final notice = filteredNotices[idx];
                    final isUrgent = notice.isUrgent;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: isUrgent ? Colors.red.withOpacity(0.3) : Colors.grey.shade100,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    if (isUrgent)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        margin: const EdgeInsets.only(right: 8),
                                        decoration: BoxDecoration(
                                          color: Colors.red,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'URGENT',
                                          style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.white),
                                        ),
                                      ),
                                    Text(
                                      notice.date,
                                      style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                Text(
                                  'By: ${notice.authorName}',
                                  style: TextStyle(fontSize: 8, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
                                )
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              notice.title,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              notice.content,
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey.shade700,
                                height: 1.4,
                              ),
                            ),
                          ],
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
