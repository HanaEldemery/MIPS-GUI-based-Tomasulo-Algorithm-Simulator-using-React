import SplitData from "../data/splitData";
import Summary from "../table/summary";

const IssueQuestion = (
  fileContent,
  objectLoopNameAndIndex,
  LINE_TXT,
  GLOBAL_CLK,
  GLOBAL_ITERATION,
  registerFile,
  integerRegisterFile,
  mulBuffer,
  addBuffer,
  loadBuffer,
  storeBuffer,
  summary,
  setMulBuffer,
  setAddBuffer,
  setLoadBuffer,
  setStoreBuffer,
  SET_LINE_TXT,
  setSummary,
  setRegisterFile,
  setIntegerRegisterFile,
  SET_GLOBAL_ITERATION
) => {
  const instructionType = SplitData(fileContent[LINE_TXT])[0];
  //console.log(`instructionType: ${instructionType}`);

  let check;
  switch (instructionType) {
    case "MUL.D": //
    case "MUL.S": //
    case "DIV.D": //
    case "DIV.S": //
      check = "mul-buffer"; //
      break;
    case "ADD.D": //
    case "ADD.S": //
    case "SUB.D": //
    case "SUB.S": //
      check = "add-buffer"; //
      break;
    case "L.S": //
    case "L.D": //
      check = "load-buffer"; //
      break;
    case "S.S": //
    case "S.D": //
      check = "store-buffer"; //
      break;
    case "LW": //
      check = "int-load-word";
      break;
    case "LD": //
      check = "int-load-double";
      break;
    case "SW": //
      check = "int-store-word";
      break;
    case "SD": //
      check = "int-store-double";
      break;
    case "BNE": //
    case "BEQ": //
      check = "int-branch";
      break;
    case "DADDI": //
      check = "double-add-immediate";
      break;
    case "DSUBI": //
      check = "double-subtract-immediate";
      break;
  }

  switch (check) {
    case "mul-buffer":
      //check if fthere's empty space in the mul buffer (done)
      //0 in the busy (done)
      //if yes issue (done)
      if (mulBuffer.some((record) => record.busy === 0)) {
        const index = mulBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOne = splitData[2];
        const registerTwo = splitData[3];

        const qOfRegisterOne = registerFile.find(
          (register) => register.register === `${registerOne}`
        )?.qi;
        const qOfRegisterTwo = registerFile.find(
          (register) => register.register === `${registerTwo}`
        )?.qi;

        let vj, vk, qj, qk;
        if (qOfRegisterOne === "0") {
          vj = registerOne;
          qj = "";
        } else {
          vj = "";
          qj = qOfRegisterOne;
        }
        if (qOfRegisterTwo === "0") {
          vk = registerTwo;
          qk = "";
        } else {
          vk = "";
          qk = qOfRegisterTwo;
        }

        if (index !== -1) {
          //write in the mul buffer (done)
          const newMulBuffer = [...mulBuffer];
          newMulBuffer[index] = {
            ...newMulBuffer[index],
            op: instructionType,
            vj: vj,
            vk: vk,
            qj: qj,
            qk: qk,
            busy: 1,
            indexInRegisterFile: parseInt(splitData[1].slice(1)),
            indexInSummary: summary.length,
          };
          setMulBuffer(newMulBuffer);

          //write in summary and write issue with clk (done)
          const newSummary = [
            ...summary,
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              registerOne,
              registerTwo,
              GLOBAL_CLK,
              "",
              -1,
              `M${index + 1}`
            ),
          ];
          setSummary(newSummary);

          //edit register file (done)
          const registerOutput = splitData[1];
          const newRegisterFile = [...registerFile];
          const indexRegisterInRegisterFile = newRegisterFile.findIndex(
            (register) => register.register === registerOutput
          );

          if (indexRegisterInRegisterFile !== -1)
            newRegisterFile[indexRegisterInRegisterFile].qi = `M${index + 1}`;
          setRegisterFile(newRegisterFile);

          // console.log(`mulBuffer: ${JSON.stringify(newMulBuffer)}`);
          // console.log(`SUMMARY: ${JSON.stringify(newSummary)}`);
          // console.log(`registerFile: ${JSON.stringify(newRegisterFile)}`);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        // console.log("CHECK IF STALL WORKS");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "add-buffer":
      //check if fthere's empty space in the add buffer (done)
      //0 in the busy (done)
      //if yes issue (done)
      if (addBuffer.some((record) => record.busy === 0)) {
        const index = addBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOne = splitData[2];
        const registerTwo = splitData[3];

        const qOfRegisterOne = registerFile.find(
          (register) => register.register === `${registerOne}`
        )?.qi;
        const qOfRegisterTwo = registerFile.find(
          (register) => register.register === `${registerTwo}`
        )?.qi;

        let vj, vk, qj, qk;
        if (qOfRegisterOne === "0") {
          vj = registerOne;
          qj = "";
        } else {
          vj = "";
          qj = qOfRegisterOne;
        }
        if (qOfRegisterTwo === "0") {
          vk = registerTwo;
          qk = "";
        } else {
          vk = "";
          qk = qOfRegisterTwo;
        }

        if (index !== -1) {
          //write in the add buffer (done)
          const newAddBuffer = [...addBuffer];
          newAddBuffer[index] = {
            ...newAddBuffer[index],
            op: instructionType,
            vj: vj,
            vk: vk,
            qj: qj,
            qk: qk,
            busy: 1,
            indexInRegisterFile: parseInt(splitData[1].slice(1)),
            indexInSummary: summary.length,
          };
          setAddBuffer(newAddBuffer);

          //write in summary and write issue with clk (done)
          const newSummary = [
            ...summary,
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              registerOne,
              registerTwo,
              GLOBAL_CLK,
              "",
              -1,
              `A${index + 1}`
            ),
          ];
          setSummary(newSummary);

          //edit register file (done)
          const registerOutput = splitData[1];
          const newRegisterFile = [...registerFile];
          const indexRegisterInRegisterFile = newRegisterFile.findIndex(
            (register) => register.register === registerOutput
          );

          if (indexRegisterInRegisterFile !== -1)
            newRegisterFile[indexRegisterInRegisterFile].qi = `A${index + 1}`;
          setRegisterFile(newRegisterFile);

          //console.log(`addBuffer: ${JSON.stringify(newAddBuffer)}`);
          //console.log(`SUMMARY: ${JSON.stringify(newSummary)}`);
          //console.log(`registerFile: ${JSON.stringify(newRegisterFile)}`);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        // console.log("CHECK IF STALL WORKS");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "load-buffer":
      //law fi makan fel loadBuffer
      if (loadBuffer.some((record) => record.busy === 0)) {
        const index = loadBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOutput = splitData[1];

        const newRegisterFile = [...registerFile];
        const indexRegisterInRegisterFile = newRegisterFile.findIndex(
          (register) => register.register === registerOutput
        );

        const addressInput = splitData[2];
        if (index !== -1) {
          //place in loadBuffer
          const newLoadBuffer = [...loadBuffer];
          newLoadBuffer[index] = {
            ...newLoadBuffer[index],
            busy: 1,
            address: addressInput,
            indexInRegisterFile: indexRegisterInRegisterFile,
            indexInSummary: summary.length,
          };
          setLoadBuffer(newLoadBuffer);

          //console.log(`loadBuffer issued: ${JSON.stringify(newLoadBuffer)}`);

          const newSummary = [
            ...summary,
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              addressInput,
              addressInput,
              GLOBAL_CLK,
              "",
              -1,
              `L${index + 1}`
            ),
          ];
          setSummary(newSummary);

          //place in registerFile
          if (indexRegisterInRegisterFile !== -1)
            newRegisterFile[indexRegisterInRegisterFile].qi = `L${index + 1}`;
          setRegisterFile(newRegisterFile);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        console.log("CHECK IF STALL WORKS");
      }
      break;
    case "store-buffer":
      //law fi makan fel storeBuffer
      if (storeBuffer.some((record) => record.busy === 0)) {
        const index = storeBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOutput = splitData[1];
        const addressInput = splitData[2];

        const newRegisterFile = [...registerFile];
        const indexRegisterInRegisterFile = newRegisterFile.findIndex(
          (register) => register.register === registerOutput
        );

        const qOfRegister = registerFile[indexRegisterInRegisterFile].qi;

        //console.log(`qOfRegister: ${qOfRegister}`);

        let v, q;
        if (qOfRegister === "0") {
          v = registerOutput;
          q = "";
        } else {
          v = "";
          q = qOfRegister;
        }

        if (index !== -1) {
          //place in storeBuffer
          const newStoreBuffer = [...storeBuffer];
          newStoreBuffer[index] = {
            ...newStoreBuffer[index],
            busy: 1,
            v: v,
            q: q,
            address: addressInput,
            indexInRegisterFile: -1,
            indexInSummary: summary.length,
          };
          setStoreBuffer(newStoreBuffer);

          //console.log(`storeBuffer issued: ${JSON.stringify(newStoreBuffer)}`);

          //place in summary
          const newSummary = [
            ...summary,
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              addressInput,
              addressInput,
              GLOBAL_CLK,
              "",
              -1,
              `S${index + 1}`
            ),
          ];
          setSummary(newSummary);

          // //place in registerFile
          // if (indexRegisterInRegisterFile !== -1)
          //   newRegisterFile[indexRegisterInRegisterFile].qi = `S${index + 1}`;
          // setRegisterFile(newRegisterFile);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        console.log("CHECK IF STALL WORKS");
      }
      break;
    case "int-load-word":
      break;
    case "int-load-double":
      break;
    case "int-store-word":
      break;
    case "int-store-double":
      break;
    case "int-branch":
      const currentInstruction = fileContent[LINE_TXT];
      const splitInstruction = currentInstruction.split(" ");
      const whichLoop = splitInstruction[3];
      //console.log(`whichLoop: ${whichLoop}`);
      //console.log(`whichLoop type: ${typeof whichLoop}`);
      const loopToIndex = parseInt(
        objectLoopNameAndIndex.find((record) => record?.name === whichLoop)
          .index
      );
      //console.log(`loopToIndex: ${typeof loopToIndex}`);
      const firstRegister = splitInstruction[1];
      const secondRegister = splitInstruction[2];
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

      if (
        instructionType === "BNE" &&
        firstRegisterValue !== secondRegisterValue
      ) {
        SET_LINE_TXT(loopToIndex - 1);
        SET_GLOBAL_ITERATION((prev) => prev + 1);
      }

      if (
        instructionType === "BEQ" &&
        firstRegisterValue === secondRegisterValue
      ) {
        SET_LINE_TXT(loopToIndex - 1);
        SET_GLOBAL_ITERATION((prev) => prev + 1);
      }
      //console.log(`typeof GLOBAL_ITERATION: ${typeof GLOBAL_ITERATION}`);
      break;
    case "double-add-immediate":
      break;
    case "double-subtract-immediate":
      break;
  }

  //console.log(`summary: ${JSON.stringify(summary)}`);
  //console.log(instructionType);
};

export default IssueQuestion;
