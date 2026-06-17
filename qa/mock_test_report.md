# RICE NAVI v4 Mock Test Report

Generated: 2026-06-17T08:25:32.237564

PASS: 53 / WARN: 2 / FAIL: 0

## Notes
- Learning cards and glossary passed the 4-language required-field check.
- Water/storage and Future Rice 50 remain Japanese-content modules in this package; UI labels and notices are multilingual.
- Runtime render was tested with a mocked DOM environment because browser engines are not available in this sandbox.

## Test Results

| Category | Test | Status | Actual | Detail |
|---|---|---:|---|---|
| JSON | JSON parse data/rice_navi_app_menu_v2.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_future_rice_50_ja_LATEST.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_json_import_manifest_v2.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_learning_cards_multilingual_v82.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_module_manifest_v2.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_storage_mold_rules_v1_0.json | PASS | valid |  |
| JSON | JSON parse data/rice_navi_term_glossary_multilingual_v82.json | PASS | valid |  |
| JSON | JSON parse manifest.webmanifest | PASS | valid |  |
| JavaScript | app.js syntax | PASS | ok |  |
| JavaScript | sw.js syntax | PASS | ok |  |
| Paths | HTML/manifest asset manifest.webmanifest | PASS | True |  |
| Paths | HTML/manifest asset styles.css | PASS | True |  |
| Paths | HTML/manifest asset app.js | PASS | True |  |
| Paths | HTML/manifest asset assets/rice_navi_rn_logo.png | PASS | True |  |
| Paths | HTML/manifest asset assets/icon-192.png | PASS | True |  |
| Paths | HTML/manifest asset assets/icon-512.png | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_module_manifest_v2.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_app_menu_v2.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_json_import_manifest_v2.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_learning_cards_multilingual_v82.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_term_glossary_multilingual_v82.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_storage_mold_rules_v1_0.json | PASS | True |  |
| Paths | app.js DATA_FILES data/rice_navi_future_rice_50_ja_LATEST.json | PASS | True |  |
| PWA | sw.js cache asset index.html | PASS | True |  |
| PWA | sw.js cache asset styles.css | PASS | True |  |
| PWA | sw.js cache asset app.js | PASS | True |  |
| PWA | sw.js cache asset manifest.webmanifest | PASS | True |  |
| PWA | sw.js cache asset assets/rice_navi_rn_logo.png | PASS | True |  |
| PWA | sw.js cache asset assets/icon-192.png | PASS | True |  |
| PWA | sw.js cache asset assets/icon-512.png | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_module_manifest_v2.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_app_menu_v2.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_json_import_manifest_v2.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_learning_cards_multilingual_v82.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_term_glossary_multilingual_v82.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_storage_mold_rules_v1_0.json | PASS | True |  |
| PWA | sw.js cache asset data/rice_navi_future_rice_50_ja_LATEST.json | PASS | True |  |
| Counts | learning cards count | PASS | 82 |  |
| Counts | glossary count | PASS | 30 |  |
| Counts | water rules count | PASS | 20 |  |
| Counts | future rice items count | PASS | 50 |  |
| Translation | learning required fields missing | PASS | 0 | [] |
| Translation | English CJK leftovers | PASS | 0 | [] |
| Translation | Chinese kana leftovers | PASS | 0 | [] |
| Translation | Simplified known traditional leftovers | PASS | 0 | [] |
| Translation | glossary missing fields | PASS | 0 | [] |
| Translation | glossary English CJK leftovers | PASS | 0 | [] |
| Translation | glossary Chinese kana leftovers | PASS | 0 | [] |
| Translation | water/storage module multilingual status | WARN | Japanese source fields only | App labels switch languages; rule text remains Japanese in this v4 package. |
| Translation | future rice 50 multilingual status | WARN | Japanese only | The app displays a notice that this reading content is currently Japanese only. |
| PWA | manifest display | PASS | standalone |  |
| PWA | manifest start_url | PASS | ./index.html |  |
| PWA | viewport meta | PASS | present |  |
| PWA | service worker register | PASS | present |  |
| Runtime mock | all views render in all languages | PASS | 24 ok / 0 bad | [] |