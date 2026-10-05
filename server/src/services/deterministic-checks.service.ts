import axios from 'axios';

export interface DeterministicCheck {
  name: string;
  type: 'url' | 'file' | 'test' | 'on_chain' | 'text';
  description: string;
  passed: boolean;
  evidence: string;
  errorMessage?: string;
}

/**
 * Check if a deployment URL is reachable and returns expected status
 */
export async function checkUrlReachable(url: string, expectedStatus = 200): Promise<DeterministicCheck> {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    const passed = response.status === expectedStatus;
    return {
      name: 'URL Reachable',
      type: 'url',
      description: `Check that ${url} is reachable`,
      passed,
      evidence: `Status: ${response.status}`,
    };
  } catch (error: any) {
    return {
      name: 'URL Reachable',
      type: 'url',
      description: `Check that ${url} is reachable`,
      passed: false,
      evidence: 'URL unreachable',
      errorMessage: error.message,
    };
  }
}

/**
 * Check if URL contains required text/links
 * Useful for verifying navbar items, footer links, etc.
 */
export async function checkUrlContains(url: string, requiredStrings: string[]): Promise<DeterministicCheck> {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const html = response.data;
    const found = requiredStrings.filter((str) => html.includes(str));
    const passed = found.length === requiredStrings.length;

    return {
      name: 'URL Contains Required Content',
      type: 'url',
      description: `Check that ${url} contains all required elements`,
      passed,
      evidence: `Found ${found.length}/${requiredStrings.length} required items: ${found.join(', ')}`,
    };
  } catch (error: any) {
    return {
      name: 'URL Contains Required Content',
      type: 'url',
      description: `Check that ${url} contains all required elements`,
      passed: false,
      evidence: 'Could not fetch content',
      errorMessage: error.message,
    };
  }
}

/**
 * Check if repository exists and is accessible
 */
export async function checkRepositoryExists(repoUrl: string): Promise<DeterministicCheck> {
  try {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return {
        name: 'Repository Exists',
        type: 'file',
        description: `Check that repository ${repoUrl} is accessible`,
        passed: false,
        evidence: 'Invalid repository URL format',
      };
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await axios.get(apiUrl, { timeout: 5000 });
    const passed = response.status === 200;

    return {
      name: 'Repository Exists',
      type: 'file',
      description: `Check that repository ${repoUrl} is accessible`,
      passed,
      evidence: `Repository found. Stars: ${response.data.stargazers_count}, Forks: ${response.data.forks_count}`,
    };
  } catch (error: any) {
    return {
      name: 'Repository Exists',
      type: 'file',
      description: `Check that repository ${repoUrl} is accessible`,
      passed: false,
      evidence: 'Repository not found or not accessible',
      errorMessage: error.message,
    };
  }
}

/**
 * Check if test results indicate passing
 */
export function checkTestResults(testResults: string): DeterministicCheck {
  const passed = testResults.includes('passed') || testResults.includes('success') || testResults.includes('✓');
  return {
    name: 'Tests Pass',
    type: 'test',
    description: 'Check that all tests pass',
    passed,
    evidence: passed ? 'Tests passing' : 'Tests failing or incomplete',
  };
}

/**
 * Run all deterministic checks for a milestone
 */
export async function runDeterministicChecks(
  requirement: {
    id: string;
    type: string;
    description: string;
    validationMethod?: string;
    evidenceUrl?: string;
    requiredContent?: string[];
  },
  evidenceData: {
    deploymentUrl?: string;
    repositoryUrl?: string;
    testResults?: string;
    screenshots?: string[];
    [key: string]: any;
  }
): Promise<DeterministicCheck[]> {
  const checks: DeterministicCheck[] = [];

  // Type: deployment URL reachable
  if (requirement.type === 'deployment' && evidenceData.deploymentUrl) {
    checks.push(await checkUrlReachable(evidenceData.deploymentUrl, 200));
  }

  // Type: feature/content in deployment
  if (requirement.type === 'feature' && evidenceData.deploymentUrl && requirement.requiredContent) {
    checks.push(await checkUrlContains(evidenceData.deploymentUrl, requirement.requiredContent));
  }

  // Type: repository exists
  if ((requirement.type === 'code' || requirement.type === 'file') && evidenceData.repositoryUrl) {
    checks.push(await checkRepositoryExists(evidenceData.repositoryUrl));
  }

  // Type: tests pass
  if (requirement.type === 'test' && evidenceData.testResults) {
    checks.push(checkTestResults(evidenceData.testResults));
  }

  return checks;
}
