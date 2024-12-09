export default class Cache {
  constructor(address = -1, which = -1, value = "empty") {
    this.address = address;
    this.which = which;
    this.value = value;
  }
}
