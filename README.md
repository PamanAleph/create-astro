# @pamanaleph/create-astro

Create a new Astro project with React and TypeScript using our optimized template.

## Quick Start

```bash
npm create @pamanaleph/astro@latest my-project
```

## Usage

### Interactive Mode

```bash
npm create @pamanaleph/astro@latest
```

You will be prompted to enter a project name.

### Direct Project Name

```bash
npm create @pamanaleph/astro@latest my-awesome-project
```

### Options

- `--ref <ref>`: Use a specific git reference (tag, branch, or commit)
- `--no-install`: Skip dependency installation

### Examples

```bash
# Create project with specific template version
npm create @pamanaleph/astro@latest my-project --ref v1.2.0

# Create project without installing dependencies
npm create @pamanaleph/astro@latest my-project --no-install

# Use development branch
npm create @pamanaleph/astro@latest my-project --ref dev
```

## Template Features

This initializer creates projects using our [astro-react-typescript-template](https://github.com/PamanAleph/astro-react-typescript-template) which includes:

- **🚀 Astro** with SSR support
- **⚛️ React** + **📘 TypeScript**
- **🎨 Tailwind CSS v4** with modern styling
- **✅ Zod** for runtime validation
- **🔧 ESLint + Prettier** for code quality
- **📡 API Routes** example
- **📁 Well-organized** project structure

## Project Structure

After creation, your project will have this structure:

```
my-project/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Astro pages
│   ├── layout/         # Layout components
│   └── styles/         # Global styles
├── public/             # Static assets
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

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
