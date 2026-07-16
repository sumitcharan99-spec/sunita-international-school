import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AcademicCalendar extends StatelessWidget {
  const AcademicCalendar({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: service.events.length,
      itemBuilder: (context, idx) {
        final ev = service.events[idx];
        Color evCol = Colors.blue;
        if (ev.type == 'holiday') evCol = Colors.orange;
        if (ev.type == 'exam') evCol = Colors.red;

        return Card(
          color: Colors.white,
          child: ListTile(
            leading: Icon(Icons.event_available, color: evCol),
            title: Text(
              ev.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            subtitle: Text(
              ev.description,
              style: const TextStyle(fontSize: 10),
            ),
            trailing: CircleAvatar(
              backgroundColor: evCol.withOpacity(0.12),
              radius: 18,
              child: Text(
                ev.date.substring(0, 2),
                style: TextStyle(
                  color: evCol,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
