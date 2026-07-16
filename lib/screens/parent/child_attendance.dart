import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ChildAttendance extends StatelessWidget {
  const ChildAttendance({super.key});

  @override
  Widget build(BuildContext context) {
    // Simulated July 2026 Calendar days state
    final Map<int, String> attendanceData = {
      1: 'present', 2: 'present', 3: 'present', 4: 'holiday', 5: 'holiday',
      6: 'present', 7: 'present', 8: 'late', 9: 'present', 10: 'present',
      11: 'holiday', 12: 'holiday', 13: 'present', 14: 'present', 15: 'present',
      16: 'present', 17: 'absent', 18: 'holiday', 19: 'holiday', 20: 'present',
      21: 'present', 22: 'present', 23: 'present', 24: 'present', 25: 'holiday',
      26: 'holiday', 27: 'present', 28: 'present', 29: 'present', 30: 'present',
      31: 'absent'
    };

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stat Overview Cards
          Row(
            children: [
              _buildMetricCard('Total Days', '50', Colors.indigo),
              const SizedBox(width: 8),
              _buildMetricCard('Present', '45', Colors.green),
              const SizedBox(width: 8),
              _buildMetricCard('Absent', '2', Colors.red),
              const SizedBox(width: 8),
              _buildMetricCard('Late', '3', Colors.amber),
            ],
          ),
          const SizedBox(height: 20),

          // Percentage Card
          Card(
            color: Colors.green.shade50,
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.green,
                    radius: 20,
                    child: Icon(Icons.percent_rounded, color: Colors.white, size: 20),
                  ),
                  SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '94.8% Attendance Rate',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Meets CBSE minimum threshold requirement of 75%',
                        style: TextStyle(fontSize: 9, color: Colors.green),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Interactive Grid Calendar
          const Text(
            'Attendance Grid • July 2026',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
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
                  // Weekday headers
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      _DayHeader('M'), _DayHeader('T'), _DayHeader('W'),
                      _DayHeader('T'), _DayHeader('F'), _DayHeader('S'),
                      _DayHeader('S'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  const SizedBox(height: 8),

                  // Calendar Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7,
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                    ),
                    itemCount: 35, // starting July on Wednesday, pad 2 empty blocks
                    itemBuilder: (context, index) {
                      if (index < 2) {
                        return const SizedBox(); // empty pad blocks
                      }
                      final dayNum = index - 1;
                      if (dayNum > 31) return const SizedBox();

                      final status = attendanceData[dayNum] ?? 'none';
                      return _buildCalendarDay(dayNum, status);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Legend
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildLegendItem(Colors.green, 'Present'),
                  _buildLegendItem(Colors.red, 'Absent'),
                  _buildLegendItem(Colors.amber, 'Late'),
                  _buildLegendItem(Colors.blueGrey, 'Holiday'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, Color color) {
    return Expanded(
      child: Card(
        color: color.withOpacity(0.06),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          child: Column(
            children: [
              Text(title, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: color)),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCalendarDay(int day, String status) {
    Color bg = Colors.transparent;
    Color fg = Colors.black87;

    switch (status) {
      case 'present':
        bg = Colors.green.shade50;
        fg = Colors.green.shade700;
        break;
      case 'absent':
        bg = Colors.red.shade50;
        fg = Colors.red.shade700;
        break;
      case 'late':
        bg = Colors.amber.shade50;
        fg = Colors.amber.shade800;
        break;
      case 'holiday':
        bg = Colors.grey.shade100;
        fg = Colors.blueGrey;
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: status != 'none' ? fg.withOpacity(0.2) : Colors.grey.shade200,
        ),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '$day',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: fg,
            ),
          ),
          if (status != 'holiday' && status != 'none')
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 4,
              height: 4,
              decoration: BoxDecoration(color: fg, shape: BoxShape.circle),
            ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black54)),
      ],
    );
  }
}

class _DayHeader extends StatelessWidget {
  final String label;
  const _DayHeader(this.label);

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.grey,
      ),
    );
  }
}
