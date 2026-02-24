# Interactive Bash Command Explorer

[https://bash.hamza.stream/](https://bash.hamza.stream/)

## Features
- Explore common Bash commands and their options.
- Visual feedback on command usage.
- Copy commands to clipboard.
- Live demo simulations in the terminal view.

## Testing with Playwright

We use [Playwright](https://playwright.dev/) for automated end-to-end testing, capturing screenshots and recording videos of the application in action.

### Installation

```bash
npm install
npx playwright install chromium --with-deps
```

### Running Tests

To run the tests and generate new screenshots/videos:

```bash
npx playwright test
```

Test results, including screenshots and videos, will be available in the `test-results/` directory (ignored by git) and a permanent copy is maintained in the `media/` directory.

### Project Structure

- `index.html`: Main entry point.
- `index.js`: Application logic.
- `styles.css`: Styling.
- `command-docs.json`: Database of commands and options.
- `tests/`: Playwright test suite.
- `media/`: Captured screenshots and videos of the application.
