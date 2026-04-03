import type { ComplianceRepository } from "../data/repository.js";

export class FrameworkService {
  constructor(private readonly repo: ComplianceRepository) {}

  listFrameworks() {
    return this.repo.listFrameworks();
  }
}
