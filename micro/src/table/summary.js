export default class Summary {
  constructor(
    iteration = -1,
    instruction = "",
    j = "",
    k = "",
    issue = -1,
    excutionComplete = "",
    writeBack = -1
  ) {
    this.iteration = iteration;
    this.instruction = instruction;
    this.j = j;
    this.k = k;
    this.issue = issue;
    this.excutionComplete = excutionComplete;
    this.writeBack = writeBack;
  }
}
