import * as crypto from 'crypto';

/**
 * Merkle tree implementation for evidence integrity verification
 * Allows proving that a single evidence item is part of a larger set
 */
export class MerkleTree {
  private leaves: string[] = [];
  private tree: string[][] = [];

  constructor(leaves: string[]) {
    this.leaves = leaves.sort();
    this.buildTree();
  }

  /**
   * Build merkle tree from leaves
   */
  private buildTree(): void {
    if (this.leaves.length === 0) {
      this.tree = [];
      return;
    }

    this.tree = [this.leaves];

    while (this.tree[this.tree.length - 1].length > 1) {
      const currentLevel = this.tree[this.tree.length - 1];
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // duplicate if odd
        const parent = this.hashPair(left, right);
        nextLevel.push(parent);
      }

      this.tree.push(nextLevel);
    }
  }

  /**
   * Hash two values together
   */
  private hashPair(left: string, right: string): string {
    return crypto
      .createHash('sha256')
      .update(left + right, 'hex')
      .digest('hex');
  }

  /**
   * Get merkle root (top of tree)
   */
  getRoot(): string {
    return this.tree.length > 0 ? this.tree[this.tree.length - 1][0] : '';
  }

  /**
   * Get proof path for a leaf to verify it's in the tree
   */
  getProof(leafHash: string): string[] {
    const proof: string[] = [];
    let index = this.leaves.indexOf(leafHash);

    if (index === -1) {
      throw new Error('Leaf not found in tree');
    }

    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelHashes = this.tree[level];
      const sibling = index % 2 === 0 ? levelHashes[index + 1] : levelHashes[index - 1];
      if (sibling) proof.push(sibling);
      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Verify a leaf is in the tree using proof path
   */
  static verify(leafHash: string, proof: string[], root: string): boolean {
    let current = leafHash;

    for (const sibling of proof) {
      current = crypto
        .createHash('sha256')
        .update(current + sibling, 'hex')
        .digest('hex');
    }

    return current === root;
  }

  /**
   * Get all leaves
   */
  getLeaves(): string[] {
    return [...this.leaves];
  }
}
