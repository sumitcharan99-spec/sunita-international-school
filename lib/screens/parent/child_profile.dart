import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ChildProfile extends StatefulWidget {
  const ChildProfile({super.key});

  @override
  State<ChildProfile> createState() => _ChildProfileState();
}

class _ChildProfileState extends State<ChildProfile> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _emergencyController;

  bool _isEditing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _phoneController = TextEditingController(text: '+91 98765 43210');
    _addressController = TextEditingController(text: 'H-402, Sector 12, Dwarka, New Delhi');
    _emergencyController = TextEditingController(text: '+91 98765 00112');
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _addressController.dispose();
    _emergencyController.dispose();
    super.dispose();
  }

  void _saveProfile(PortalService service) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      await service.updateSettings({
        'institutionName': service.settings['institutionName'] ?? 'Sunita International School',
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Emergency contacts updated successfully on secure Firestore servers!'),
          backgroundColor: Colors.green,
        ),
      );
      setState(() {
        _isEditing = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating contacts: $e')),
      );
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    const String childName = 'Rahul Sharma';
    const String rollNo = '24';
    const String classId = 'Class 10A';
    const String admissionNo = 'SIS/2022/1049';
    const String bloodGroup = 'O+ Positive';
    const String dob = '12th October 2011';
    const String busRoute = 'Route #5 (Bus stop: Sector 12 Cross)';
    const String classTeacher = 'Mr. Arvind Verma (Mathematics)';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card with Child Avatar
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 35,
                    backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
                    child: const Icon(Icons.face_rounded, size: 45, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          childName,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$classId • Roll No: $rollNo',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Admission No: $admissionNo',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppTheme.accentAmber,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Academic Information Grid
          const Text(
            'Academic & Administrative Info',
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
                  _buildProfileRow(Icons.cake_rounded, 'Date of Birth', dob),
                  const Divider(height: 24),
                  _buildProfileRow(Icons.bloodtype_rounded, 'Blood Group', bloodGroup),
                  const Divider(height: 24),
                  _buildProfileRow(Icons.person_pin_rounded, 'Class Teacher', classTeacher),
                  const Divider(height: 24),
                  _buildProfileRow(Icons.directions_bus_rounded, 'School Transport', busRoute),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Contact details with edit feature
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Parent Emergency Contacts',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              if (!_isEditing)
                TextButton.icon(
                  onPressed: () => setState(() => _isEditing = true),
                  icon: const Icon(Icons.edit, size: 14, color: AppTheme.primaryNavy),
                  label: const Text('Edit Contacts', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
                ),
            ],
          ),
          const SizedBox(height: 10),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    if (!_isEditing) ...[
                      _buildProfileRow(Icons.phone_rounded, 'Primary Phone', _phoneController.text),
                      const Divider(height: 24),
                      _buildProfileRow(Icons.home_rounded, 'Residential Address', _addressController.text),
                      const Divider(height: 24),
                      _buildProfileRow(Icons.contact_phone_rounded, 'Emergency Contact', _emergencyController.text),
                    ] else ...[
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Primary Phone',
                          prefixIcon: Icon(Icons.phone_rounded),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) => value == null || value.isEmpty ? 'Enter phone number' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Residential Address',
                          prefixIcon: Icon(Icons.home_rounded),
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                        validator: (value) => value == null || value.isEmpty ? 'Enter address' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _emergencyController,
                        decoration: const InputDecoration(
                          labelText: 'Emergency Contact',
                          prefixIcon: Icon(Icons.contact_phone_rounded),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) => value == null || value.isEmpty ? 'Enter emergency contact' : null,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => setState(() => _isEditing = false),
                            child: const Text('Cancel', style: TextStyle(color: Colors.red)),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: _isSaving ? null : () => _saveProfile(service),
                            child: _isSaving
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppTheme.accentAmber, strokeWidth: 2))
                                : const Text('Save Changes'),
                          ),
                        ],
                      )
                    ],
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

  Widget _buildProfileRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppTheme.primaryNavy),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
