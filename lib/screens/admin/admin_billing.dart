import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/portal_service.dart';
import '../../models/fee_structure.dart';
import '../../models/fee_invoice.dart';
import '../../theme/app_theme.dart';

class AdminBilling extends StatefulWidget {
  const AdminBilling({super.key});

  @override
  State<AdminBilling> createState() => _AdminBillingState();
}

class _AdminBillingState extends State<AdminBilling> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _searchQuery = '';
  String _selectedClassFilter = 'All';

  // State for Add/Edit Fee Structure Modal
  final _classIdCtrl = TextEditingController(text: 'Class 10A');
  final _tuitionFeeCtrl = TextEditingController();
  final _transportFeeCtrl = TextEditingController();
  final _examFeeCtrl = TextEditingController();
  final _otherChargesCtrl = TextEditingController();

  // State for Billing Dispatch (Collection)
  String _targetStudentId = '';
  String _selectedFeeTerm = 'Monthly Tuition Fee - July';
  double _concessionPercentage = 0.0;
  bool _includeTransport = true;
  bool _includeExam = false;
  bool _includeOther = false;
  final _customNoteCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _classIdCtrl.dispose();
    _tuitionFeeCtrl.dispose();
    _transportFeeCtrl.dispose();
    _examFeeCtrl.dispose();
    _otherChargesCtrl.dispose();
    _customNoteCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Filter students
    final filteredStudents = service.students.where((s) {
      final matchesSearch = s.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.admissionNo.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.classId.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesClass = _selectedClassFilter == 'All' || s.classId == _selectedClassFilter;
      return matchesSearch && matchesClass;
    }).toList();

    return Column(
      children: [
        // Tab Header
        Container(
          color: AppTheme.primaryNavy,
          child: TabBar(
            controller: _tabController,
            labelColor: AppTheme.accentAmber,
            unselectedLabelColor: Colors.white70,
            indicatorColor: AppTheme.accentAmber,
            indicatorWeight: 3,
            labelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(icon: Icon(Icons.layers_outlined), text: 'Fee Structures'),
              Tab(icon: Icon(Icons.add_circle_outline_rounded), text: 'Collect / Invoice'),
              Tab(icon: Icon(Icons.pending_actions_rounded), text: 'Pending list'),
              Tab(icon: Icon(Icons.history_toggle_off_rounded), text: 'Reports & Paid'),
            ],
          ),
        ),
        // Tab Content
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildStructuresTab(service),
              _buildCollectionTab(service, filteredStudents),
              _buildPendingTab(service),
              _buildReportsAndPaidTab(service),
            ],
          ),
        ),
      ],
    );
  }

  // ================= TAB 1: FEE STRUCTURES =================
  Widget _buildStructuresTab(PortalService service) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            justifyAxisAlignment: MainAxisAlignment.between,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Standard Fee Guidelines',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  Text(
                    'Define the standard quarterly charges by class category',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add New Structure'),
                onPressed: () => _showStructureDialog(service, null),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (service.feeStructures.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(Icons.layers_clear_outlined, size: 48, color: Colors.grey.shade400),
                    const SizedBox(height: 12),
                    const Text('No standard structures configured yet.'),
                  ],
                ),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: service.feeStructures.length,
              itemBuilder: (context, idx) {
                final fs = service.feeStructures[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  color: Colors.white,
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryNavy.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.class_, color: AppTheme.primaryNavy, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  fs.classId,
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryNavy,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, color: Colors.blue, size: 18),
                                  onPressed: () => _showStructureDialog(service, fs),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                                  onPressed: () {
                                    service.deleteFeeStructure(fs.id);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Fee structure deleted successfully.')),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        GridView(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 4,
                            childAspectRatio: 2.2,
                            crossAxisSpacing: 8,
                          ),
                          children: [
                            _buildMiniDetail('Tuition Fee', '₹${fs.tuitionFee.toStringAsFixed(0)}'),
                            _buildMiniDetail('Transport Fee', '₹${fs.transportFee.toStringAsFixed(0)}'),
                            _buildMiniDetail('Exam Fee', '₹${fs.examFee.toStringAsFixed(0)}'),
                            _buildMiniDetail('Other Charges', '₹${fs.otherCharges.toStringAsFixed(0)}'),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.slate.shade50,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              const Text(
                                'Gross Term Liability',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.black54),
                              ),
                              Text(
                                '₹${fs.total.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: AppTheme.primaryNavy,
                                ),
                              ),
                            ],
                          ),
                        )
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

  Widget _buildMiniDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.jetbrainsMono(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Colors.black85,
          ),
        ),
      ],
    );
  }

  void _showStructureDialog(PortalService service, FeeStructure? existing) {
    if (existing != null) {
      _classIdCtrl.text = existing.classId;
      _tuitionFeeCtrl.text = existing.tuitionFee.toString();
      _transportFeeCtrl.text = existing.transportFee.toString();
      _examFeeCtrl.text = existing.examFee.toString();
      _otherChargesCtrl.text = existing.otherCharges.toString();
    } else {
      _tuitionFeeCtrl.clear();
      _transportFeeCtrl.clear();
      _examFeeCtrl.clear();
      _otherChargesCtrl.clear();
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: Text(
            existing == null ? 'Define Fee Structure' : 'Modify Fee Structure',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: _classIdCtrl.text,
                  decoration: const InputDecoration(labelText: 'Target Grade / Class', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                    DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                    DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B')),
                    DropdownMenuItem(value: 'Class 11A', child: Text('Class 11A')),
                    DropdownMenuItem(value: 'Class 12A', child: Text('Class 12A')),
                  ],
                  onChanged: (val) {
                    if (val != null) _classIdCtrl.text = val;
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _tuitionFeeCtrl,
                  decoration: const InputDecoration(labelText: 'Tuition Fee (₹)', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _transportFeeCtrl,
                  decoration: const InputDecoration(labelText: 'Transport Fee (₹)', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _examFeeCtrl,
                  decoration: const InputDecoration(labelText: 'Exam Fee (₹)', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _otherChargesCtrl,
                  decoration: const InputDecoration(labelText: 'Other Miscellaneous Charges (₹)', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
              onPressed: () {
                final fs = FeeStructure(
                  id: existing?.id ?? 'fs_${DateTime.now().millisecondsSinceEpoch}',
                  classId: _classIdCtrl.text,
                  tuitionFee: double.tryParse(_tuitionFeeCtrl.text) ?? 0.0,
                  transportFee: double.tryParse(_transportFeeCtrl.text) ?? 0.0,
                  examFee: double.tryParse(_examFeeCtrl.text) ?? 0.0,
                  otherCharges: double.tryParse(_otherChargesCtrl.text) ?? 0.0,
                );
                service.saveFeeStructure(fs);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Standard fee structure registered successfully!')),
                );
              },
              child: const Text('Save Structure'),
            )
          ],
        );
      },
    );
  }

  // ================= TAB 2: COLLECT / DISPATCH INVOICE =================
  Widget _buildCollectionTab(PortalService service, List filteredStudents) {
    if (service.students.isNotEmpty && _targetStudentId.isEmpty) {
      _targetStudentId = service.students.first.id;
    }

    // Attempt to pre-calculate from standard structure
    final selectedStudent = service.students.firstWhere((s) => s.id == _targetStudentId, orElse: () => service.students.first);
    final struct = service.feeStructures.firstWhere((f) => f.classId == selectedStudent.classId,
        orElse: () => FeeStructure(id: '', classId: '', tuitionFee: 14500, transportFee: 2500, examFee: 1200, otherCharges: 600));

    double baseAmount = struct.tuitionFee;
    if (_includeTransport) baseAmount += struct.transportFee;
    if (_includeExam) baseAmount += struct.examFee;
    if (_includeOther) baseAmount += struct.otherCharges;

    final double discount = baseAmount * (_concessionPercentage / 100);
    final double netTotal = baseAmount - discount;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Monthly Fee Dispatcher',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          Text(
            'Search students, apply custom concessions, and trigger parent invoice dispatches',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 16),

          // Search student filter
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Search student by Name, Class or Admission ID...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  onChanged: (val) {
                    setState(() => _searchQuery = val);
                  },
                ),
              ),
              const SizedBox(width: 10),
              DropdownButton<String>(
                value: _selectedClassFilter,
                style: const TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
                items: const [
                  DropdownMenuItem(value: 'All', child: Text('All Classes')),
                  DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                  DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                  DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedClassFilter = val);
                },
              )
            ],
          ),
          const SizedBox(height: 16),

          // Create invoice form
          Card(
            color: Colors.white,
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Fee Invoice Parameters',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 14),

                  // Target Student Dropdown based on filtered list
                  DropdownButtonFormField<String>(
                    value: _targetStudentId.isNotEmpty && service.students.any((s) => s.id == _targetStudentId)
                        ? _targetStudentId
                        : (service.students.isNotEmpty ? service.students.first.id : null),
                    decoration: const InputDecoration(
                      labelText: 'Select Student',
                      prefixIcon: Icon(Icons.person),
                      border: OutlineInputBorder(),
                    ),
                    items: service.students
                        .map((s) => DropdownMenuItem(
                              value: s.id,
                              child: Text('${s.name} (${s.classId}) [Adm: ${s.admissionNo}]'),
                            ))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _targetStudentId = val);
                    },
                  ),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<String>(
                    value: _selectedFeeTerm,
                    decoration: const InputDecoration(labelText: 'Description Term', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'Monthly Tuition Fee - July', child: Text('Monthly Tuition Fee - July')),
                      DropdownMenuItem(value: 'Term 1 Exam & Assessment Fee', child: Text('Term 1 Exam & Assessment Fee')),
                      DropdownMenuItem(value: 'Annual Sports & Tech Levy', child: Text('Annual Sports & Tech Levy')),
                      DropdownMenuItem(value: 'Miscellaneous Fine & Library Charges', child: Text('Miscellaneous Fine & Library Charges')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedFeeTerm = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Auxiliary charges checklist
                  Text(
                    'Include Components (Estimated standard rate for ${selectedStudent.classId}):',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54),
                  ),
                  CheckboxListTile(
                    title: Text('Transport Fee (₹${struct.transportFee.toStringAsFixed(0)})', style: const TextStyle(fontSize: 12)),
                    value: _includeTransport,
                    dense: true,
                    onChanged: (val) {
                      if (val != null) setState(() => _includeTransport = val);
                    },
                  ),
                  CheckboxListTile(
                    title: Text('Exam Fee (₹${struct.examFee.toStringAsFixed(0)})', style: const TextStyle(fontSize: 12)),
                    value: _includeExam,
                    dense: true,
                    onChanged: (val) {
                      if (val != null) setState(() => _includeExam = val);
                    },
                  ),
                  CheckboxListTile(
                    title: Text('Other Miscellaneous Charges (₹${struct.otherCharges.toStringAsFixed(0)})', style: const TextStyle(fontSize: 12)),
                    value: _includeOther,
                    dense: true,
                    onChanged: (val) {
                      if (val != null) setState(() => _includeOther = val);
                    },
                  ),
                  const Divider(height: 24),

                  // Concession Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text(
                        'Fee Concession / Discount',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black85),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(4)),
                        child: Text(
                          '${_concessionPercentage.toStringAsFixed(0)}% Concession',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.orange),
                        ),
                      )
                    ],
                  ),
                  Slider(
                    value: _concessionPercentage,
                    min: 0,
                    max: 100,
                    divisions: 20,
                    activeColor: AppTheme.primaryNavy,
                    onChanged: (val) {
                      setState(() => _concessionPercentage = val);
                    },
                  ),
                  const Divider(height: 24),

                  // Dispatch Summary Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      border: Border.all(color: Colors.grey.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        _buildSummaryLine('Base Tuition Fee', '₹${struct.tuitionFee.toStringAsFixed(0)}'),
                        if (_includeTransport) _buildSummaryLine('Transport Fee Component', '₹${struct.transportFee.toStringAsFixed(0)}'),
                        if (_includeExam) _buildSummaryLine('Exam Fee Component', '₹${struct.examFee.toStringAsFixed(0)}'),
                        if (_includeOther) _buildSummaryLine('Other Charges Component', '₹${struct.otherCharges.toStringAsFixed(0)}'),
                        if (_concessionPercentage > 0)
                          _buildSummaryLine(
                            'Concession Applied (${_concessionPercentage.toStringAsFixed(0)}%)',
                            '- ₹${discount.toStringAsFixed(0)}',
                            valueColor: Colors.green,
                          ),
                        const Divider(),
                        _buildSummaryLine(
                          'Total Net Invoiced Liability',
                          '₹${netTotal.toStringAsFixed(0)}',
                          isBold: true,
                          valueColor: AppTheme.primaryNavy,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: AppTheme.accentAmber,
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.send_rounded),
                    label: const Text(
                      'Dispatch & Publish Invoice',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      final targetS = service.students.firstWhere((s) => s.id == _targetStudentId, orElse: () => service.students.first);
                      service.addFeeInvoice(
                        targetS.id,
                        targetS.name,
                        _selectedFeeTerm,
                        netTotal,
                        '2026-07-31',
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Invoice published! Parent of ${targetS.name} notified.')),
                      );
                    },
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryLine(String title, String value, {bool isBold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(title, style: TextStyle(fontSize: 11, fontWeight: isBold ? FontWeight.bold : FontWeight.normal, color: Colors.black54)),
          Text(
            value,
            style: GoogleFonts.jetbrainsMono(
              fontSize: 12,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: valueColor ?? Colors.black85,
            ),
          ),
        ],
      ),
    );
  }

  // ================= TAB 3: PENDING FEES & REMINDERS =================
  Widget _buildPendingTab(PortalService service) {
    final unpaidInvoices = service.fees.where((f) => f.status == 'unpaid').toList();
    final double totalPending = unpaidInvoices.fold(0, (sum, f) => sum + f.amount);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              border: Border.all(color: Colors.red.shade100),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.redAccent, size: 28),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Outstanding Arrears',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                      Text(
                        '₹${totalPending.toStringAsFixed(0)} pending across ${unpaidInvoices.length} outstanding accounts',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(Icons.notification_important_rounded, size: 16),
                  label: const Text('Remind All', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Bulk SMS & App Push Reminders dispatched to parents.')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Unpaid Student Accounts',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 10),
          if (unpaidInvoices.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(30),
                child: Text('All student accounts are fully paid up! Nice work.', style: TextStyle(color: Colors.grey.shade500)),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: unpaidInvoices.length,
              itemBuilder: (context, idx) {
                final f = unpaidInvoices[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  color: Colors.white,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.red.shade50,
                      child: const Icon(Icons.close, color: Colors.redAccent, size: 16),
                    ),
                    title: Text(f.studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('${f.termName} • Due ${f.dueDate}', style: const TextStyle(fontSize: 11)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('₹${f.amount.toStringAsFixed(0)}',
                            style: GoogleFonts.jetbrainsMono(fontWeight: FontWeight.bold, color: Colors.redAccent)),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.send_to_mobile_outlined, color: Colors.blueAccent, size: 20),
                          tooltip: 'Trigger WhatsApp & SMS Reminder',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Individual reminder dispatched to parent of ${f.studentName}.')),
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.check_circle_outline, color: Colors.green, size: 20),
                          tooltip: 'Mark Paid',
                          onPressed: () {
                            service.payInvoice(f.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Invoice status updated to Paid.')),
                            );
                          },
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

  // ================= TAB 4: PAID HISTORY & REPORTS =================
  Widget _buildReportsAndPaidTab(PortalService service) {
    final paidInvoices = service.fees.where((f) => f.status == 'paid').toList();
    final unpaidInvoices = service.fees.where((f) => f.status != 'paid').toList();
    final double totalPaid = paidInvoices.fold(0, (sum, f) => sum + f.amount);
    final double totalPending = unpaidInvoices.fold(0, (sum, f) => sum + f.amount);
    final double grossTotal = totalPaid + totalPending;
    final double collectionRatio = grossTotal == 0 ? 0 : (totalPaid / grossTotal) * 100;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Revenue & Collection Health',
            style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          const SizedBox(height: 12),

          // Custom Mini Chart Card
          Card(
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatisticBlock('Gross Generated', '₹${grossTotal.toStringAsFixed(0)}', Colors.grey.shade700),
                      _buildStatisticBlock('Settled Paid', '₹${totalPaid.toStringAsFixed(0)}', Colors.green),
                      _buildStatisticBlock('Arrears Pending', '₹${totalPending.toStringAsFixed(0)}', Colors.redAccent),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Collection Settlement Ratio', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('${collectionRatio.toStringAsFixed(1)}%',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.green)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: collectionRatio / 100,
                      minHeight: 12,
                      backgroundColor: Colors.grey.shade100,
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Paid Invoices History
          Text(
            'Verified Paid History & Receipts',
            style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          const SizedBox(height: 10),
          if (paidInvoices.isEmpty)
            const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No payment logs cleared yet.')))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: paidInvoices.length,
              itemBuilder: (context, idx) {
                final f = paidInvoices[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  color: Colors.white,
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.green.shade50,
                      child: const Icon(Icons.check, color: Colors.green, size: 16),
                    ),
                    title: Text(f.studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('${f.termName} • Settled', style: const TextStyle(fontSize: 11)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('₹${f.amount.toStringAsFixed(0)}',
                            style: GoogleFonts.jetbrainsMono(fontWeight: FontWeight.bold, color: Colors.green)),
                        const SizedBox(width: 10),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
                            foregroundColor: AppTheme.primaryNavy,
                            elevation: 0,
                            dense: true,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                          ),
                          icon: const Icon(Icons.picture_as_pdf, size: 14),
                          label: const Text('Receipt', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          onPressed: () => _showReceiptPDF(f),
                        )
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

  Widget _buildStatisticBlock(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  // ================= FEE RECEIPT PDF MODAL SIMULATION =================
  void _showReceiptPDF(FeeInvoice invoice) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            padding: const EdgeInsets.all(24),
            maxWidth: 500,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // PDF Viewer Controls Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text(
                      'PDF READER PREVIEW',
                      style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.print_rounded, size: 20),
                          tooltip: 'Print Receipt',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Connecting to cloud printer...')),
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.download_rounded, size: 20),
                          tooltip: 'Save PDF File',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Saved: Sunita_School_Receipt_${invoice.id}.pdf')),
                            );
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        )
                      ],
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 10),

                // Beautiful Receipt Paper Container
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.grey.shade300, width: 2),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // School Header
                      Center(
                        child: Column(
                          children: [
                            Text(
                              'SUNITA INTERNATIONAL SCHOOL',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                            const Text(
                              'CBSE Affiliated Sr. Sec. School • Sector 12, Dwarka',
                              style: TextStyle(fontSize: 8, color: Colors.grey),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                              color: AppTheme.primaryNavy,
                              child: const Text(
                                'OFFICIAL FEE PAYMENT RECEIPT',
                                style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Metadata Grid
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          _buildReceiptField('Receipt No:', 'SIS-REC-${invoice.id.toUpperCase()}'),
                          _buildReceiptField('Date Paid:', '2026-07-15'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          _buildReceiptField('Student Name:', invoice.studentName),
                          _buildReceiptField('Admission No:', 'SIS-2026-1001'),
                        ],
                      ),
                      const SizedBox(height: 14),

                      const Divider(thickness: 1.5),

                      // Ledger Items Table Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: const [
                          Text('DESCRIPTION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black54)),
                          Text('AMOUNT (INR)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black54)),
                        ],
                      ),
                      const Divider(),

                      // Table rows
                      _buildReceiptRow(invoice.termName, invoice.amount),
                      const SizedBox(height: 4),
                      _buildReceiptRow('Digital Library Levy', 0.0),
                      _buildReceiptRow('E-Learning Subscription', 0.0),

                      const Divider(thickness: 1.5, height: 20),

                      // Grand Total Block
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Text(
                            'GRAND TOTAL NET RECEIVED',
                            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                          Text(
                            '₹${invoice.amount.toStringAsFixed(2)}',
                            style: GoogleFonts.jetbrainsMono(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.green),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Signatures block
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 80,
                                height: 1.5,
                                color: Colors.grey.shade400,
                              ),
                              const SizedBox(height: 4),
                              const Text('Receiver Stamp', style: TextStyle(fontSize: 7, color: Colors.grey)),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                width: 80,
                                height: 1.5,
                                color: Colors.grey.shade400,
                              ),
                              const SizedBox(height: 4),
                              const Text('Authorized Cashier', style: TextStyle(fontSize: 7, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildReceiptField(String label, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 7, color: Colors.grey)),
        const SizedBox(height: 1),
        Text(
          val,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black85),
        ),
      ],
    );
  }

  Widget _buildReceiptRow(String desc, double val) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Text(desc, style: const TextStyle(fontSize: 10, color: Colors.black85)),
        Text(
          '₹${val.toStringAsFixed(2)}',
          style: GoogleFonts.jetbrainsMono(fontSize: 10, color: Colors.black85),
        ),
      ],
    );
  }
}
