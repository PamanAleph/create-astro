# @pamanaleph/create-astro

🚀 **Scaffold your next-gen web project in seconds.**

`@pamanaleph/create-astro` is a powerful, interactive CLI for bootstrapping modern web applications with [Astro](https://astro.build/). Get a production-ready, feature-rich template with your choice of framework (React or Vue) and package manager (pnpm, npm, or yarn) without the manual setup hassle.

---

## Quick Start

Get started immediately with a single command. The CLI will guide you through the options.

```bash
# Run the interactive installer
npm create @pamanaleph/astro@latest
```

Or, create a project non-interactively by passing flags:

```bash
# Scaffold a Vue project with API routes using pnpm, skipping all prompts
npm create @pamanaleph/astro@latest my-vue-app -- --framework vue --api --package-manager pnpm -y
```

## Features

This tool is more than just a template copier. It's a smart initializer designed for developer experience and robust, reproducible builds.

### CLI Features
- 💡 **Interactive & Guided**: Prompts for project name, framework, package manager, and API routes.
- フレームワーク **Multi-Framework Presets**: Choose between **React** or **Vue** for your project foundation.
- 📦 **Package Manager Choice**: Select **pnpm**, **npm**, or **yarn**. The CLI auto-detects your preferred manager if not specified.
- 🔧 **Configurable API Routes**: Easily include or exclude Astro's server-side API routes.
- 🧹 **Intelligent Cleanup**: Automatically removes template-specific development files (like `.github/` workflows or `docs/`) using a `.templateignore` file for a clean project slate.
- 🛡️ **BOM Sanitization**: Automatically detects and removes UTF-8 BOM to prevent subtle cross-platform bugs.
- 🔄 **Git Ref Support**: Scaffold from any specific branch, tag, or commit hash using the `--ref` flag.
- ⚡ **Fast & Reliable Scaffolding**: Downloads the template subfolder directly from GitHub via `tar` stream for speed, with a robust `git clone` fallback.
- 🎨 **Rich CLI Output**: Provides clear progress indicators and a helpful summary upon completion.
- ✅ **Non-Interactive Mode**: Use the `-y`/`--yes` flag to automate setup for CI/CD or scripting.

### Template Features
The underlying template (`pamanaleph/astro-multi-framework-template`) is packed with modern best practices:
- **🚀 Astro**: Leverage the power of Astro for fast, content-focused websites with SSR support.
- **⚛️ React or 💚 Vue**: Pre-configured with your chosen framework.
- **📘 TypeScript**: Full type-safety out-of-the-box.
- **🎨 Tailwind CSS v4**: Next-gen, JIT-powered styling without a `postcss.config.js`.
- **✅ Zod**: End-to-end type-safety and data validation schemas.
- **🔧 ESLint + Prettier**: Enforce consistent code style and quality.
- **📁 Well-Organized Structure**: A logical and scalable project structure for components, layouts, and schemas.

## Usage

### Interactive Mode
For a guided experience, run the CLI without any arguments.

```bash
npm create @pamanaleph/create-astro@latest
```
The CLI will ask for:
1.  **Project Name**: The name of your new directory.
2.  **Framework**: `React` or `Vue`.
3.  **Package Manager**: `pnpm`, `npm`, or `yarn`.
4.  **API Routes**: Whether to include the `src/pages/api` directory.

### Non-Interactive Mode
You can pass command-line flags to bypass the prompts entirely. This is ideal for automation.

```bash
# Create a React project named 'my-app' with no API routes
npm create @pamanaleph/create-astro@latest my-app -- --framework react --no-api

# Create a Vue project using a specific git tag and skip dependency installation
npm create @pamanaleph/create-astro@latest my-vue-project -- --framework vue --ref v0.4.0 --no-install
```

## CLI Options

| Option | Flag | Description | Default |
| :--- | :--- | :--- | :--- |
| Project Name | `[project-name]` | The name for your project directory. | (prompt) |
| Framework | `--framework <name>` | Specify the framework (`react` or `vue`). | (prompt) |
| Package Manager | `--package-manager <name>` | Specify the package manager (`pnpm`, `npm`, `yarn`). | (auto-detect) |
| API Routes | `--api` / `--no-api` | Include or exclude API routes. | (prompt) |
| Yes (Auto-Accept) | `-y`, `--yes` | Skip all prompts and use defaults. | `false` |
| No Install | `--no-install` | Skip dependency installation after scaffolding. | `false` |
| No Cleanup | `--no-cleanup` | Keep all template development files (for debugging). | `false` |
| Git Reference | `--ref <ref>` | Use a specific git branch, tag, or commit. | (latest release tag) |
| Help | `-h`, `--help` | Display the help menu. | |
| Version | `-V`, `--version` | Display the CLI version. | |

> **Note**: When running via `npm create`, you must add an extra `--` before the flags, e.g., `npm create @pamanaleph/astro@latest -- --framework react`.

## Contributing

Contributions are welcome! If you have ideas for new features, presets, or improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/PamanAleph/astro-multi-framework-template).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
