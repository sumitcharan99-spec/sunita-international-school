import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminSettings extends StatefulWidget {
  const AdminSettings({super.key});

  @override
  State<AdminSettings> createState() => _AdminSettingsState();
}

class _AdminSettingsState extends State<AdminSettings> {
  final _schoolNameCtrl = TextEditingController();
  final _academicYearCtrl = TextEditingController();
  final _gradingScaleCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  bool _isEditing = false;

  @override
  void dispose() {
    _schoolNameCtrl.dispose();
    _academicYearCtrl.dispose();
    _gradingScaleCtrl.dispose();
    _addressCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _loadSettings(PortalService service) {
    _schoolNameCtrl.text = service.settings['institutionName'] ?? 'Sunita International School';
    _academicYearCtrl.text = service.settings['academicYear'] ?? '2026-2027';
    _gradingScaleCtrl.text = service.settings['gradingScale'] ?? 'Percentage / Letter A-F';
    _addressCtrl.text = service.settings['address'] ?? 'Sector 15, Dwarka, New Delhi';
    _emailCtrl.text = service.settings['contactEmail'] ?? 'info@sunita.com';
    _phoneCtrl.text = service.settings['contactPhone'] ?? '+91-11-23456789';
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    if (!_isEditing) {
      _loadSettings(service);
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Institution Configurations',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                    const Text(
                      'Manage institutional metadata, academic years, contact details, and grade thresholds.',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(_isEditing ? Icons.cancel_outlined : Icons.edit_note, color: AppTheme.primaryNavy),
                  onPressed: () {
                    setState(() {
                      if (_isEditing) {
                        _loadSettings(service);
                      }
                      _isEditing = !_isEditing;
                    });
                  },
                )
              ],
            ),
            const SizedBox(height: 16),

            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Scholastic Profile Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _schoolNameCtrl,
                      enabled: _isEditing,
                      decoration: const InputDecoration(
                        labelText: 'Institution Name',
                        prefixIcon: Icon(Icons.school),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _academicYearCtrl,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: 'Academic Term Year',
                              prefixIcon: Icon(Icons.calendar_today),
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _gradingScaleCtrl,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: 'Grading Metric Schema',
                              prefixIcon: Icon(Icons.percent),
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _addressCtrl,
                      enabled: _isEditing,
                      decoration: const InputDecoration(
                        labelText: 'School Campus Address',
                        prefixIcon: Icon(Icons.location_on),
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Institutional Contacts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _emailCtrl,
                      enabled: _isEditing,
                      decoration: const InputDecoration(
                        labelText: 'Official Registrar Email',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phoneCtrl,
                      enabled: _isEditing,
                      decoration: const InputDecoration(
                        labelText: 'School Board Helpline',
                        prefixIcon: Icon(Icons.phone),
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            if (_isEditing) ...[
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: AppTheme.accentAmber,
                  minimumSize: const Size.fromHeight(48),
                ),
                icon: const Icon(Icons.save_rounded),
                label: const Text('SAVE SCHOOL CONFIGURATIONS', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: () async {
                  await service.updateSettings({
                    'institutionName': _schoolNameCtrl.text.trim(),
                    'academicYear': _academicYearCtrl.text.trim(),
                    'gradingScale': _gradingScaleCtrl.text.trim(),
                    'address': _addressCtrl.text.trim(),
                    'contactEmail': _emailCtrl.text.trim(),
                    'contactPhone': _phoneCtrl.text.trim(),
                  });
                  setState(() {
                    _isEditing = false;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Settings saved & synced with Firestore successfully!')),
                  );
                },
              )
            ] else ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blueGrey, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Modifying these parameters updates student transcripts, invoices, and notice banners.',
                        style: TextStyle(fontSize: 9, color: Colors.blueGrey, fontStyle: FontStyle.italic),
                      ),
                    )
                  ],
                ),
              )
            ]
          ],
        ),
      ),
    );
  }
}
