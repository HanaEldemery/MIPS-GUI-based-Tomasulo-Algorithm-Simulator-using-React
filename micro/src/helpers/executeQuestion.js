export const ExecutionQuestionBefore = (
  summary,
  addBuffer,
  mulBuffer,
  storeBuffer,
  setSummary,
  missDone,
  memMiss,
  memHit,
  addHit,
  subHit,
  mulHit,
  divHit,
  GLOBAL_CLK
) => {
  console.log(`summaryBefore: ${JSON.stringify(summary)}`);
  for (let i = 0; i < summary.length; i++) {
    //loop over all the summary
    if (!summary[i].executionComplete && summary[i].issue < GLOBAL_CLK) {
      let locIndex = parseInt(summary[i].location.slice(1)) - 1;
      //if summary elem has not started execution yet
      if (summary[i].location[0] === "M") {
        //if mul div operation
        if (!mulBuffer[locIndex].qj && !mulBuffer[locIndex].qk) {
          //check if qj="" && qk=""
          setSummary(
            (
              prevSum //add clock time... in the execution time
            ) =>
              prevSum.map((item, index) =>
                index === i
                  ? { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
          );
        }
      } else if (summary[i].location[0] === "A") {
        if (!addBuffer[locIndex].qj && !addBuffer[locIndex].qk) {
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        } else if (summary[i].location[0] === "L") {
          setSummary((prevSum) =>
            prevSum.map((item, index) =>
              index === i
                ? { ...item, executionComplete: `${GLOBAL_CLK}...` }
                : item
            )
          );
        } else if (summary[i].location[0] === "S") {
          if (!storeBuffer[locIndex].q) {
            {
              setSummary((prevSum) =>
                prevSum.map((item, index) =>
                  index === i
                    ? { ...item, executionComplete: `${GLOBAL_CLK}...` }
                    : item
                )
              );
            }
          }
        }
      }
    }
  }
};

export const ExecutionQuestionAfter = (
  summary,
  addBuffer,
  mulBuffer,
  storeBuffer,
  setSummary,
  missDone,
  memMiss,
  memHit,
  addHit,
  subHit,
  mulHit,
  divHit,
  GLOBAL_CLK
) => {
  console.log(`summaryAfter: ${JSON.stringify(summary)}`);
  for (let i = 0; i < summary.length; i++) {
    if (!summary[i].executionComplete.split("...")[1]) {
      //if execution ends in ...
      let timeForOp;
      switch (summary[i].location[0]) {
        case "L":
        case "S":
          if (missDone) {
            timeForOp = memHit;
          } else {
            timeForOp = memMiss;
          }
          break;
        case "M":
          if (
            summary[i].instruction.split(" ")[0] === "MUL.D" ||
            summary[i].instruction.split(" ")[0] === "MUL.S"
          ) {
            timeForOp = mulHit;
          } else {
            timeForOp = divHit;
          }
          break;
        case "A":
          if (
            summary[i].instruction.split(" ")[0] === "ADD.D" ||
            summary[i].instruction.split(" ")[0] === "ADD.S"
          ) {
            timeForOp = addHit;
          } else {
            timeForOp = subHit;
          }
          break;
      }
      if (
        GLOBAL_CLK -
          parseInt(summary[i].executionComplete.split("...")[0]) +
          1 ===
        timeForOp
      ) {
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
