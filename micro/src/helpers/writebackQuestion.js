import OperationBuffer from "../buffers/operationBuffer";
import StoreBuffer from "../buffers/storeBuffer";
import LoadBuffer from "../buffers/loadBuffer";

const instructionToWriteBack = (
  arrayOfInstructionTags,
  mulBuffer,
  addBuffer,
  storeBuffer
) => {
  //takes as input an array of all instruction tags that can be written back (pushed onto CDB) !!!at this clk cycle!!!
  const instructionTagsWithAppearances =
    arrayOfInstructionTags.length &&
    arrayOfInstructionTags.map((item) => ({
      tag: item,
      appeared: 0,
    }));
  //loops on all buffers (mulBuffer, addBuffer and storeBuffer only) and keeps track for each of the input instruction tag how many times they appear in the Qj / Qk / Q
  mulBuffer.map((record) => {
    const qj = record?.qj;
    const qk = record?.qk;
    if (qj || qk)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === qj || element?.tag === qk)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });
  addBuffer.map((record) => {
    const qj = record?.qj;
    const qk = record?.qk;
    if (qj || qk)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === qj || element?.tag === qk)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });
  storeBuffer.map((record) => {
    const q = record?.q;
    if (q)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === q)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });

  //compare the number of appearances for each of the input instruction tags
  //-----------//
  //if equal ==> return the instruction tag at the first index
  //else ==> return the instruction tag which has the most appearances
  return (
    instructionTagsWithAppearances.length &&
    instructionTagsWithAppearances.reduce(
      (maxElement, currentElement) => {
        return currentElement?.appeared > maxElement?.appeared
          ? currentElement
          : maxElement;
      },
      { appeared: -Infinity }
    )
  );
};

const updateOperationBuffer = (
  buffer,
  instructionTag,
  newValue,
  operationIndex = null
) =>
  buffer.map((record, index) => {
    if (record?.qj === instructionTag?.tag)
      return { ...record, vj: newValue, qj: "" };
    if (record?.qk === instructionTag?.tag)
      return { ...record, vk: newValue, qk: "" };
    if (operationIndex !== null && index === operationIndex)
      return new OperationBuffer();
    return record;
  });

const updateRegisterFile = (
  registerFile,
  instructionTag,
  newValue,
  indexInRegisterFile
) =>
  registerFile.map((record, index) => {
    if (index === indexInRegisterFile) {
      if (record?.qi === instructionTag?.tag)
        return { ...record, value: newValue, qi: "0" };
      return { ...record, value: newValue };
    }
    return record;
  });

const updateSummary = (summary, indexInSummary, GLOBAL_CLK) =>
  summary.map((record, index) => {
    if (index === indexInSummary)
      return { ...record, writeBack: GLOBAL_CLK, location: "" };
    return record;
  });

const WritebackQuestion = (
  GLOBAL_CLK,
  mulBuffer,
  addBuffer,
  storeBuffer,
  loadBuffer,
  summary,
  setRegisterFile,
  setMulBuffer,
  setAddBuffer,
  setStoreBuffer,
  setLoadBuffer,
  setSummary
) => {
  //arrayOfInstructionTags ==> loop on (summary) and check for each record if anything after ... && writeBack === -1)
  //-----------//
  //if true ==> add the summary.location to the arrayOfInstructionTags
  //else ==> do nothing

  // TESTING //

  //   console.log(`mulBuffer in WritebackComponent: ${JSON.stringify(mulBuffer)}`);
  //   console.log(`addBuffer in WritebackComponent: ${JSON.stringify(addBuffer)}`);
  //   console.log(`SUMMARY in WritebackComponent: ${JSON.stringify(summary)}`);

  //         //

  //GLOBAL_CLK > parseInt(record?.executionComplete.split("...")[1]) ==> cannot writeback in same cycle as complete execution

  //console.log(`loadBuffer 0: ${JSON.stringify(loadBuffer)}`);

  const arrayOfInstructionTags =
    summary?.length &&
    summary
      .filter((record) => {
        const executionComplete = record?.executionComplete;

        // console.log(GLOBAL_CLK);
        // console.log(
        //   `executionComplete: ${
        //     executionComplete === "" ? "Empty" : executionComplete
        //   }`
        // );
        // console.log("-----------");

        return (
          (executionComplete &&
            executionComplete.includes("...") &&
            executionComplete.split("...")[0] &&
            executionComplete.split("...")[1] &&
            record?.writeBack === -1 &&
            GLOBAL_CLK > parseInt(executionComplete.split("...")[1])) ||
          (executionComplete &&
            !executionComplete.includes("...") &&
            Number(executionComplete.split("...")[0]) &&
            record?.writeBack === -1 &&
            GLOBAL_CLK > parseInt(executionComplete.split("...")[0]))
        );
      })
      .map((filteredRecord) => filteredRecord?.location);

  if (!arrayOfInstructionTags?.length)
    return console.log("nothing ready for writeback");

  //console.log(`arrayOfInstructionTags: ${arrayOfInstructionTags}`);

  //console.log(`loadBuffer 2: ${JSON.stringify(loadBuffer)}`);

  const instructionTag = instructionToWriteBack(
    arrayOfInstructionTags,
    mulBuffer,
    addBuffer,
    storeBuffer
  );

  //console.log(`loadBuffer 1: ${JSON.stringify(loadBuffer)}`);
  //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);

  //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);

  const tagLetter = instructionTag?.tag[0];

  //console.log(`tagLetter: ${tagLetter}`);

  //get operation, register 1 and 2 in case of MUL / DIV / ADD / SUB
  //get operation and address in case of L.D / L.S
  let newValue;
  switch (tagLetter) {
    case "M":
    case "A": {
      const buffer = tagLetter === "M" ? mulBuffer : addBuffer;
      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      const indexInRegisterFile = buffer[indexInBuffer]?.indexInRegisterFile;
      const indexInSummary = buffer[indexInBuffer]?.indexInSummary;
      const operationString =
        summary[indexInSummary]?.instruction.split(" ")[0];
      const operation =
        operationString === "MUL.D"
          ? "*"
          : operationString === "DIV.D"
          ? "/"
          : operationString === "ADD.D"
          ? "+"
          : "-";
      newValue = `${buffer[indexInBuffer]?.vj}${operation}${buffer[indexInBuffer]?.vk}`;

      setMulBuffer((prevBuffer) =>
        updateOperationBuffer(
          prevBuffer,
          instructionTag,
          newValue,
          tagLetter === "M" ? indexInBuffer : null
        )
      );

      setAddBuffer((prevBuffer) =>
        updateOperationBuffer(
          prevBuffer,
          instructionTag,
          newValue,
          tagLetter === "A" ? indexInBuffer : null
        )
      );

      setStoreBuffer((prevBuffer) =>
        prevBuffer.map((record) =>
          record?.q === instructionTag?.tag
            ? { ...record, v: newValue, q: "" }
            : record
        )
      );

      setRegisterFile((prevRegisterFile) =>
        updateRegisterFile(
          prevRegisterFile,
          instructionTag,
          newValue,
          indexInRegisterFile
        )
      );

      setSummary((prevSummary) =>
        updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
      );
      break;
    }
    case "L":
    case "S": {
      const buffer = tagLetter === "L" ? loadBuffer : storeBuffer;
      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      const indexInRegisterFile = buffer[indexInBuffer].indexInRegisterFile;
      const indexInSummary = buffer[indexInBuffer]?.indexInSummary;
      const operationString =
        summary[indexInSummary]?.instruction.split(" ")[0];
      const address = summary[indexInSummary]?.instruction.split(" ")[2];
      const type = operationString.includes(".")
        ? operationString.split(".")[1]
        : operationString.slice(1);
      newValue = `mem[${address}]`;

      if (type === "S") console.log("load-single");
      else if (type === "D") console.log("load-double");

      //non floating point should not enter here

      //update the loadBuffer/storeBuffer
      setLoadBuffer((prevBuffer) => {
        //console.log(`loadBuffer before: ${JSON.stringify(prevBuffer)}`);
        const updatedBuffer = prevBuffer.map((record, index) => {
          if (index === indexInBuffer && tagLetter === "L")
            return new LoadBuffer();
          return record;
        });
        //console.log(`loadBuffer after: ${JSON.stringify(updatedBuffer)}`);
        return updatedBuffer;
      });

      setStoreBuffer((prevBuffer) => {
        //console.log(`storeBuffer before: ${JSON.stringify(prevBuffer)}`);
        const updatedBuffer = prevBuffer.map((record, index) => {
          //console.log(`instructionTag?.tag: ${instructionTag?.tag}`);
          //console.log(`record?.q: ${record?.q}`);
          if (record?.q === instructionTag?.tag)
            return { ...record, v: newValue, q: "" };
          if (index === indexInBuffer && tagLetter === "S")
            return new StoreBuffer();
          return record;
        });
        //console.log(`storeBuffer after: ${JSON.stringify(updatedBuffer)}`);
        return updatedBuffer;
      });

      //in any other buffer that needs it, go from qj/qk to vj/vk
      setAddBuffer((prevBuffer) =>
        updateOperationBuffer(prevBuffer, instructionTag, newValue, null)
      );

      setMulBuffer((prevBuffer) =>
        updateOperationBuffer(prevBuffer, instructionTag, newValue, null)
      );

      //set qi to 0 in register file, set value to result of mem[address];
      //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);
      setRegisterFile((prevRegisterFile) => {
        // console.log(
        //   `prevRegisterFile before: ${JSON.stringify(prevRegisterFile)}`
        // );
        const updatedRegisterFile = updateRegisterFile(
          prevRegisterFile,
          instructionTag,
          newValue,
          indexInRegisterFile
        );
        // console.log(
        //   `prevRegisterFile after: ${JSON.stringify(updatedRegisterFile)}`
        // );
        return updatedRegisterFile;
      });

      //write current clk cycle to summary
      // console.log(`tagLetter: ${tagLetter}`);
      // console.log(`buffer: ${JSON.stringify(buffer)}`);
      // console.log(`indexInSummary: ${indexInSummary}`);
      setSummary((prevSummary) =>
        updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
      );
      break;
    }
  }
};

export default WritebackQuestion;
