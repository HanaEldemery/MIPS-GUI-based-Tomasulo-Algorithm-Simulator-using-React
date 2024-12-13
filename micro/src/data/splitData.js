const SplitData = (instruction) => {
  // return data?.split(" ");
  instruction = instruction.trim();

  let label = null;
  if (instruction.includes(":")) {
    const parts = instruction.split(":", 2);
    label = parts[0].trim();
    instruction = parts[1].trim();
  }

  const match = instruction.match(/^(\S+)\s+(.*)$/);

  if (!match) {
    throw new Error("Invalid instruction format");
  }

  const operation = match[1];
  const operandsString = match[2];

  const operandList = operandsString
    .split(",")
    .map((operand) => operand.trim())
    .filter((operand) => operand.length > 0);

  const result = label
    ? [label + ":", operation, ...operandList]
    : [operation, ...operandList];

  return result;
};

export default SplitData;
