import { OnboardingRequest, OnboardingStatus } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface StateMachine {
    initializeRequest(request: OnboardingRequest): Promise<OnboardingRequest>;
    evaluateState(requestId: string): Promise<OnboardingStatus>;
    transitionState(requestId: string, newStatus: OnboardingStatus): Promise<OnboardingRequest>;
}
export declare class OnboardingStateMachine implements StateMachine {
    private repo;
    constructor(repo: Repository);
    initializeRequest(request: OnboardingRequest): Promise<OnboardingRequest>;
    evaluateState(requestId: string): Promise<OnboardingStatus>;
    transitionState(requestId: string, newStatus: OnboardingStatus): Promise<OnboardingRequest>;
}
//# sourceMappingURL=state-machine.d.ts.map