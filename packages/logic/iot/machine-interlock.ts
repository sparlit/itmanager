/**
 * MACHINE & CHEMICAL INTERLOCK ENGINE
 * Prevents industrial wash cycles unless the correct detergent is verified.
 */
export class MachineInterlock {
  /**
   * Authorizes a machine start request
   */
  static async authorizeCycle(machineId: string, batchType: string, detergentBarcode: string): Promise<boolean> {
    const requiredDetergent = this.getRequiredDetergent(batchType);

    if (detergentBarcode !== requiredDetergent) {
      console.error(`[INTERLOCK_FAIL] Machine ${machineId}: Detergent mismatch. Required: ${requiredDetergent}`);
      return false;
    }

    // MQTT: Publish 'START' command to machine PLC
    console.log(`[INTERLOCK_SUCCESS] Machine ${machineId} authorized for ${batchType} cycle.`);
    return true;
  }

  private static getRequiredDetergent(batchType: string): string {
    const map: Record<string, string> = {
      'SILK': 'DET_ALPHA_01',
      'COTTON': 'DET_BETA_05',
      'INDUSTRIAL': 'DET_GAMMA_99'
    };
    return map[batchType] || 'DET_GENERIC';
  }
}
