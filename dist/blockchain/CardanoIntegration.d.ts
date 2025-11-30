export interface PaymentParams {
    agentId: string;
    amount: number;
    taskId: string;
}
export interface PaymentResult {
    success: boolean;
    txHash: string;
    amount: number;
    timestamp: Date;
}
export declare class CardanoIntegration {
    private walletAddress?;
    private networkId;
    private walletConnected;
    initialize(): Promise<void>;
    private connectWallet;
    executePayment(params: PaymentParams): Promise<PaymentResult>;
    logWorkflowEvent(workflowId: string, eventType: string, eventData: any): Promise<string>;
    private logPaymentEvent;
    verifyTransaction(txHash: string): Promise<boolean>;
    getTransactionDetails(txHash: string): Promise<any>;
    getWalletBalance(): Promise<number>;
    createEscrowContract(params: {
        amount: number;
        agentId: string;
        taskId: string;
        releaseConditions: any;
    }): Promise<string>;
    releaseEscrow(contractAddress: string, taskCompleted: boolean): Promise<string>;
    getOnChainReputation(agentId: string): Promise<any>;
    private generateMockTxHash;
    private generateRandomString;
    private simulateBlockchainConfirmation;
    getNetworkStatus(): Promise<any>;
}
//# sourceMappingURL=CardanoIntegration.d.ts.map