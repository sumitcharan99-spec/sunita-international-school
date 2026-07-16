import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentLedger extends StatelessWidget {
  const StudentLedger({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    // Filter for student 'std_1' (Rahul Sharma)
    final myUnpaid = service.fees
        .where((f) => f.studentId == 'std_1' && f.status == 'unpaid')
        .toList();
    final myPaid = service.fees
        .where((f) => f.studentId == 'std_1' && f.status == 'paid')
        .toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Fee Structure & Payments',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 12),

          if (myUnpaid.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                border: Border.all(color: Colors.green.shade100),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                '🎉 Beautiful! All invoices have been settled successfully!',
                style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            )
          else
            ...myUnpaid.map((f) => Card(
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              f.termName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                            Text(
                              '₹${f.amount}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Due Date: ${f.dueDate} • Pending Settlement',
                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryNavy,
                            foregroundColor: AppTheme.accentAmber,
                          ),
                          icon: const Icon(Icons.security),
                          label: const Text(
                            'Initiate Secure UPI Payment',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          onPressed: () {
                            service.payInvoice(f.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Payment simulated successfully! Ledger has updated.',
                                ),
                              ),
                            );
                          },
                        )
                      ],
                    ),
                  ),
                )),

          const SizedBox(height: 20),
          const Text(
            'Settled Historic Receipts',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 8),

          if (myPaid.isEmpty)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text(
                'No paid receipts recorded yet.',
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
            )
          else
            ...myPaid.map((f) => Card(
                  color: Colors.white,
                  child: ListTile(
                    leading: const Icon(Icons.verified, color: Colors.green),
                    title: Text(
                      f.termName,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      'Amount ₹${f.amount} • Cleared',
                      style: const TextStyle(fontSize: 9),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.download, color: AppTheme.primaryNavy),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Downloading fee receipt PDF...')),
                        );
                      },
                    ),
                  ),
                ))
        ],
      ),
    );
  }
}
