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
  branchBuffer,
  summary,
  setMulBuffer,
  setAddBuffer,
  setLoadBuffer,
  setStoreBuffer,
  setBranchBuffer,
  SET_LINE_TXT,
  setSummary,
  setRegisterFile,
  setIntegerRegisterFile,
  SET_GLOBAL_ITERATION,
  SET_STALLING
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
    case "LD":
      check = "int-load";
      break;
    case "SW": //
    case "SD": //
      check = "int-store";
      break;
    case "BNE": //
    case "BEQ": //
      check = "int-branch";
      break;
    case "DADDI": //
    case "DSUBI": //
      check = "integer-add-immediate";
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
        console.log(`splitData: ${splitData}`);

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
        //console.log("CHECK IF STALL WORKS");
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
    case "int-load":
      //law fi makan fel loadBuffer
      if (loadBuffer.some((record) => record.busy === 0)) {
        const index = loadBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);
        //console.log(`splitData: ${splitData}`);

        const registerOutput = splitData[1];

        const newRegisterFile = [...integerRegisterFile];
        const indexRegisterInRegisterFile = newRegisterFile.findIndex(
          (register) => register.register === registerOutput
        );

        const addressInput = splitData[2]; //hena el hashoof law howa medeeny el address alatool wala ageebo men register
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
          setIntegerRegisterFile(newRegisterFile);
        }
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        console.log("CHECK IF STALL WORKS");
      }
      break;
    case "int-store":
      //law fi makan fel storeBuffer
      if (storeBuffer.some((record) => record.busy === 0)) {
        const index = storeBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);
        //console.log(`splitData: ${splitData}`);

        const registerOutput = splitData[1];
        const addressInput = splitData[2];

        const newRegisterFile = [...integerRegisterFile];
        const indexRegisterInRegisterFile = newRegisterFile.findIndex(
          (register) => register.register === registerOutput
        );

        const qOfRegister = registerFile[indexRegisterInRegisterFile].qi;
        //console.log(`qOfRegister: ${qOfRegister}`);
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
    case "int-branch":
      //console.log(`branchBuffer: ${JSON.stringify(branchBuffer)}`);
      if (branchBuffer.some((record) => record.busy === 0)) {
        const index = branchBuffer.findIndex((record) => record.busy === 0);

        const currentInstruction = fileContent[LINE_TXT];
        //const splitInstruction = currentInstruction.split(" "); 13-12-2024
        const splitInstruction = SplitData(currentInstruction);
        console.log(`splitInstruction: ${splitInstruction}`);
        //BNE,R1,R2,LOOP

        const registerOne = splitInstruction[1];
        const registerTwo = splitInstruction[2];

        //console.log(`registerOne: ${registerOne}`); //R1
        //console.log(`registerTwo: ${registerTwo}`); //R2

        const qOfRegisterOne = integerRegisterFile.find(
          (register) => register.register === `${registerOne}`
        )?.qi;
        const qOfRegisterTwo = integerRegisterFile.find(
          (register) => register.register === `${registerTwo}`
        )?.qi;

        //console.log(`qOfRegisterOne: ${qOfRegisterOne}`);
        //console.log(`qOfRegisterTwo: ${qOfRegisterTwo}`);

        //console.log(`instructionType: ${instructionType}`);
        //BNE

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

        //console.log(`index: ${index}`); //0
        if (index !== -1) {
          //write in the add buffer (done)
          const newBranchBuffer = [...branchBuffer];
          newBranchBuffer[index] = {
            ...newBranchBuffer[index],
            op: instructionType,
            vj: vj,
            vk: vk,
            qj: qj,
            qk: qk,
            busy: 1,
            indexInRegisterFile: -1,
            indexInSummary: summary.length,
          };
          //console.log(`newBranchBuffer: ${JSON.stringify(newBranchBuffer)}`);
          setBranchBuffer(newBranchBuffer);

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
              `B${index + 1}`
            ),
          ];
          setSummary(newSummary);
        }
        SET_STALLING(true);
      } else {
        SET_LINE_TXT((prev) => prev - 1);
        // console.log("CHECK IF STALL WORKS");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "integer-add-immediate":
      //check if fthere's empty space in the add buffer (done)
      //0 in the busy (done)
      //if yes issue (done)
      if (addBuffer.some((record) => record.busy === 0)) {
        const index = addBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);
        //console.log(`splitData: ${splitData}`);

        const register = splitData[2];
        const immediateString = splitData[3];
        //console.log(`register: ${register}`);
        //console.log(`immediateString: ${immediateString}`);
        //console.log(
        //  `integerRegisterFile: ${JSON.stringify(integerRegisterFile)}`
        //);
        const qOfRegister = integerRegisterFile.find(
          (registerOn) => registerOn.register === `${register}`
        )?.qi;
        //console.log(`qOfRegister: ${qOfRegister}`);

        let vj, qj;
        if (qOfRegister === "0") {
          vj = register;
          qj = "";
        } else {
          vj = "";
          qj = qOfRegister;
        }

        if (index !== -1) {
          //write in the add buffer (done)
          const newAddBuffer = [...addBuffer];
          newAddBuffer[index] = {
            ...newAddBuffer[index],
            op: instructionType,
            vj: vj,
            vk: immediateString,
            qj: qj,
            qk: "",
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
              register,
              immediateString,
              GLOBAL_CLK,
              "",
              -1,
              `A${index + 1}`
            ),
          ];
          setSummary(newSummary);

          //edit register file (done)
          const registerOutput = splitData[1];
          const newRegisterFile = [...integerRegisterFile];
          const indexRegisterInRegisterFile = newRegisterFile.findIndex(
            (register) => register.register === registerOutput
          );

          if (indexRegisterInRegisterFile !== -1)
            newRegisterFile[indexRegisterInRegisterFile].qi = `A${index + 1}`;
          setIntegerRegisterFile(newRegisterFile);

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
  }

  //console.log(`summary: ${JSON.stringify(summary)}`);
  //console.log(instructionType);
};

export default IssueQuestion;
