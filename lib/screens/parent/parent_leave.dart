import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentLeave extends StatefulWidget {
  const ParentLeave({super.key});

  @override
  State<ParentLeave> createState() => _ParentLeaveState();
}

class _ParentLeaveState extends State<ParentLeave> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  final _startController = TextEditingController(text: '2026-07-20');
  final _endController = TextEditingController(text: '2026-07-22');

  bool _isSubmitting = false;

  @override
  void dispose() {
    _reasonController.dispose();
    _startController.dispose();
    _endController.dispose();
    super.dispose();
  }

  void _submitLeave(PortalService service) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await service.submitLeaveApplication(
        'std_1',
        'Rahul Sharma',
        'Class 10A',
        _startController.text,
        _endController.text,
        _reasonController.text,
      );

      _reasonController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Leave request lodged successfully with Class Teacher!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submission failed: $e')),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final history = service.leaveApplications;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Apply Form Card
          const Text(
            'Lodge New Leave Request',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 10),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _startController,
                            decoration: const InputDecoration(
                              labelText: 'Start Date (YYYY-MM-DD)',
                              prefixIcon: Icon(Icons.date_range_rounded),
                              border: OutlineInputBorder(),
                            ),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _endController,
                            decoration: const InputDecoration(
                              labelText: 'End Date (YYYY-MM-DD)',
                              prefixIcon: Icon(Icons.date_range_rounded),
                              border: OutlineInputBorder(),
                            ),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _reasonController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Detailed Reason for Leave',
                        alignLabelWithHint: true,
                        prefixIcon: Icon(Icons.description_rounded),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Please describe the reason for leave' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : () => _submitLeave(service),
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: _isSubmitting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppTheme.accentAmber, strokeWidth: 2))
                            : const Text('Submit Application'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // History Section
          const Text(
            'Leave History & Approval Status',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 10),

          history.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text('No previous leave history logs found.', style: TextStyle(color: Colors.grey.shade500)),
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: history.length,
                  itemBuilder: (context, idx) {
                    final leave = history[idx];
                    final start = leave['startDate'] ?? '';
                    final end = leave['endDate'] ?? '';
                    final reason = leave['reason'] ?? '';
                    final status = leave['status'] ?? 'Pending';
                    final dateApplied = leave['dateApplied'] ?? '';

                    Color statusColor = Colors.orange;
                    if (status == 'Approved') statusColor = Colors.green;
                    if (status == 'Rejected') statusColor = Colors.red;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Duration: $start to $end',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryNavy,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    status.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 8,
                                      fontWeight: FontWeight.bold,
                                      color: statusColor,
                                    ),
                                  ),
                                )
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              reason,
                              style: TextStyle(fontSize: 10, color: Colors.grey.shade700, height: 1.4),
                            ),
                            const Divider(height: 20),
                            Text(
                              'Lodged on: $dateApplied',
                              style: TextStyle(fontSize: 8, color: Colors.grey.shade400, fontWeight: FontWeight.bold),
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
