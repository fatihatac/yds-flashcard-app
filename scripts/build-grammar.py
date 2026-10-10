# Gramer konularını ve sorularını data/ altına yazar: python3 scripts/build-grammar.py
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from grammar_topics import TOPICS
from grammar_questions import Q

ids = [t["id"] for t in TOPICS]
assert len(ids) == len(set(ids)), "yinelenen konu id"
per = {}
questions = []
for i, (tid, stem, opts, ans, exp) in enumerate(Q, 1):
    assert tid in ids, tid
    assert len(opts) == 5 and 0 <= ans < 5, stem
    per[tid] = per.get(tid, 0) + 1
    questions.append({"id": f"gq{i:03d}", "cardIds": [tid], "kind": "grammar", "area": "grammar",
                      "stem": stem, "options": opts, "answer": ans, "explanation": exp})
missing = [t for t in ids if t not in per]
assert not missing, missing
json.dump(TOPICS, open("data/grammar.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(questions, open("data/grammar-questions.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(len(TOPICS), "konu,", len(questions), "soru")
