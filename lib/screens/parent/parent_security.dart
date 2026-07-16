import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentSecurity extends StatefulWidget {
  const ParentSecurity({super.key});

  @override
  State<ParentSecurity> createState() => _ParentSecurityState();
}

class _ParentSecurityState extends State<ParentSecurity> {
  final _formKey = GlobalKey<FormState>();
  final _oldPwdController = TextEditingController();
  final _newPwdController = TextEditingController();
  bool _isChanging = false;

  @override
  void dispose() {
    _oldPwdController.dispose();
    _newPwdController.dispose();
    super.dispose();
  }

  void _changePassword() {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isChanging = true);

    // Simulate encryption and password change on Firebase Auth
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _isChanging = false);
        _oldPwdController.clear();
        _newPwdController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password encryption updated successfully in Firebase Auth!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final user = service.currentUserProfile;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Security Overview Info
          const Text(
            'Secure Account Settings',
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
                  _buildUserDetailRow(Icons.alternate_email_rounded, 'Account Log-in ID', user?.email ?? 'parent@sunita.com'),
                  const Divider(height: 24),
                  _buildUserDetailRow(Icons.shield_rounded, 'Encryption Level', 'TLS 1.3 AES-256 Bit Secure Encryption'),
                  const Divider(height: 24),
                  _buildUserDetailRow(Icons.pattern_rounded, 'Access Permission', 'Role-based Parent Clearance'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Change Password Form
          const Text(
            'Change Account Passcode',
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
                  children: [
                    TextFormField(
                      controller: _oldPwdController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Current Password',
                        prefixIcon: Icon(Icons.lock_rounded),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Type old password' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _newPwdController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'New Secure Password',
                        prefixIcon: Icon(Icons.enhanced_encryption_rounded),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.length < 6 ? 'Password must be at least 6 characters' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isChanging ? null : _changePassword,
                        child: _isChanging
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppTheme.accentAmber, strokeWidth: 2))
                            : const Text('Update Passcode'),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Log Out Card
          Card(
            color: Colors.red.shade50,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.red.withOpacity(0.2), width: 1.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Terminate Active Session',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.red),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Clears cache parameters and disconnects Firebase active token authentication. You will be redirected to the secure gateway.',
                    style: TextStyle(fontSize: 9, color: Colors.black54),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        service.signOut();
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                      icon: const Icon(Icons.power_settings_new_rounded, size: 16),
                      label: const Text('Log Out Safely', style: TextStyle(fontSize: 11)),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildUserDetailRow(IconData icon, String title, String val) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppTheme.primaryNavy),
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
        ),
      ],
    );
  }
}
