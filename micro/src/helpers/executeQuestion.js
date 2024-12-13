import OperationBuffer from "../buffers/operationBuffer";
import SplitData from "../data/splitData";

const updateSummary = (summary, indexInSummary, GLOBAL_CLK) =>
  summary.map((record, index) => {
    if (index === indexInSummary)
      return { ...record, writeBack: GLOBAL_CLK, location: "" };
    return record;
  });

const ExecutionQuestion = (
  summary,
  cache,
  memory,
  cacheSize,
  blockSize,
  addBuffer,
  mulBuffer,
  storeBuffer,
  branchBuffer,
  setCache,
  setSummary,
  memMiss,
  memHit,
  addHit,
  subHit,
  integerAddHit,
  integerSubHit,
  integerBranchHit,
  mulHit,
  divHit,
  GLOBAL_CLK,
  SET_LINE_TXT,
  objectLoopNameAndIndex,
  setBranchBuffer,
  integerRegisterFile,
  SET_GLOBAL_ITERATION,
  SET_STALLING
) => {
  for (let i = 0; i < summary.length; i++) {
    //loop over all the summary
    if (!summary[i].executionComplete && summary[i].issue < GLOBAL_CLK) {
      let locIndex = parseInt(summary[i].location.slice(1)) - 1;
      const locationLoadsStoresInSummary = summary
        .map((record, index) =>
          record?.location[0] === "L" || record?.location[0] === "S"
            ? index
            : -1
        )
        .filter((mappedRecord) => mappedRecord !== -1);

      //console.log(`summary[i].location[0]: ${summary[i].location[0]}`);
      //if summary elem has not started execution yet
      const theSummaryInstruction = SplitData(summary[i]?.instruction);
      console.log(`theSummaryInstruction: ${theSummaryInstruction}`);
      let operationTime;
      if (summary[i].location[0] === "M") {
        //if mul div operation
        operationTime =
          theSummaryInstruction[0] === "MUL.D" ||
          theSummaryInstruction[0] === "MUL.S"
            ? mulHit
            : divHit;
        if (!mulBuffer[locIndex].qj && !mulBuffer[locIndex].qk) {
          //check if qj="" && qk=""
          setSummary(
            (
              prevSum //add clock time... in the execution time
            ) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
          );
        }
      } else if (summary[i].location[0] === "A") {
        operationTime =
          theSummaryInstruction[0] === "ADD.D" ||
          theSummaryInstruction[0] === "ADD.S"
            ? addHit
            : theSummaryInstruction[0] === "DADDI"
            ? integerAddHit
            : theSummaryInstruction[0] === "DSUBI"
            ? integerSubHit
            : subHit;

        //console.log(
        //  `summary[i]?.instruction.split(" ")[0]: ${
        //    summary[i]?.instruction.split(" ")[0]
        //  }`
        //);
        //console.log(`operationTime: ${operationTime}`);
        //console.log(`addBuffer[locIndex].qj: ${addBuffer[locIndex].qj}`);
        //console.log(`addBuffer[locIndex].qk: ${addBuffer[locIndex].qj}`);
        if (!addBuffer[locIndex].qj && !addBuffer[locIndex].qk) {
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        }
      } else if (summary[i].location[0] === "L") {
        const startAdr = parseInt(theSummaryInstruction[2]);
        const type = theSummaryInstruction[0];
        //ba3raf ana awza lehad address kam
        let stopAdr = -1;
        switch (type) {
          case "LW":
          case "L.S":
            stopAdr = startAdr + 3;
            break;
          case "LD":
          case "L.D":
            stopAdr = startAdr + 7;
            break;
        }
        //ba3raf ana hit walla miss
        let miss = true;
        for (let i = 0; i < cacheSize; i = i + blockSize) {
          if (
            startAdr >= cache[i].which &&
            stopAdr <= cache[i + blockSize - 1].which
          ) {
            miss = false;
            break;
          }
        }
        operationTime = memHit;
        if (miss) {
          operationTime = memMiss;
        }
        setSummary((prevSum) =>
          prevSum.map((item, index) =>
            index === i
              ? operationTime === 1
                ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                : { ...item, executionComplete: `${GLOBAL_CLK}...` }
              : item
          )
        );
      } else if (summary[i].location[0] === "S") {
        if (!storeBuffer[locIndex].q) {
          const startAdr = parseInt(theSummaryInstruction[2]);
          const type = theSummaryInstruction[0];
          let stopAdr = -1;
          switch (type) {
            case "SW":
            case "S.S":
              stopAdr = startAdr + 3;
              break;
            case "SD":
            case "S.D":
              stopAdr = startAdr + 7;
              break;
          }
          let miss = true;
          for (let i = 0; i < cacheSize; i = i + blockSize) {
            if (
              startAdr >= cache[i].which &&
              stopAdr <= cache[i + blockSize - 1].which
            ) {
              miss = false;
              break;
            }
          }
          operationTime = memHit;
          if (miss) {
            operationTime = memMiss;
          }
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        }
      } else if (summary[i].location[0] === "B") {
        operationTime = integerBranchHit;

        if (!branchBuffer[locIndex].qj && !branchBuffer[locIndex].qk) {
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        }
      }
    }
  }

  for (let i = 0; i < summary.length; i++) {
    const locationLoadsStoresInSummary = summary
      .map((record, index) =>
        record?.instruction.split(" ")[0][0] === "L" ||
        record?.instruction.split(" ")[0][0] === "S"
          ? index
          : -1
      )
      .filter((mappedRecord) => mappedRecord !== -1);
    //enters law MESH haga bt-execute fe 1 clk cycle AND yet to have finished execution
    const theSummaryInstructionTwo = SplitData(summary[i]?.instruction);
    if (
      summary[i].executionComplete &&
      summary[i].executionComplete.includes("...") &&
      summary[i].executionComplete.split("...")[0] &&
      !summary[i].executionComplete.split("...")[1]
    ) {
      //if execution ends in ...
      let timeForOp;
      switch (summary[i].location[0]) {
        case "L":
        case "S":
          // console.log(
          //   `locationLoadsStoresInSummary[0]: ${JSON.stringify(
          //     locationLoadsStoresInSummary
          //   )}`
          // );
          //console.log("cache abl ma3raf hit or miss: " + JSON.stringify(cache));
          const startAdr = parseInt(theSummaryInstructionTwo[2]);
          const type = theSummaryInstructionTwo[0];
          let stopAdr = -1;
          switch (type) {
            case "SW":
            case "S.S":
            case "LW":
            case "L.S":
              stopAdr = startAdr + 3;
              break;
            case "SD":
            case "S.D":
            case "LD":
            case "L.D":
              stopAdr = startAdr + 7;
              break;
          }
          let miss = true;
          for (let i = 0; i < cacheSize; i = i + blockSize) {
            if (
              startAdr >= cache[i].which &&
              stopAdr <= cache[i + blockSize - 1].which
            ) {
              miss = false;
              break;
            }
          }
          timeForOp = memHit;
          if (miss) {
            timeForOp = memMiss;
          }
          //timeForOp = locationLoadsStoresInSummary[0] === i ? memMiss : memHit;
          // console.log(`timeForOp: ${timeForOp}`);
          break;
        case "M":
          if (
            theSummaryInstructionTwo[0] === "MUL.D" ||
            theSummaryInstructionTwo[0] === "MUL.S"
          ) {
            timeForOp = mulHit;
          } else {
            timeForOp = divHit;
          }
          break;
        case "A":
          if (
            theSummaryInstructionTwo[0] === "ADD.D" ||
            theSummaryInstructionTwo[0] === "ADD.S"
          )
            timeForOp = addHit;
          else if (theSummaryInstructionTwo[0] === "DADDI")
            timeForOp = integerAddHit;
          else if (theSummaryInstructionTwo[0] === "DSUBI")
            timeForOp = integerSubHit;
          else timeForOp = subHit;
          break;
        case "B":
          timeForOp = integerBranchHit;
          break;
      }

      // console.log(`timeForOp: ${timeForOp}`);
      // console.log(`GLOBAL_CLK: ${GLOBAL_CLK}`);
      // console.log(
      //   `parseInt(summary[i].executionComplete.split("...")[0]): ${parseInt(
      //     summary[i].executionComplete.split("...")[0]
      //   )}`
      // );

      if (
        GLOBAL_CLK -
          parseInt(summary[i].executionComplete.split("...")[0]) +
          1 ===
        timeForOp
      ) {
        // if (summary[i].location[0] === "B") {
        //   const buffer = branchBuffer;
        //   const indexInBuffer = 0;
        //   const indexInRegisterFile =
        //     buffer[indexInBuffer]?.indexInRegisterFile;
        //   const indexInSummary = buffer[indexInBuffer]?.indexInSummary;
        //   const operationString =
        //     summary[indexInSummary]?.instruction.split(" ")[0];

        //   console.log(`operationString: ${operationString}`);

        //   const whichLoop = summary[indexInSummary]?.instruction.split(" ")[3];
        //   let loopToIndex;
        //   if (/^\d+$/.test(whichLoop)) {
        //     //it's a string of numbers
        //     loopToIndex = parseInt(whichLoop / 32);
        //   } else {
        //     //it's an alphabetical string or contains non-digit characters
        //     loopToIndex = parseInt(
        //       objectLoopNameAndIndex.find(
        //         (record) => record?.name === whichLoop
        //       ).index
        //     );
        //   }

        //   const firstRegister =
        //     summary[indexInSummary]?.instruction.split(" ")[1];
        //   const secondRegister =
        //     summary[indexInSummary]?.instruction.split(" ")[2];

        //   //console.log(`firstRegister: ${firstRegister}`);
        //   //console.log(`secondRegister: ${secondRegister}`);

        //   const firstRegisterValue = parseInt(
        //     integerRegisterFile.find(
        //       (register) => register?.register === firstRegister
        //     ).value
        //   );
        //   const secondRegisterValue = parseInt(
        //     integerRegisterFile.find(
        //       (register) => register?.register === secondRegister
        //     ).value
        //   );
        //   //console.log(`firstRegisterValue: ${firstRegisterValue}`);
        //   //console.log(`secondRegisterValue: ${secondRegisterValue}`);

        //   //console.log(`loopToIndex: ${loopToIndex}`);
        //   if (
        //     operationString === "BNE" &&
        //     firstRegisterValue !== secondRegisterValue
        //   ) {
        //     SET_LINE_TXT(loopToIndex - 1);
        //     SET_GLOBAL_ITERATION((prev) => prev + 1);
        //   } else if (
        //     operationString === "BEQ" &&
        //     firstRegisterValue === secondRegisterValue
        //   ) {
        //     SET_LINE_TXT(loopToIndex - 1);
        //     SET_GLOBAL_ITERATION((prev) => prev + 1);
        //   }

        //   setBranchBuffer([new OperationBuffer()]);

        //   // setSummary((prevSummary) =>
        //   //   updateSummary(prevSummary, indexInSummary, GLOBAL_CLK)
        //   // );

        //   SET_STALLING(false);
        // }
        if (summary[i].location[0] === "L" || summary[i].location[0] === "S") {
          const startAdr = parseInt(theSummaryInstructionTwo[2]);
          const type = theSummaryInstructionTwo[0];
          let stopAdr = -1;
          switch (type) {
            case "SW":
            case "S.S":
            case "LW":
            case "L.S":
              stopAdr = startAdr + 3;
              break;
            case "SD":
            case "S.D":
            case "LD":
            case "L.D":
              stopAdr = startAdr + 7;
              break;
          }
          let miss = true;
          for (let i = 0; i < cacheSize; i = i + blockSize) {
            if (
              startAdr >= cache[i].which &&
              stopAdr <= cache[i + blockSize - 1].which
            ) {
              miss = false;
              break;
            }
          }
          let newCache = [...cache];
          if (miss) {
            let noBlocks = cacheSize / blockSize;
            let blockNumber = startAdr % noBlocks;
            let startAdrCache = blockNumber * blockSize;
            let stopFor = startAdr + blockSize;
            for (let i = startAdr; i < stopFor; i++) {
              newCache[startAdrCache] = {
                ...newCache[startAdrCache],
                value: memory[i].value,
                which: i,
              };
              startAdrCache++;
            }
            setCache(newCache);
          }
        }
        //if global clk time-exec start time(num before the ...)==time for op
        setSummary((prevSum) =>
          prevSum.map(
            (
              record,
              index //write the global clk after the ...
            ) =>
              index === i
                ? {
                    ...record,
                    executionComplete: `${prevSum[i].executionComplete}${GLOBAL_CLK}`,
                  }
                : record
          )
        );
      }
    }
  }
};

export default ExecutionQuestion;
