import axios, { AxiosError } from 'axios';
import { Evidence } from '../types';

export interface DeterministicCheckResult {
  requirement_id: string;
  passed: boolean;
  reason: string;
  details?: Record<string, any>;
}

export async function checkUrlReachable(
  url: string,
  expectedStatus?: number
): Promise<DeterministicCheckResult> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const statusOk = !expectedStatus || response.status === expectedStatus;
    const passed = response.status >= 200 && response.status < 400 && statusOk;

    return {
      requirement_id: 'deployment-check',
      passed,
      reason: passed
        ? `URL is reachable (${response.status})`
        : `URL returned status ${response.status}`,
      details: { status: response.status, url },
    };
  } catch (err: any) {
    return {
      requirement_id: 'deployment-check',
      passed: false,
      reason: `URL is not reachable: ${err.message}`,
      details: { url, error: err.message },
    };
  }
}

export async function checkRepositoryExists(
  repoUrl: string
): Promise<DeterministicCheckResult> {
  try {
    // Handle GitHub URLs
    let apiUrl = repoUrl;
    if (repoUrl.includes('github.com')) {
      const parts = repoUrl.replace('https://', '').replace('http://', '').split('/');
      const owner = parts[1];
      const repo = parts[2].replace('.git', '');
      apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    }

    const response = await axios.get(apiUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const passed = response.status === 200;

    return {
      requirement_id: 'repository-check',
      passed,
      reason: passed ? 'Repository exists and is accessible' : 'Repository not found',
      details: { url: repoUrl, status: response.status },
    };
  } catch (err: any) {
    return {
      requirement_id: 'repository-check',
      passed: false,
      reason: `Repository check failed: ${err.message}`,
      details: { url: repoUrl, error: err.message },
    };
  }
}

export async function checkFileExists(
  url: string,
  filePath: string
): Promise<DeterministicCheckResult> {
  try {
    const fullUrl = `${url}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    const response = await axios.head(fullUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const passed = response.status === 200;

    return {
      requirement_id: 'file-check',
      passed,
      reason: passed ? `File exists at ${filePath}` : `File not found at ${filePath}`,
      details: { url: fullUrl, status: response.status },
    };
  } catch (err: any) {
    return {
      requirement_id: 'file-check',
      passed: false,
      reason: `File check failed: ${err.message}`,
      details: { filePath, error: err.message },
    };
  }
}

export async function checkTextContent(
  text: string,
  requiredStrings: string[]
): Promise<DeterministicCheckResult> {
  const missing: string[] = [];
  for (const str of requiredStrings) {
    if (!text.includes(str)) {
      missing.push(str);
    }
  }

  const passed = missing.length === 0;

  return {
    requirement_id: 'text-content-check',
    passed,
    reason: passed
      ? `All required text found`
      : `Missing text: ${missing.join(', ')}`,
    details: { required: requiredStrings, missing },
  };
}

export async function runDeterministicChecks(
  evidence: Evidence[],
  requirements: any[]
): Promise<DeterministicCheckResult[]> {
  const results: DeterministicCheckResult[] = [];

  for (const requirement of requirements) {
    if (requirement.validation_type !== 'deterministic') continue;

    switch (requirement.type) {
      case 'deployment':
        const urlEvidence = evidence.find(e => e.type === 'url');
        if (urlEvidence) {
          const result = await checkUrlReachable(urlEvidence.content);
          results.push({ ...result, requirement_id: requirement.id });
        }
        break;

      case 'feature':
        // Could check for specific text in screenshots or repository
        break;

      case 'test':
        const repoEvidence = evidence.find(e => e.type === 'repository');
        if (repoEvidence) {
          const result = await checkRepositoryExists(repoEvidence.content);
          results.push({ ...result, requirement_id: requirement.id });
        }
        break;
    }
  }

  return results;
}
