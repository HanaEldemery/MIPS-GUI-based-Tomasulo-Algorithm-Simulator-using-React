import OperationBuffer from "../buffers/operationBuffer";
import StoreBuffer from "../buffers/storeBuffer";
import LoadBuffer from "../buffers/loadBuffer";
import IntegerRegisterFile from "../table/integerRegisterFile";
import SplitData from "../data/splitData";

const integerToBinary = (integer) => {
  if (integer < 0 || integer > 255) {
    throw new Error("Input must be between 0 and 255 for 8-bit binary.");
  }

  let binary = "";
  while (integer > 0) {
    binary = `${integer % 2}${binary}`;
    integer = Math.floor(integer / 2);
  }

  return binary.padStart(8, "0");
};

function binaryToDecimal(binaryString) {
  if (!/^[01]+$/.test(binaryString)) {
    throw new Error("Input must be a string of 0s and 1s");
  }

  return BigInt("0b" + binaryString);
}

function decimalToBinary(number) {
  if (typeof number !== "number" && typeof number !== "parseInt") {
    throw new Error("Input must be an integer or parseInt");
  }
  if (number < 0) {
    number = 0 - number;
  }
  return number.toString(2);
}
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
    if (
      record?.qk === instructionTag?.tag &&
      record?.qj === instructionTag?.tag
    )
      return { ...record, vj: newValue, vk: newValue, qk: "", qj: "" };
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
  branchBuffer,
  loadBuffer,
  registerFile,
  integerRegisterFile,
  summary,
  setRegisterFile,
  setIntegerRegisterFile,
  setMulBuffer,
  setAddBuffer,
  setStoreBuffer,
  setLoadBuffer,
  setSummary,
  SET_STALLING,
  SET_LINE_TXT,
  SET_GLOBAL_ITERATION,
  objectLoopNameAndIndex,
  setBranchBuffer,
  cache,
  cacheSize,
  memory,
  setMemory,
  setCache
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

  if (!arrayOfInstructionTags?.length) return; //console.log("" /*"nothing ready for writeback"*/);

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
  let newValueNumber;
  switch (tagLetter) {
    case "M":
    case "A": {
      const buffer = tagLetter === "M" ? mulBuffer : addBuffer;
      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      const indexInRegisterFile = buffer[indexInBuffer]?.indexInRegisterFile;
      const indexInSummary = buffer[indexInBuffer]?.indexInSummary;
      const splitData = SplitData(summary[indexInSummary]?.instruction);
      const operationString = splitData[0];
      //const operation =
      //  operationString === "MUL.D"
      //    ? "*"
      //    : operationString === "DIV.D"
      //    ? "/"
      //    : (operationString === "ADD.D" || operationString === "ADD.S" || operationString === "DADDI")
      //    ? "+"
      //    : "-";
      //newValue = `${buffer[indexInBuffer]?.vj}${operation}${buffer[indexInBuffer]?.vk}`;
      let valueFirstRegister,
        valueSecondRegister,
        valueImmediate,
        toPutInBuffer;
      switch (operationString) {
        case "DADDI":
          toPutInBuffer = `R${indexInRegisterFile}`;
          //console.log(
          //  `parseInt(buffer[indexInBuffer]?.vj): ${parseInt(
          //    buffer[indexInBuffer]?.vj
          //  )}`
          //);
          //console.log(
          //  `undefined?: ${
          //    integerRegisterFile[parseInt(buffer[indexInBuffer]?.vj)]?.value
          //  }`
          //);
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          //console.log(`valueFirstRegister: ${valueFirstRegister}`);
          //console.log(
          //  `buffer[indexInBuffer]?.vk: ${buffer[indexInBuffer]?.vk}`
          //);
          valueFirstRegister = BigInt(
            integerRegisterFile[
              parseInt(buffer[indexInBuffer]?.vj?.split("R")[1])
            ]?.value
          );
          valueImmediate = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister + valueImmediate;
          //console.log(`newValue: ${newValue}`);
          break;
        case "DSUBI":
          toPutInBuffer = `R${indexInRegisterFile}`;
          valueFirstRegister = BigInt(
            integerRegisterFile[
              parseInt(buffer[indexInBuffer]?.vj?.split("R")[1])
            ]?.value
          );
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          valueImmediate = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister - valueImmediate;
          break;
        case "MUL.D":
        case "MUL.S":
          toPutInBuffer = `F${indexInRegisterFile}`;
          valueFirstRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vj?.split("F")[1])]
              ?.value
          );
          valueSecondRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vk?.split("F")[1])]
              ?.value
          );
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          //valueSecondRegister = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister * valueSecondRegister;
          break;
        case "DIV.D":
        case "DIV.S":
          toPutInBuffer = `F${indexInRegisterFile}`;
          valueFirstRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vj?.split("F")[1])]
              ?.value
          );
          valueSecondRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vk?.split("F")[1])]
              ?.value
          );
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          //valueSecondRegister = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister / valueSecondRegister;
          break;
        case "ADD.D":
        case "ADD.S":
          toPutInBuffer = `F${indexInRegisterFile}`;
          valueFirstRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vj?.split("F")[1])]
              ?.value
          );
          valueSecondRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vk?.split("F")[1])]
              ?.value
          );
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          //valueSecondRegister = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister + valueSecondRegister;
          break;
        case "SUB.D":
        case "SUB.S":
          toPutInBuffer = `F${indexInRegisterFile}`;
          valueFirstRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vj?.split("F")[1])]
              ?.value
          );
          valueSecondRegister = parseInt(
            registerFile[parseInt(buffer[indexInBuffer]?.vk?.split("F")[1])]
              ?.value
          );
          //valueFirstRegister = BigInt(buffer[indexInBuffer]?.vj);
          //valueSecondRegister = BigInt(buffer[indexInBuffer]?.vk);
          newValueNumber = valueFirstRegister - valueSecondRegister;
          break;
      }

      const newValue = `${newValueNumber}`;
      //console.log(`newValue: ${newValue}`);
      //console.log(`typeof newValue: ${typeof newValue}`);
      //console.log(`toPutInBuffer: ${toPutInBuffer}`);
      setMulBuffer((prevBuffer) =>
        updateOperationBuffer(
          prevBuffer,
          instructionTag,
          toPutInBuffer,
          tagLetter === "M" ? indexInBuffer : null
        )
      );

      //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);
      //console.log(`toPutInBuffer: ${toPutInBuffer}`);
      setAddBuffer((prevBuffer) =>
        updateOperationBuffer(
          prevBuffer,
          instructionTag,
          toPutInBuffer,
          tagLetter === "A" ? indexInBuffer : null
        )
      );

      //check this 12-12-2024
      setBranchBuffer((prevBuffer) =>
        updateOperationBuffer(
          prevBuffer,
          instructionTag,
          toPutInBuffer,
          tagLetter === "B" ? indexInBuffer : null
        )
      );

      //check 12-12-2024
      setStoreBuffer((prevBuffer) =>
        prevBuffer.map((record) =>
          record?.q === instructionTag?.tag
            ? { ...record, v: toPutInBuffer, q: "" }
            : record
        )
      );

      //check 12-12-2024
      //console.log(`newValue: ${newValue}`);
      //console.log(`typeof newValue: ${typeof newValue}`);
      if (operationString === "DADDI" || operationString === "DSUBI")
        setIntegerRegisterFile((prevRegisterFile) =>
          updateRegisterFile(
            prevRegisterFile,
            instructionTag,
            newValue,
            indexInRegisterFile
          )
        );
      else {
        setRegisterFile((prevRegisterFile) =>
          updateRegisterFile(
            prevRegisterFile,
            instructionTag,
            newValue,
            indexInRegisterFile
          )
        );
      }

      setSummary((prevSummary) =>
        updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
      );
      break;
    }
    case "L":
    case "S": {
      const buffer = tagLetter === "L" ? loadBuffer : storeBuffer;
      //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);
      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      //console.log(`indexInBuffer: ${indexInBuffer}`);
      const indexInSummary = buffer[indexInBuffer]?.indexInSummary;
      const splitData = SplitData(summary[indexInSummary]?.instruction);
      const types = splitData[0];
      let startAdrString = splitData[2];
      let startAdr = parseInt(startAdrString);
      const indexInRegisterFileString = splitData[1];
      const indexInRegisterFileToParse = indexInRegisterFileString.substring(1);
      const indexInRegisterFile = parseInt(indexInRegisterFileToParse);
      //const indexInRegisterFile = indexInRegisterFileString.substring(1);
      //const indexInRegisterFile = buffer[indexInBuffer].indexInRegisterFile;
      //console.log(`indexInRegisterFile: ${indexInRegisterFile}`);

      //console.log("type: " + types);
      //console.log("startAdr: " + startAdr);
      //console.log("cacheSize: " + cacheSize);
      //console.log("cache: " + JSON.stringify(cache));
      //console.log("memory: " + JSON.stringify(memory));

      let decFromRegPrev;
      if (
        types === "L.S" ||
        types === "L.D" ||
        types === "S.S" ||
        types === "S.D"
      )
        decFromRegPrev = registerFile[indexInRegisterFile]?.value;
      else decFromRegPrev = integerRegisterFile[indexInRegisterFile]?.value;

      //console.log("ana fel " + types + " delwa2ty");
      //console.log("decFromRegPrev: " + decFromRegPrev);

      let decFromReg = parseInt(decFromRegPrev);
      //console.log("decFromReg: " + decFromReg);

      let stopAdr = -1;
      switch (types) {
        case "LW":
        case "L.S":
        case "SW":
        case "S.S":
          stopAdr = startAdr + 3;
          break;
        case "LD":
        case "L.D":
        case "SD":
        case "S.D":
          stopAdr = startAdr + 7;
          break;
      }
      //console.log("stopAdr: " + stopAdr);
      //FEL WRITE BACK
      //law hit haty el NEEDED data only men el cache, men el startAdr lehad el stopAdr fel which
      let load = true;
      switch (types) {
        case "SW":
        case "SD":
        case "S.S":
        case "S.D":
          load = false;
          break;
      }
      //console.log(load ? "true" : "false");
      //law load, hageeb el binary men el cache wahawelo decimal we hahoto fel register file
      let decToReg = -1;
      if (load) {
        let binFromCache = "";
        for (let i = 0; i < cacheSize; i++) {
          if (startAdr == cache[i].which && startAdr <= stopAdr) {
            binFromCache = cache[i].value + binFromCache;
            startAdr++;
          }
        }
        //console.log("BIN FROM CACHE: " + binFromCache);
        decToReg = binaryToDecimal(binFromCache);
      }

      //console.log("DEC TO REG: " + decToReg);

      //law store hageeb el decimal men el register file wahawelo decimal we hahoto fel cache
      //let decFromReg = 650777868590383874n;
      //let decFromReg = 2n;
      let finalCache = [...cache];
      if (!load) {
        let binToCache = decimalToBinary(decFromReg);

        //console.log("BIN TO CACHE: " + binToCache);
        //keep on concatenating 0' at the start of the binary string
        while (binToCache.length < 64) {
          binToCache = "0" + binToCache;
        }
        //console.log("BIN TO CACHE: " + binToCache);

        const chunkSize = 8;
        const chunks = [];

        for (let i = 0; i < binToCache.length; i += chunkSize) {
          chunks.push(binToCache.substring(i, i + chunkSize));
        }

        //console.log("CHUNKS: " + chunks);

        //store in the cache
        let chunkIndex = 7;
        let startAdrTemp = startAdr;

        for (let i = 0; i < cacheSize; i++) {
          if (cache[i].which === startAdrTemp && startAdrTemp <= stopAdr) {
            finalCache[i] = {
              ...finalCache[i],
              value: chunks[chunkIndex],
            };
            startAdrTemp++;
            chunkIndex--;
          }
        }
        setCache(finalCache);

        let noBytes = -1;
        switch (types) {
          case "SW":
          case "S.S":
            noBytes = 4;
            break;
          case "SD":
          case "S.D":
            noBytes = 8;
            break;
        }

        //store in the memory
        //console.log("noBytes 8 : " + noBytes);
        //console.log("startAdr 2 : " + startAdr);
        let newMemory = [...memory];
        for (let i = 0; i < noBytes; i++) {
          //console.log("ana dakhalt hena fe i= " + i);
          //console.log("haghayar fe mem [" + startAdr + "]");
          //console.log("hahot feeha chunk: " + chunks[7 - i]);
          //setMemory((prevMemory) => {
          newMemory[startAdr] = {
            ...newMemory[startAdr],
            value: chunks[7 - i],
          };
          //console.log("newww: " + JSON.stringify(newMemory));
          //return newMemory;
          //});
          startAdr++;
        }
        setMemory(newMemory);
        //console.log("newww: " + JSON.stringify(newMemory));
      }

      let decToRegString = "" + decToReg;
      //update buffers that need the value returning from the load
      let toPutInBuffer;
      //console.log(`toPutInBuffer: ${toPutInBuffer}`);
      //console.log(`indexInRegisterFile: ${indexInRegisterFile}`);
      if (types[0] === "L") {
        if (types === "LD" || types === "LW") {
          toPutInBuffer = `R${indexInRegisterFile}`;
          setIntegerRegisterFile((prevRegisterFile) =>
            updateRegisterFile(
              prevRegisterFile,
              instructionTag,
              decToRegString,
              indexInRegisterFile
            )
          );
        } else {
          toPutInBuffer = `F${indexInRegisterFile}`;
          setRegisterFile((prevRegisterFile) =>
            updateRegisterFile(
              prevRegisterFile,
              instructionTag,
              decToRegString,
              indexInRegisterFile
            )
          );
        }
        setMulBuffer((prevBuffer) =>
          updateOperationBuffer(
            prevBuffer,
            instructionTag,
            /*decToRegString*/ toPutInBuffer,
            tagLetter === "M" ? indexInBuffer : null
          )
        );
        setAddBuffer((prevBuffer) =>
          updateOperationBuffer(
            prevBuffer,
            instructionTag,
            /*decToRegString*/ toPutInBuffer,
            tagLetter === "A" ? indexInBuffer : null
          )
        );
        setBranchBuffer((prevBuffer) =>
          updateOperationBuffer(
            prevBuffer,
            instructionTag,
            /*decToRegString*/ toPutInBuffer,
            tagLetter === "B" ? indexInBuffer : null
          )
        );
        setStoreBuffer((prevBuffer) =>
          prevBuffer.map((record) =>
            record?.q === instructionTag?.tag
              ? { ...record, v: /*decToRegString*/ toPutInBuffer, q: "" }
              : record
          )
        );
        setLoadBuffer((prevBuffer) =>
          prevBuffer.map((record, index) =>
            index === indexInBuffer ? new LoadBuffer() : record
          )
        );
        // setSummary((prevSummary) =>
        //   updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
        // );
      } else {
        console.log("dakhalt hena lel store");
        console.log(`indexInBuffer: ${indexInBuffer}`);
        setStoreBuffer((prevBuffer) =>
          prevBuffer.map((record, index) =>
            index === indexInBuffer ? new StoreBuffer() : record
          )
        );
      }
      setSummary((prevSummary) =>
        updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
      );
      break;
    }
    case "B":
      const buffer = branchBuffer;
      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      //console.log(`indexInBuffer: ${indexInBuffer}`);
      const indexInRegisterFile = buffer[indexInBuffer]?.indexInRegisterFile;
      const indexInSummary = buffer[indexInBuffer]?.indexInSummary;

      const summaryInstruction = SplitData(
        summary[indexInSummary]?.instruction
      );

      const operationString = summaryInstruction[0];

      console.log(`operationString: ${operationString}`);

      const whichLoop = summaryInstruction[3];
      console.log(`whichLoop: ${whichLoop}`);
      let loopToIndex;
      if (/^\d+$/.test(whichLoop)) {
        //it's a string of numbers
        loopToIndex = parseInt(whichLoop / 32);
      } else {
        //it's an alphabetical string or contains non-digit characters
        loopToIndex = parseInt(
          objectLoopNameAndIndex.find((record) => record?.name === whichLoop)
            .index
        );
      }

      //console.log(`summaryInstruction: ${summaryInstruction}`);
      const firstRegister = summaryInstruction[1];
      const secondRegister = summaryInstruction[2];

      //console.log(`firstRegister: ${firstRegister}`);
      //console.log(`secondRegister: ${secondRegister}`);

      const firstRegisterValue = parseInt(
        integerRegisterFile.find(
          (register) => register?.register === firstRegister
        ).value
      );
      const secondRegisterValue = parseInt(
        integerRegisterFile.find(
          (register) => register?.register === secondRegister
        ).value
      );
      //console.log(`firstRegisterValue: ${firstRegisterValue}`);
      //console.log(`secondRegisterValue: ${secondRegisterValue}`);

      //console.log(`loopToIndex: ${loopToIndex}`);
      if (
        operationString === "BNE" &&
        firstRegisterValue !== secondRegisterValue
      ) {
        SET_LINE_TXT(loopToIndex - 1);
        SET_GLOBAL_ITERATION((prev) => prev + 1);
      } else if (
        operationString === "BEQ" &&
        firstRegisterValue === secondRegisterValue
      ) {
        SET_LINE_TXT(loopToIndex - 1);
        SET_GLOBAL_ITERATION((prev) => prev + 1);
      }

      setBranchBuffer([new OperationBuffer()]);

      setSummary((prevSummary) =>
        updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
      );

      SET_STALLING(false);
      break;
  }
};

export default WritebackQuestion;
