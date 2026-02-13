# Contributing to CircuitJS

Thank you for your interest in contributing to CircuitJS! This document provides guidelines and instructions for contributing to this Obsidian plugin.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Release Workflow](#release-workflow)
- [Coding Standards](#coding-standards)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/obsidian-circuitjs.git
   cd obsidian-circuitjs
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/StevenGann/obsidian-circuitjs.git
   ```

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js) or [pnpm](https://pnpm.io/)
- [Obsidian](https://obsidian.md/) for testing

### Installation

```bash
# Install dependencies
npm install

# Start development build with watch mode
npm run dev

# Run linting
npm run lint

# Production build
npm run build
```

### Testing in Obsidian

1. Create a test vault or use an existing one
2. Navigate to `<vault>/.obsidian/plugins/`
3. Create a symbolic link or copy the plugin folder:
   ```bash
   # Windows (PowerShell as Admin)
   New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\circuitjs" -Target "C:\path\to\obsidian-circuitjs"

   # macOS/Linux
   ln -s /path/to/obsidian-circuitjs /path/to/vault/.obsidian/plugins/circuitjs
   ```
4. Enable the plugin in Obsidian Settings → Community plugins
5. Use `Ctrl+R` (or `Cmd+R` on macOS) to reload Obsidian after changes

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Write clear, concise commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Fix bug" not "Fixes bug")
- Reference issues when applicable ("Fix #123: ...")

Example:
```
Add configurable iframe height setting

- Add height setting to CircuitJsSettings interface
- Update settings tab with height slider
- Apply height to rendered iframes

Closes #42
```

## Pull Request Process

1. **Update your fork** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes** and commit them

4. **Ensure quality**:
   ```bash
   npm run lint    # Check for linting errors
   npm run build   # Verify the build succeeds
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

6. **Open a Pull Request** on GitHub:
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

7. **Address review feedback** if requested

## Release Workflow

> **Note**: Releases are managed by maintainers. This section documents the process for reference.

### Overview

This project uses GitHub Actions for automated releases. Releases are **deliberately triggered** — CI runs on every push, but releases only happen when a maintainer creates a GitHub Release.

### CI Pipeline (Automatic)

Every push and pull request triggers the CI workflow:
- Installs dependencies
- Runs linting (`npm run lint`)
- Builds the plugin (`npm run build`)
- Verifies build output exists

### Creating a Release (Maintainers Only)

#### Step 1: Update Version

Use npm to bump the version. This updates `package.json`, `manifest.json`, and `versions.json` automatically:

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major
```

#### Step 2: Push Changes and Tag

```bash
git push && git push --tags
```

#### Step 3: Create GitHub Release

1. Go to the [Releases page](https://github.com/StevenGann/obsidian-circuitjs/releases)
2. Click **"Draft a new release"**
3. Select the tag you just pushed (e.g., `1.0.1`)
4. Set the release title (e.g., `v1.0.1`)
5. Write release notes describing:
   - New features
   - Bug fixes
   - Breaking changes (if any)
   - Contributors to thank
6. Click **"Publish release"**

#### Step 4: Automated Deployment

Once the release is published, the release workflow automatically:
1. Checks out the code at the tagged version
2. Installs dependencies and builds the plugin
3. Verifies the tag version matches `manifest.json` and `package.json`
4. Uploads release assets:
   - `main.js` (bundled plugin code)
   - `manifest.json` (plugin metadata)
   - `styles.css` (plugin styles)

#### Step 5: Obsidian Registry Update

Obsidian's community plugin registry automatically detects the new release:
- Users will see the update available in Settings → Community plugins
- The `manifest.json` version determines what users see
- `versions.json` maps plugin versions to minimum Obsidian versions

### Version Guidelines

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fixes, minor tweaks | `patch` | 1.0.0 → 1.0.1 |
| New features, enhancements | `minor` | 1.0.0 → 1.1.0 |
| Breaking changes, major rewrites | `major` | 1.0.0 → 2.0.0 |

### Troubleshooting Releases

**Release workflow failed?**
- Check that the tag version matches `manifest.json` and `package.json`
- Ensure all files build correctly locally with `npm run build`
- Review the workflow logs in GitHub Actions

**Assets not attached?**
- The workflow needs `contents: write` permission (already configured)
- Check that `main.js`, `manifest.json`, and `styles.css` exist after build

## Coding Standards

### TypeScript

- Use TypeScript strict mode (configured in `tsconfig.json`)
- Add type annotations for function parameters and return types
- Avoid `any` type when possible

### Code Style

- Run `npm run lint` before committing
- Use tabs for indentation (configured in ESLint)
- Use double quotes for strings

### File Organization

```
src/
├── main.ts           # Plugin entry point
├── settings.ts       # Settings interface and tab
└── circuitRenderer.ts # Rendering logic
```

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CONTRIBUTING.md for process changes

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Reach out to the maintainer

Thank you for contributing! 🎉
