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
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_ARCHIVE_BASE = 'https://github.com';

interface TemplateOptions {
  projectName?: string;
  ref?: string;
  noInstall?: boolean;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
}

async function getLatestTag(): Promise<string> {
  const spinner = ora('Fetching latest template version...').start();
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${TEMPLATE_REPO}/releases/latest`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch latest release: ${response.statusText}`);
    }
    
    const release: GitHubRelease = await response.json() as GitHubRelease;
    spinner.succeed(`Latest template version: ${chalk.green(release.tag_name)}`);
    
    return release.tag_name;
  } catch (error) {
    spinner.fail('Failed to fetch latest version, using v0.1.0 as fallback');
    console.warn(chalk.yellow('Warning:'), error instanceof Error ? error.message : 'Unknown error');
    return 'v0.1.0';
  }
}

async function downloadTemplate(ref: string, targetDir: string): Promise<void> {
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
    await new Promise<void>((resolve, reject) => {
      const extractStream = tar.extract({
        cwd: targetDir,
        strip: 1, // Remove the top-level directory from the archive
      });
      
      response.body!.pipe(extractStream);
      
      extractStream.on('end', resolve);
      extractStream.on('error', reject);
    });
    
    spinner.succeed(`Template downloaded to ${chalk.green(targetDir)}`);
  } catch (error) {
    spinner.fail('Failed to download template');
    throw error;
  }
}

async function updatePackageJson(projectDir: string, projectName: string): Promise<void> {
  const spinner = ora('Updating package.json...').start();
  
  try {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Update project name
    packageJson.name = projectName;
    
    // Write back to file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    spinner.succeed('Package.json updated');
  } catch (error) {
    spinner.fail('Failed to update package.json');
    throw error;
  }
}

function detectPackageManager(): string {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {}
  
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {}
  
  return 'npm';
}

async function installDependencies(projectDir: string, packageManager: string): Promise<void> {
  const spinner = ora(`Installing dependencies with ${chalk.cyan(packageManager)}...`).start();
  
  try {
    const installCommand = packageManager === 'yarn' ? 'yarn install' : `${packageManager} install`;
    
    execSync(installCommand, {
      cwd: projectDir,
      stdio: 'ignore',
    });
    
    spinner.succeed('Dependencies installed successfully');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function displaySummary(projectDir: string, projectName: string, packageManager: string, installed: boolean): void {
  console.log('\n' + chalk.green('✨ Project scaffolded successfully!'));
  console.log('\n' + chalk.bold('📁 Project Structure:'));
  console.log(`   ${chalk.cyan(projectName)}/`);
  console.log(`   ├── ${chalk.gray('src/')}`); 
  console.log(`   │   ├── ${chalk.gray('components/')}`);
  console.log(`   │   ├── ${chalk.gray('pages/')}`);
  console.log(`   │   ├── ${chalk.gray('layout/')}`);
  console.log(`   │   └── ${chalk.gray('styles/')}`);
  console.log(`   ├── ${chalk.gray('public/')}`);
  console.log(`   ├── ${chalk.yellow('package.json')}`);
  console.log(`   ├── ${chalk.yellow('astro.config.mjs')}`);
  console.log(`   └── ${chalk.yellow('tsconfig.json')}`);
  
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
  console.log(`   • ${chalk.yellow('API Routes')} example`);
}

async function createProject(options: TemplateOptions): Promise<void> {
  let { projectName, ref, noInstall } = options;
  
  // Prompt for project name if not provided
  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-astro-project',
      validate: (value: string) => value.length > 0 ? true : 'Project name is required'
    });
    
    if (!response.projectName) {
      console.log(chalk.red('Operation cancelled'));
      process.exit(1);
    }
    
    projectName = response.projectName;
  }
  
  // Ensure projectName is defined at this point
  if (!projectName) {
    console.error(chalk.red('Error: Project name is required'));
    process.exit(1);
  }
  
  // Convert to kebab-case
  const kebabProjectName = toKebabCase(projectName);
  const projectDir = path.resolve(kebabProjectName);
  
  // Check if directory already exists
  try {
    await fs.access(projectDir);
    console.error(chalk.red(`Error: Directory ${kebabProjectName} already exists`));
    process.exit(1);
  } catch {
    // Directory doesn't exist, which is what we want
  }
  
  try {
    // Get template reference (tag/branch/commit)
    const templateRef = ref || await getLatestTag();
    
    // Download and extract template
    await downloadTemplate(templateRef, projectDir);
    
    // Update package.json with project name
    await updatePackageJson(projectDir, kebabProjectName);
    
    // Install dependencies if not skipped
    let dependenciesInstalled = false;
    if (!noInstall) {
      const packageManager = detectPackageManager();
      await installDependencies(projectDir, packageManager);
      dependenciesInstalled = true;
    }
    
    // Display success summary
    const packageManager = detectPackageManager();
    displaySummary(projectDir, kebabProjectName, packageManager, dependenciesInstalled);
    
  } catch (error) {
    console.error(chalk.red('Error creating project:'), error instanceof Error ? error.message : 'Unknown error');
    
    // Cleanup on error
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch {
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
  .action(async (projectName: string | undefined, options: { ref?: string; noInstall?: boolean }) => {
    await createProject({
      projectName,
      ref: options.ref,
      noInstall: options.noInstall
    });
  });

program.parse();
