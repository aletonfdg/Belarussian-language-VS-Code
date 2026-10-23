# Беларуская мова для Visual Studio Code

Неафіцыйны моўны пакет, які пераключае інтэрфейс VS Code на беларускую мову.

> **Стан:** перакладзена каля 20 % радкоў VS Code 1.143 — найбольш прыкметныя
> часткі інтэрфейсу: меню, бакавыя панэлі, дыялогі, пошук, радок стану.
> Астатняе застаецца па-англійску. Пераклад не правяраў носьбіт мовы,
> таму **папраўкі вітаюцца**.

*English: an unofficial Belarusian display-language pack for VS Code (~20 % of
the UI strings translated so far). Not affiliated with Microsoft.*

## Усталяванне

1. Спампуйце `vscode-language-pack-be-<версія>.vsix` са [старонкі Releases](https://github.com/aletonfdg/Belarussian-language-VS-Code/releases).
2. У VS Code адкрыйце **Extensions** → меню `…` → **Install from VSIX…** і выберыце файл.
   Або ў тэрмінале:
   ```bash
   code --install-extension vscode-language-pack-be-0.2.0.vsix
   ```
3. Націсніце `Ctrl+Shift+P`, выканайце **Configure Display Language** і абярыце **Беларуская**.
4. Перазапусціце VS Code.

## Як палепшыць пераклад

Усе пераклады ляжаць у [`translations/dictionary.json`](translations/dictionary.json) —
гэта простая табліца «англійскі радок → беларускі радок». Адзін пераклад дзейнічае
ва ўсіх месцах, дзе сустракаецца гэты радок.

- Захоўвайце `{0}`, `{1}` і маркеры гарачых клавіш `&&` (напрыклад, `&&Файл`).
- Пішыце ў правапісе, зацверджаным афіцыйнымі нормамі (наркамаўка).
- Радкі, якіх няма ў слоўніку, паказваюцца па-англійску.

Затым пераберыце пакет:

```bash
node tools/build.js                     # збірае translations/main.i18n.json
powershell -File tools/pack.ps1         # збірае dist/*.vsix
```

`tools/build.js` чытае `work/base-en.json` — англійскія радкі з вашага VS Code.
Стварыце яго адзін раз:

```bash
node tools/extract-en.js "<шлях да VS Code>/resources/app"
```

Калі змяняеце пакет, павысьце версію ў `package.json`.

## Ліцэнзія

[MIT](LICENSE). Англійскія зыходныя радкі — з Visual Studio Code
(© Microsoft Corporation, MIT). «Visual Studio Code» — гандлёвая марка Microsoft;
гэты праект з Microsoft не звязаны.
