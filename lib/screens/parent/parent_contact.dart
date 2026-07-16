import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentContact extends StatefulWidget {
  const ParentContact({super.key});

  @override
  State<ParentContact> createState() => _ParentContactState();
}

class _ParentContactState extends State<ParentContact> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _category = 'Academic Inquiry';

  bool _isSubmitting = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage(PortalService service) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      final parentName = service.currentUserProfile?.name ?? 'Suresh Sharma';
      final email = service.currentUserProfile?.email ?? 'parent@sunita.com';
      
      await service.submitContactMessage(
        parentName,
        email,
        '[$_category] ${_subjectController.text}',
        _messageController.text,
      );

      _subjectController.clear();
      _messageController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Message sent successfully! The administration office will call/email you back shortly.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit message: $e')),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Administration details list card
          const Text(
            'School Administration Desk Info',
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
              child: Column(
                children: [
                  _buildContactInfoRow(Icons.location_on_rounded, 'Physical Address', 'Sector 15, Dwarka, New Delhi - 110075'),
                  const Divider(height: 20),
                  _buildContactInfoRow(Icons.phone_in_talk_rounded, 'Office Helplines', '+91 11 2345 6789, +91 98765 43210'),
                  const Divider(height: 20),
                  _buildContactInfoRow(Icons.alternate_email_rounded, 'Administrative Email', 'info@sunitaschool.edu.in'),
                  const Divider(height: 20),
                  _buildContactInfoRow(Icons.lock_clock_rounded, 'Visiting Hours', '9:00 AM to 1:00 PM (Monday - Friday)'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Send Inquiry Form Card
          const Text(
            'Dispatch Secure Parent Inquiry',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
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
                    DropdownButtonFormField<String>(
                      value: _category,
                      decoration: const InputDecoration(
                        labelText: 'Inquiry Category',
                        prefixIcon: Icon(Icons.category_rounded),
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Academic Inquiry', child: Text('Academic Inquiry')),
                        DropdownMenuItem(value: 'Transport/Bus Inquiry', child: Text('Transport/Bus Inquiry')),
                        DropdownMenuItem(value: 'Fees & Billing Inquiry', child: Text('Fees & Billing Inquiry')),
                        DropdownMenuItem(value: 'Admissions Inquiry', child: Text('Admissions Inquiry')),
                        DropdownMenuItem(value: 'Other general matters', child: Text('Other general matters')),
                      ],
                      onChanged: (v) {
                        if (v != null) setState(() => _category = v);
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _subjectController,
                      decoration: const InputDecoration(
                        labelText: 'Subject Header',
                        prefixIcon: Icon(Icons.subject_rounded),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Please supply a subject' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _messageController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'Detailed Inquiry Details',
                        alignLabelWithHint: true,
                        prefixIcon: Icon(Icons.message_rounded),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'Please type your inquiry' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : () => _sendMessage(service),
                        icon: const Icon(Icons.mark_email_unread_rounded, size: 16),
                        label: _isSubmitting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppTheme.accentAmber, strokeWidth: 2))
                            : const Text('Send Secured Message'),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildContactInfoRow(IconData icon, String title, String val) {
    return Row(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: AppTheme.primaryNavy.withOpacity(0.08),
          child: Icon(icon, size: 16, color: AppTheme.primaryNavy),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey),
              ),
              const SizedBox(height: 2),
              Text(
                val,
                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
              ),
            ],
          ),
        )
      ],
    );
  }
}
