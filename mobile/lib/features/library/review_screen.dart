import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';

class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key, required this.cards});

  final List<Flashcard> cards;

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final _page = PageController();
  int _index = 0;
  final _missed = <String>{};

  @override
  void dispose() {
    _page.dispose();
    super.dispose();
  }

  Future<void> _mark({required bool knew}) async {
    final card = widget.cards[_index];
    if (!knew) _missed.add(card.id);
    if (_index == widget.cards.length - 1) {
      final missedCards = widget.cards.where((item) => _missed.contains(item.id)).toList();
      if (missedCards.isNotEmpty && missedCards.length < widget.cards.length) {
        await Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => ReviewScreen(cards: missedCards)),
        );
      } else {
        Navigator.pop(context);
      }
      return;
    }
    await _page.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final cards = widget.cards;
    return Scaffold(
      appBar: AppBar(
        title: Text('Review ${_index + 1} / ${cards.length}'),
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _page,
              itemCount: cards.length,
              onPageChanged: (value) => setState(() => _index = value),
              itemBuilder: (context, index) => Padding(
                padding: const EdgeInsets.all(24),
                child: FlipStudyCard(card: cards[index]),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _mark(knew: false),
                    child: const Text("Didn't know"),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: () => _mark(knew: true),
                    child: const Text('I knew it'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FlipStudyCard extends StatefulWidget {
  const FlipStudyCard({super.key, required this.card});

  final Flashcard card;

  @override
  State<FlipStudyCard> createState() => _FlipStudyCardState();
}

class _FlipStudyCardState extends State<FlipStudyCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _flip;
  bool _front = true;

  @override
  void initState() {
    super.initState();
    _flip = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
  }

  @override
  void didUpdateWidget(covariant FlipStudyCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.card.id != widget.card.id) {
      _front = true;
      _flip.value = 0;
    }
  }

  @override
  void dispose() {
    _flip.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_front) {
      await _flip.forward();
    } else {
      await _flip.reverse();
    }
    setState(() => _front = !_front);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggle,
      child: AnimatedBuilder(
        animation: _flip,
        builder: (context, child) {
          final angle = _flip.value * 3.14159;
          final showingFront = angle < 1.5708;
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.0014)
              ..rotateY(angle),
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()..rotateY(showingFront ? 0 : 3.14159),
              child: PaperCard(
                child: SizedBox(
                  height: 360,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        showingFront ? 'ENGLISH' : 'TIẾNG VIỆT',
                        style: const TextStyle(
                          letterSpacing: 2.2,
                          fontSize: 12,
                          color: InkColors.muted,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Headword(
                        showingFront ? widget.card.wordEn : widget.card.wordVi,
                        size: 40,
                      ),
                      if (!showingFront &&
                          widget.card.example != null &&
                          widget.card.example!.isNotEmpty) ...[
                        const SizedBox(height: 18),
                        Text(
                          widget.card.example!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: InkColors.muted),
                        ),
                      ],
                      const SizedBox(height: 28),
                      const Text(
                        'Tap to flip',
                        style: TextStyle(color: InkColors.muted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
