export default class StoreBuffer {
  constructor() {
    this.busy = 0;
    this.address = -1;
    this.v = "";
    this.q = "";
    this.indexInRegisterFile = -1;
    this.indexInSummary = -1;
  }
}
