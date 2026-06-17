# RICE NAVI v7 translation polish package

This package connects the split RICE NAVI databases to a single PWA shell.

## Included modules

- Learning cards: 82 multilingual cards from `rice_navi_learning_cards_multilingual_v82.json`
- Glossary: 30 multilingual terms
- Water / storage check: 20 rules
- Future Rice 50: 50 Japanese story items
- Module and menu manifest JSON

## Still pending

- `world_rice_story`: import from v44 base is still required.
- `trouble_navi`: detailed trouble DB import is still required.
- Real device display check is not performed in this package.

## How to use on GitHub Pages

1. Upload every file and folder in this package to the repository root, or to a folder such as `/rice-navi/`.
2. Open `index.html` in GitHub Pages.
3. Confirm these screens: Today, Learn Rice Cooking, Water and Storage Check, Future Rice 50, Glossary, Status.
4. When updating JSON, replace files inside the `data/` folder and update the service worker cache name in `sw.js`.

## Version note

App name is now unified as **RICE NAVI**. The literature-based learning-card data is treated as the RICE NAVI learning-card module.
