export default class Summary {
  constructor(
    iteration = -1,
    instruction = "",
    j = "",
    k = "",
    issue = -1,
    executionComplete = "",
    writeBack = -1,
    location = "",
    missMiss = true
  ) {
    this.iteration = iteration;
    this.instruction = instruction;
    this.j = j;
    this.k = k;
    this.issue = issue;
    this.executionComplete = executionComplete;
    this.writeBack = writeBack;
    this.location = location;
    this.missMiss = missMiss;
  }
}
