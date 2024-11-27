import SplitData from "../data/splitData";
import Summary from "../table/summary";

const IssueQuestion = (
  fileContent,
  LINE_TXT,
  GLOBAL_CLK,
  GLOBAL_ITERATION,
  registerFile,
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
  setStalledBuffer
) => {
  const instructionType = SplitData(fileContent[LINE_TXT])[0];

  let check;
  switch (instructionType) {
    case "MUL.D":
    case "DIV.D":
      check = "mul-buffer";
      break;
    case "ADD.D":
    case "SUB.D":
      check = "add-buffer";
      break;
    case "L.S":
    case "L.D":
      check = "load-buffer";
      break;
    case "S.S":
    case "S.D":
      check = "store-buffer";
      break;
    case "ADDI":
    case "SUBI":
      check = "int-add";
      break;
    case "LW":
      check = "int-load-word";
      break;
    case "LD":
      check = "int-load-double";
      break;
    case "SW":
      check = "int-store-word";
      break;
    case "SD":
      check = "int-store-double";
      break;
    case "BNEZ":
      check = "int-branch";
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
        setStalledBuffer("mulBuffer");
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

          console.log(`addBuffer: ${JSON.stringify(newAddBuffer)}`);
          console.log(`SUMMARY: ${JSON.stringify(newSummary)}`);
          console.log(`registerFile: ${JSON.stringify(newRegisterFile)}`);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        setStalledBuffer("addBuffer");
        // console.log("CHECK IF STALL WORKS");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "load-buffer":
      break;
    case "store-buffer":
      break;
    case "int-add":
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
      break;
  }

  //console.log(instructionType);
};

export default IssueQuestion;
