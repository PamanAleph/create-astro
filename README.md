# @pamanaleph/create-astro

🚀 Create a new Astro project with React and TypeScript using our optimized template. Interactive CLI with customizable options for API routes, cleanup, and more.

## Quick Start

```bash
# Interactive mode
npx @pamanaleph/create-astro

# Direct project creation
npx @pamanaleph/create-astro my-project

# With options
npx @pamanaleph/create-astro my-project --api --yes
```

## Usage

### Interactive Mode

```bash
npx @pamanaleph/create-astro
```

You will be prompted to:
- Enter a project name (if not provided)
- Choose whether to include API routes

### Direct Project Creation

```bash
npx @pamanaleph/create-astro my-awesome-project
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--api` | Include API routes in the project |
| `--no-api` | Exclude API routes from the project |
| `--yes, -y` | Skip all prompts and use default values |
| `--no-install` | Skip dependency installation |
| `--no-cleanup` | Skip cleanup of development files |
| `--ref <branch>` | Use specific git branch/tag (default: main) |
| `--help, -h` | Display help information |
| `--version, -V` | Display version number |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CREATE_ASTRO_API` | Set to '1' to include API routes, '0' to exclude (overrides prompts) |
| `CREATE_ASTRO_YES` | Set to '1' to skip all prompts and use defaults |

## Examples

```bash
# Interactive mode - prompts for project name and options
npx @pamanaleph/create-astro

# Create project with name, prompt for API routes
npx @pamanaleph/create-astro my-awesome-app

# Create project with API routes, skip all prompts
npx @pamanaleph/create-astro my-app --api --yes

# Create project without API routes, keep development files
npx @pamanaleph/create-astro my-app --no-api --no-cleanup

# Create project from develop branch
npx @pamanaleph/create-astro my-app --ref develop

# Using environment variables
CREATE_ASTRO_API=1 CREATE_ASTRO_YES=1 npx @pamanaleph/create-astro my-app

# Create project with specific template version
npx @pamanaleph/create-astro my-project --ref v1.2.0

# Create project without installing dependencies
npx @pamanaleph/create-astro my-project --no-install
```

## Features

### CLI Features
- 🎯 **Interactive CLI** with smart prompts
- ⚡ **Fast project scaffolding** from GitHub template
- 🔧 **Configurable API routes** (include/exclude)
- 🧹 **Smart cleanup** of development files
- 📦 **Automatic dependency installation**
- 🌿 **Support for custom git branches/tags**
- 🔒 **NPM-safe project name validation**
- 🎨 **Beautiful CLI output** with progress indicators
- ⚙️ **Environment variable support**
- 🚀 **Zero-config setup** for Astro + React + TypeScript

### Template Features

This initializer creates projects using our [astro-react-typescript-template](https://github.com/PamanAleph/astro-react-typescript-template) which includes:

- **🚀 Astro** with SSR support
- **⚛️ React** + **📘 TypeScript**
- **🎨 Tailwind CSS v4** with modern styling
- **✅ Zod** for runtime validation
- **🔧 ESLint + Prettier** for code quality
- **📡 API Routes** example (optional)
- **📁 Well-organized** project structure

## Project Structure

After creation, your project will have this structure:

### With API Routes (default)
```
my-project/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Astro pages
│   │   ├── api/        # API routes
│   │   └── index.astro
│   ├── layout/         # Layout components
│   └── styles/         # Global styles
├── public/             # Static assets
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

### Without API Routes (--no-api)
```
my-project/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Astro pages
│   │   └── index.astro # No API folder
│   ├── layout/         # Layout components
│   └── styles/         # Global styles
├── public/             # Static assets
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

### Development Files Cleanup

By default, the following development files are removed from the template:
- `.editorconfig`, `.gitattributes`, `.npmignore`
- `.prettierignore`, `.prettierrc`, `.releaserc.json`
- `.github/`, `.husky/`, `docs/`
- `CHANGELOG.md`, `CONTRIBUTING.md`
- Test files and development configurations

Use `--no-cleanup` to keep these files.

## Getting Started

After creating your project:

```bash
cd my-project
npm run dev
```

Your development server will be available at `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Package Manager Detection

The initializer automatically detects your preferred package manager:

1. **pnpm** (if available)
2. **yarn** (if available)
3. **npm** (fallback)

## Requirements

- Node.js >= 18.0.0
- npm, yarn, or pnpm

## Template Repository

This initializer uses the [astro-react-typescript-template](https://github.com/PamanAleph/astro-react-typescript-template) repository. You can also use the template directly:

### Using Astro CLI

```bash
npm create astro@latest -- --template PamanAleph/astro-react-typescript-template
```

### Manual Clone

```bash
git clone https://github.com/PamanAleph/astro-react-typescript-template.git my-project
cd my-project
npm install
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [PamanAleph](https://github.com/PamanAleph)
