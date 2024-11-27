export default class OperationBuffer {
  constructor() {
    this.busy = 0;
    this.op = "";
    this.vj = "";
    this.vk = "";
    this.qj = "";
    this.qk = "";
    this.a = "";
    this.indexInRegisterFile = -1;
    this.indexInSummary = -1;
  }
}
