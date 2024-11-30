export default class LoadBuffer {
  constructor() {
    this.busy = 0;
    this.address = -1;
    this.indexInRegisterFile = -1;
    this.indexInSummary = -1;
  }
}
