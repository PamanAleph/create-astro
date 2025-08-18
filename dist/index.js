#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import fetch from 'node-fetch';
import tar from 'tar';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
const TEMPLATE_REPO = 'PamanAleph/astro-react-typescript-template';
const TEMPLATE_NPM_PACKAGE = 'astro-react-typescript';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_ARCHIVE_BASE = 'https://github.com';
async function cleanupDevFiles(projectDir, options) {
    const spinner = ora('Cleaning up development files...').start();
    try {
        // Whitelist - files/folders to NEVER delete
        const whitelist = [
            '.gitignore',
            'README.md',
            '.env.example',
            'eslint.config.js',
            'eslint.config.mjs',
            'eslint.config.ts',
            'astro.config.mjs',
            'astro.config.js',
            'astro.config.ts',
            'tsconfig.json',
            'package.json',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            'public',
            'src'
        ];
        // Denylist - files/folders to delete
        const denylist = [
            // CI & Release
            '.github',
            '.husky',
            '.releaserc.json',
            '.releaserc.js',
            '.releaserc.yml',
            '.releaserc.yaml',
            'CHANGELOG.md',
            'CONTRIBUTING.md',
            // Editor/Tooling Dev
            '.editorconfig',
            '.gitattributes',
            '.prettierrc',
            '.prettierrc.json',
            '.prettierrc.js',
            '.prettierrc.yml',
            '.prettierrc.yaml',
            '.prettierignore',
            '.vscode',
            '.npmignore',
            // Documentation
            'docs',
            // Testing
            'vitest.config.js',
            'vitest.config.ts',
            'vitest.config.mjs',
            'jest.config.js',
            'jest.config.ts',
            'jest.config.json',
            '__tests__',
            'msw'
        ];
        let filesRemoved = 0;
        let foldersRemoved = 0;
        const removedItems = [];
        // Get all items in project directory
        const items = await fs.readdir(projectDir);
        for (const item of items) {
            const itemPath = path.join(projectDir, item);
            const stat = await fs.lstat(itemPath);
            // Handle API routes special case first
            if (item === 'src') {
                if (!options.keepApi) {
                    // Remove src/pages/api if keepApi is false
                    const apiPath = path.join(itemPath, 'pages', 'api');
                    try {
                        await fs.access(apiPath);
                        await fs.rm(apiPath, { recursive: true, force: true });
                        removedItems.push('src/pages/api/**');
                        foldersRemoved++;
                    }
                    catch {
                        // API folder doesn't exist, skip
                    }
                }
                continue;
            }
            // Skip if in whitelist
            if (whitelist.includes(item)) {
                continue;
            }
            // Check if item should be removed
            if (denylist.includes(item)) {
                try {
                    await fs.rm(itemPath, { recursive: true, force: true });
                    removedItems.push(item);
                    if (stat.isDirectory()) {
                        foldersRemoved++;
                    }
                    else {
                        filesRemoved++;
                    }
                }
                catch (error) {
                    // Ignore errors for files that don't exist or can't be deleted
                    continue;
                }
            }
            // Handle test files pattern matching
            if (item.includes('.test.') || item.includes('.spec.') || item.endsWith('.test.js') ||
                item.endsWith('.test.ts') || item.endsWith('.spec.js') || item.endsWith('.spec.ts')) {
                try {
                    await fs.rm(itemPath, { recursive: true, force: true });
                    removedItems.push(item);
                    filesRemoved++;
                }
                catch {
                    continue;
                }
            }
        }
        const result = {
            filesRemoved,
            foldersRemoved,
            removedItems
        };
        if (result.filesRemoved > 0 || result.foldersRemoved > 0) {
            spinner.succeed(`Cleaned up ${result.filesRemoved} files and ${result.foldersRemoved} folders`);
        }
        else {
            spinner.succeed('No development files to clean up');
        }
        return result;
    }
    catch (error) {
        spinner.fail('Failed to cleanup development files');
        throw error;
    }
}
async function sanitizeBOM(projectDir) {
    const spinner = ora('Sanitizing files (removing BOM)...').start();
    try {
        const filesToSanitize = [
            'package.json',
            'tsconfig.json',
            '.releaserc.json',
            'astro.config.mjs'
        ];
        let sanitizedCount = 0;
        for (const fileName of filesToSanitize) {
            const filePath = path.join(projectDir, fileName);
            try {
                // Check if file exists
                await fs.access(filePath);
                // Read file as buffer to check for BOM
                const buffer = await fs.readFile(filePath);
                // Check if file starts with BOM (EF BB BF)
                if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                    // Remove BOM and write back
                    const content = buffer.slice(3).toString('utf8');
                    await fs.writeFile(filePath, content, { encoding: 'utf8' });
                    sanitizedCount++;
                }
            }
            catch (error) {
                // File doesn't exist or can't be read, skip silently
                continue;
            }
        }
        if (sanitizedCount > 0) {
            spinner.succeed(`Sanitized ${sanitizedCount} file(s) (removed BOM)`);
        }
        else {
            spinner.succeed('No BOM found in files');
        }
    }
    catch (error) {
        spinner.fail('Failed to sanitize files');
        throw error;
    }
}
async function getLatestTag() {
    const spinner = ora('Fetching latest template version...').start();
    try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${TEMPLATE_REPO}/releases/latest`);
        if (!response.ok) {
            throw new Error(`Failed to fetch latest release: ${response.statusText}`);
        }
        const release = await response.json();
        spinner.succeed(`Latest template version: ${chalk.green(release.tag_name)}`);
        return release.tag_name;
    }
    catch (error) {
        spinner.fail('Failed to fetch latest version, using v0.1.0 as fallback');
        console.warn(chalk.yellow('Warning:'), error instanceof Error ? error.message : 'Unknown error');
        return 'v0.1.0';
    }
}
async function downloadTemplate(ref, targetDir) {
    const spinner = ora(`Downloading template from ${chalk.cyan(ref)}...`).start();
    try {
        const archiveUrl = `${GITHUB_ARCHIVE_BASE}/${TEMPLATE_REPO}/archive/${ref}.tar.gz`;
        const response = await fetch(archiveUrl);
        if (!response.ok) {
            throw new Error(`Failed to download template: ${response.statusText}`);
        }
        if (!response.body) {
            throw new Error('No response body received');
        }
        // Create target directory
        await fs.mkdir(targetDir, { recursive: true });
        // Extract tar.gz directly to target directory
        await new Promise((resolve, reject) => {
            const extractStream = tar.extract({
                cwd: targetDir,
                strip: 1, // Remove the top-level directory from the archive
            });
            response.body.pipe(extractStream);
            extractStream.on('end', resolve);
            extractStream.on('error', reject);
        });
        spinner.succeed(`Template downloaded to ${chalk.green(targetDir)}`);
        // Sanitize BOM from downloaded files
        await sanitizeBOM(targetDir);
    }
    catch (error) {
        spinner.fail('Failed to download template');
        throw error;
    }
}
async function updatePackageJson(projectDir, projectName) {
    const spinner = ora('Updating package.json...').start();
    try {
        const packageJsonPath = path.join(projectDir, 'package.json');
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        // Update project name
        packageJson.name = projectName;
        // Write back to file
        const jsonString = JSON.stringify(packageJson, null, 2) + "\n";
        await fs.writeFile(packageJsonPath, jsonString, { encoding: "utf8" });
        spinner.succeed('Package.json updated');
    }
    catch (error) {
        spinner.fail('Failed to update package.json');
        throw error;
    }
}
function detectPackageManager() {
    // In CI environments, prefer npm for better compatibility
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    if (isCI) {
        return 'npm';
    }
    // Check for pnpm first (most reliable in local development)
    try {
        execSync('pnpm --version', { stdio: 'ignore' });
        // Test if pnpm can actually run install command
        execSync('pnpm --help', { stdio: 'ignore' });
        return 'pnpm';
    }
    catch { }
    // Check for yarn with more robust detection
    try {
        execSync('yarn --version', { stdio: 'ignore' });
        // Test if yarn can actually run install command in a safe way
        execSync('yarn --help', { stdio: 'ignore' });
        return 'yarn';
    }
    catch { }
    // Fallback to npm (always available in Node.js environments)
    return 'npm';
}
async function installDependencies(projectDir, packageManager) {
    const spinner = ora(`Installing dependencies with ${chalk.cyan(packageManager)}...`).start();
    try {
        const installCommand = packageManager === 'yarn' ? 'yarn install' : `${packageManager} install`;
        execSync(installCommand, {
            cwd: projectDir,
            stdio: 'ignore',
        });
        spinner.succeed('Dependencies installed successfully');
    }
    catch (error) {
        // If yarn fails, try with npm as fallback
        if (packageManager === 'yarn') {
            spinner.text = 'Yarn failed, trying with npm...';
            try {
                execSync('npm install', {
                    cwd: projectDir,
                    stdio: 'ignore',
                });
                spinner.succeed('Dependencies installed successfully with npm (yarn fallback)');
                return;
            }
            catch (npmError) {
                spinner.fail('Failed to install dependencies with both yarn and npm');
                console.error(chalk.red('Yarn error:'), error instanceof Error ? error.message : 'Unknown error');
                console.error(chalk.red('NPM error:'), npmError instanceof Error ? npmError.message : 'Unknown error');
                throw npmError;
            }
        }
        spinner.fail('Failed to install dependencies');
        throw error;
    }
}
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
function validateProjectName(name) {
    // npm-safe validation: lowercase, kebab-case, no spaces
    const npmSafeRegex = /^[a-z0-9-]+$/;
    return npmSafeRegex.test(name) && !name.startsWith('-') && !name.endsWith('-');
}
function resolveInputs(projectName, cliOptions) {
    // Priority: CLI flags → Environment variables → defaults
    const options = {
        projectName,
        ref: cliOptions.ref,
        noInstall: !cliOptions.install, // Commander converts --no-install to install: false
        noCleanup: !cliOptions.cleanup, // Commander converts --no-cleanup to cleanup: false
        yes: cliOptions.yes || cliOptions.Y || false // Handle both --yes and -y
    };
    // Handle API routes option
    if (cliOptions.api !== undefined) {
        options.useApi = cliOptions.api;
    }
    else if (process.env.CREATE_ASTRO_API !== undefined) {
        options.useApi = process.env.CREATE_ASTRO_API === '1';
    }
    // If not set via flags or env, will be prompted
    // Handle yes/auto-accept option
    if (process.env.CREATE_ASTRO_YES === '1') {
        options.yes = true;
    }
    return options;
}
function displaySummary(projectDir, projectName, packageManager, installed, apiEnabled, cleanupResult) {
    console.log('\n' + chalk.green('✨ Project scaffolded successfully!'));
    console.log('\n' + chalk.bold('📁 Project Structure:'));
    console.log(`   ${chalk.cyan(projectName)}/`);
    console.log(`   ├── ${chalk.gray('src/')}`);
    console.log(`   │   ├── ${chalk.gray('components/')}`);
    console.log(`   │   ├── ${chalk.gray('pages/')}`);
    if (apiEnabled) {
        console.log(`   │   │   └── ${chalk.yellow('api/')} ${chalk.green('(enabled)')}`);
    }
    console.log(`   │   ├── ${chalk.gray('layout/')}`);
    console.log(`   │   └── ${chalk.gray('styles/')}`);
    console.log(`   ├── ${chalk.gray('public/')}`);
    console.log(`   ├── ${chalk.yellow('package.json')}`);
    console.log(`   ├── ${chalk.yellow('astro.config.mjs')}`);
    console.log(`   └── ${chalk.yellow('tsconfig.json')}`);
    // Show cleanup results if available
    if (cleanupResult && (cleanupResult.filesRemoved > 0 || cleanupResult.foldersRemoved > 0)) {
        console.log('\n' + chalk.bold('🧹 Cleanup Summary:'));
        console.log(`   Removed ${cleanupResult.filesRemoved} files and ${cleanupResult.foldersRemoved} folders`);
        if (cleanupResult.removedItems.length > 0) {
            const displayItems = cleanupResult.removedItems.slice(0, 10);
            console.log(`   ${chalk.gray('Items removed:')} ${displayItems.join(', ')}`);
            if (cleanupResult.removedItems.length > 10) {
                console.log(`   ${chalk.gray('... and')} ${cleanupResult.removedItems.length - 10} ${chalk.gray('more')}`);
            }
        }
    }
    console.log('\n' + chalk.bold('🚀 Next Steps:'));
    console.log(`   ${chalk.cyan('cd')} ${projectName}`);
    if (!installed) {
        const installCmd = packageManager === 'yarn' ? 'yarn install' : `${packageManager} install`;
        console.log(`   ${chalk.cyan(installCmd)}`);
    }
    const devCmd = packageManager === 'yarn' ? 'yarn dev' : `${packageManager} run dev`;
    console.log(`   ${chalk.cyan(devCmd)}`);
    console.log('\n' + chalk.bold('📚 Features included:'));
    console.log(`   • ${chalk.green('Astro')} with SSR support`);
    console.log(`   • ${chalk.blue('React')} + ${chalk.blue('TypeScript')}`);
    console.log(`   • ${chalk.magenta('Tailwind CSS v4')}`);
    console.log(`   • ${chalk.red('Zod')} validation`);
    console.log(`   • ${chalk.gray('ESLint + Prettier')}`);
    if (apiEnabled) {
        console.log(`   • ${chalk.yellow('API Routes')} ${chalk.green('enabled')}`);
    }
    else {
        console.log(`   • ${chalk.yellow('API Routes')} ${chalk.red('disabled')}`);
    }
}
async function createProject(options) {
    let { projectName, ref, noInstall, useApi, noCleanup, yes } = options;
    const isTTY = process.stdout.isTTY && !yes;
    // 1. Resolve inputs - Prompt for project name if not provided
    if (!projectName && isTTY) {
        const response = await prompts({
            type: 'text',
            name: 'projectName',
            message: 'Project name:',
            initial: 'my-astro-app',
            validate: (value) => {
                if (value.length === 0)
                    return 'Project name is required';
                const kebabName = toKebabCase(value);
                if (!validateProjectName(kebabName)) {
                    return 'Project name must be npm-safe (lowercase, kebab-case, no spaces)';
                }
                return true;
            }
        });
        if (!response.projectName) {
            console.log(chalk.red('Operation cancelled'));
            process.exit(1);
        }
        projectName = response.projectName;
    }
    // Ensure projectName is defined
    if (!projectName) {
        if (isTTY) {
            console.error(chalk.red('Error: Project name is required'));
        }
        else {
            projectName = 'my-astro-app'; // Default for non-TTY
        }
    }
    // Convert to kebab-case and validate
    const kebabProjectName = toKebabCase(projectName);
    if (!validateProjectName(kebabProjectName)) {
        console.error(chalk.red('Error: Invalid project name. Must be npm-safe (lowercase, kebab-case, no spaces)'));
        process.exit(1);
    }
    const projectDir = path.resolve(kebabProjectName);
    // Check if directory already exists
    try {
        await fs.access(projectDir);
        if (isTTY) {
            const overwriteResponse = await prompts({
                type: 'confirm',
                name: 'overwrite',
                message: `Directory ${kebabProjectName} already exists. Overwrite?`,
                initial: false
            });
            if (!overwriteResponse.overwrite) {
                console.log(chalk.red('Operation cancelled'));
                process.exit(1);
            }
            // Remove existing directory
            await fs.rm(projectDir, { recursive: true, force: true });
        }
        else {
            console.error(chalk.red(`Error: Directory ${kebabProjectName} already exists`));
            process.exit(1);
        }
    }
    catch {
        // Directory doesn't exist, which is what we want
    }
    // 2. Prompt for API routes if not set via flags/env
    if (useApi === undefined && isTTY) {
        const apiResponse = await prompts({
            type: 'confirm',
            name: 'useApi',
            message: 'Use API routes?',
            initial: true // Default: Yes
        });
        useApi = apiResponse.useApi ?? true; // Default to true if cancelled
    }
    else if (useApi === undefined) {
        useApi = true; // Default for non-interactive
    }
    try {
        // 3. Download template
        const templateRef = ref || await getLatestTag();
        await downloadTemplate(templateRef, projectDir);
        // 4. Sanitize BOM
        await sanitizeBOM(projectDir);
        // 5. Cleanup dev files (unless --no-cleanup)
        let cleanupResult;
        if (!noCleanup) {
            cleanupResult = await cleanupDevFiles(projectDir, { keepApi: useApi ?? true });
        }
        // 6. Update package.json
        await updatePackageJson(projectDir, kebabProjectName);
        // 7. Install dependencies
        let dependenciesInstalled = false;
        if (!noInstall) {
            const packageManager = detectPackageManager();
            await installDependencies(projectDir, packageManager);
            dependenciesInstalled = true;
        }
        // 8. Display success summary
        const packageManager = detectPackageManager();
        displaySummary(projectDir, kebabProjectName, packageManager, dependenciesInstalled, useApi ?? true, cleanupResult);
    }
    catch (error) {
        console.error(chalk.red('Error creating project:'), error instanceof Error ? error.message : 'Unknown error');
        // Cleanup on error
        try {
            await fs.rm(projectDir, { recursive: true, force: true });
        }
        catch {
            // Ignore cleanup errors
        }
        process.exit(1);
    }
}
// CLI Setup
const program = new Command();
program
    .name('create-astro')
    .description('Create a new Astro project with React and TypeScript')
    .version('0.1.0')
    .argument('[project-name]', 'Name of the project')
    .option('--ref <ref>', 'Git reference (tag, branch, or commit) to use')
    .option('--no-install', 'Skip dependency installation')
    .option('--api', 'Include API routes')
    .option('--no-api', 'Exclude API routes')
    .option('--yes, -y', 'Auto accept defaults (non-interactive mode)')
    .option('--no-cleanup', 'Skip cleanup of development files (for debugging)')
    .action(async (projectName, cliOptions) => {
    // Handle conflicting API options
    if (cliOptions.api && cliOptions.noApi) {
        console.error(chalk.red('Error: Cannot use both --api and --no-api flags'));
        process.exit(1);
    }
    // Convert --no-api to api: false
    if (cliOptions.noApi) {
        cliOptions.api = false;
    }
    // Resolve all inputs with priority: flags → env → defaults
    const options = resolveInputs(projectName, cliOptions);
    await createProject(options);
});
program.parse();
//# sourceMappingURL=index.js.map