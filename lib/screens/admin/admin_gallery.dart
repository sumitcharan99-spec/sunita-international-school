import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminGallery extends StatefulWidget {
  const AdminGallery({super.key});

  @override
  State<AdminGallery> createState() => _AdminGalleryState();
}

class _AdminGalleryState extends State<AdminGallery> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _urlCtrl = TextEditingController(text: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3');

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  void _showAddPhotoDialog(PortalService service) {
    _titleCtrl.clear();
    _descCtrl.clear();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.add_photo_alternate_rounded, color: AppTheme.primaryNavy),
              SizedBox(width: 10),
              Text('Publish School Memory', style: TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Event/Memory Title',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Short Description',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _urlCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Photo URL / Path (Unsplash supported)',
                    border: OutlineInputBorder(),
                    helperText: 'Simulates direct bucket compilation in real-time.',
                    helperStyle: TextStyle(fontSize: 8),
                  ),
                ),
                const SizedBox(height: 12),
                // Suggestions quick presets
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Suggested Photo Presets:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 4,
                  children: [
                    ActionChip(
                      padding: EdgeInsets.zero,
                      label: const Text('Science', style: TextStyle(fontSize: 8)),
                      onPressed: () => _urlCtrl.text = 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca',
                    ),
                    ActionChip(
                      padding: EdgeInsets.zero,
                      label: const Text('Computers', style: TextStyle(fontSize: 8)),
                      onPressed: () => _urlCtrl.text = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                    ),
                    ActionChip(
                      padding: EdgeInsets.zero,
                      label: const Text('Sports Meet', style: TextStyle(fontSize: 8)),
                      onPressed: () => _urlCtrl.text = 'https://images.unsplash.com/photo-1576450849187-54b9d0ec0e72',
                    ),
                  ],
                )
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryNavy,
                foregroundColor: AppTheme.accentAmber,
              ),
              onPressed: () async {
                if (_titleCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please satisfy title and description.')),
                  );
                  return;
                }
                // Simulate firestore storage upload
                await service.simulateStorageUpload(
                  'gallery/img_${DateTime.now().millisecondsSinceEpoch}.jpg',
                  [0x00, 0x01],
                );
                await service.addGalleryImage(
                  _urlCtrl.text.trim(),
                  _titleCtrl.text.trim(),
                  _descCtrl.text.trim(),
                  '2026-07-15',
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Memory posted successfully! Media synced with central cloud!')),
                );
              },
              child: const Text('Publish', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showAddPhotoDialog(service),
        child: const Icon(Icons.add_photo_alternate_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Virtual Memory Album & Highlights',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Publish, review, and curate scholastic moments, events, and highlights.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Photos Grid View
            Expanded(
              child: service.galleryImages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.photo_library_outlined, size: 48, color: Colors.grey.shade300),
                          const SizedBox(height: 8),
                          Text('No highlights posted in the gallery.', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                        ],
                      ),
                    )
                  : GridView.builder(
                      itemCount: service.galleryImages.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 0.85,
                      ),
                      itemBuilder: (context, index) {
                        final gal = service.galleryImages[index];
                        final url = gal['url'] ?? '';

                        return Card(
                          color: Colors.white,
                          clipBehavior: Clip.antiAlias,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Container(
                                  width: double.infinity,
                                  color: Colors.grey.shade100,
                                  child: Image.network(
                                    url,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return const Center(child: Icon(Icons.broken_image, color: Colors.grey));
                                    },
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      gal['title'] ?? 'School Event',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.primaryNavy),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      gal['description'] ?? 'Event description details.',
                                      style: const TextStyle(fontSize: 9, color: Colors.black54),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      gal['date'] ?? '2026-06-12',
                                      style: const TextStyle(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
