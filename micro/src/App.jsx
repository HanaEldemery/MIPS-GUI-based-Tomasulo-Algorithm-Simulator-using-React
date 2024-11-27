import { useEffect, useState } from "react";

import FetchFileContent from "./data/fileReader";

import RenderTable from "./components/RenderTable";

import LoadBuffer from "./buffers/loadBuffer";
import StoreBuffer from "./buffers/storeBuffer";
import OperationBuffer from "./buffers/operationBuffer";

import IssueQuestion from "./helpers/issueQuestion";
import WritebackQuestion from "./helpers/writebackQuestion";

import RegisterFile from "./table/registerFile";

const App = () => {
  const fileContent = FetchFileContent();

  const [GLOBAL_CLK, SET_GLOBAL_CLK] = useState(0);
  const [GLOBAL_ITERATION, SET_GLOBAL_ITERATION] = useState(0);
  const [LINE_TXT, SET_LINE_TXT] = useState(-1);

  const [mulBuffer, setMulBuffer] = useState([]);
  const [addBuffer, setAddBuffer] = useState([]);
  const [loadBuffer, setLoadBuffer] = useState([]);
  const [storeBuffer, setStoreBuffer] = useState([]);
  const [registerFile, setRegisterFile] = useState([]);
  const [summary, setSummary] = useState([]);

  const [isChildStateUpdated, setIsChildStateUpdated] = useState(false);
  const [stalledBuffer, setStalledBuffer] = useState("");
  const [changedBuffers, setChangedBuffers] = useState([]);
  const [areWritebackValuesUpdated, setAreWritebackValuesUpdated] =
    useState(false);

  const handleChildStateUpdate = () => {
    setIsChildStateUpdated(true);
  };

  const startQuestion = () => {};

  const endQuestion = () => {};

  const writebackQuestion = () => {};

  useEffect(() => {
    //user input (sizes)
    const initialMulBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialMulBuffer.push(new OperationBuffer());
    }
    setMulBuffer(initialMulBuffer);

    const initialAddBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialAddBuffer.push(new OperationBuffer());
    }
    setAddBuffer(initialAddBuffer);

    const initialLoadBuffer = [];
    for (let i = 0; i < 3; i++) {
      initialLoadBuffer.push(new LoadBuffer());
    }
    setLoadBuffer(initialLoadBuffer);

    const initialStoreBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialStoreBuffer.push(new StoreBuffer());
    }
    setStoreBuffer(initialStoreBuffer);

    const initialRegisterFile = [];
    for (let i = 0; i < 10; i++) {
      let register = `F${i}`;
      initialRegisterFile.push(new RegisterFile(register, `${i}`, "0"));
    }
    setRegisterFile(initialRegisterFile);
  }, []);

  useEffect(() => {
    if (fileContent?.length > 0 && LINE_TXT < fileContent?.length) {
      IssueQuestion(
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
      );

      handleChildStateUpdate();
    } else if (GLOBAL_CLK !== 0) setIsChildStateUpdated(true);

    if (GLOBAL_CLK === 4) {
      // test //
      setSummary((prevSummary) =>
        prevSummary.map((record, index) => {
          if (index === 0) return { ...record, executionComplete: "2...4" };
          return record;
        })
      );
      setIsChildStateUpdated(true);
      //      //
    } else if (GLOBAL_CLK === 6) {
      // test //
      setSummary((prevSummary) =>
        prevSummary.map((record, index) => {
          if (index === 1) return { ...record, executionComplete: "6...7" };
          return record;
        })
      );
      setIsChildStateUpdated(true);
      //      //
    }
  }, [GLOBAL_CLK]);

  useEffect(() => {
    if (isChildStateUpdated) {
      WritebackQuestion(
        GLOBAL_CLK,
        mulBuffer,
        addBuffer,
        storeBuffer,
        summary,
        setRegisterFile,
        setMulBuffer,
        setAddBuffer,
        setStoreBuffer,
        setSummary,
        setChangedBuffers
      );

      setIsChildStateUpdated(false);
      setAreWritebackValuesUpdated(true);
    }
  }, [isChildStateUpdated, GLOBAL_CLK]);

  useEffect(() => {
    if (
      fileContent?.length > 0 &&
      LINE_TXT < fileContent?.length &&
      areWritebackValuesUpdated &&
      changedBuffers.includes(stalledBuffer)
    ) {
      setStalledBuffer("");
      setChangedBuffers([]);
      IssueQuestion(
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
      );

      setAreWritebackValuesUpdated(false);
    }
  }, [changedBuffers]);

  const handleOnNextClockCycleClick = () => {
    SET_GLOBAL_CLK((prev) => prev + 1);
    if (fileContent?.length > LINE_TXT) SET_LINE_TXT((prev) => prev + 1); //check
  };

  // console.log(
  //   "================================================================"
  // );
  // console.log(mulBuffer);
  // console.log(LINE_TXT);
  // console.log(
  //   "================================================================"
  // );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buffer Status</h1>
      {RenderTable("Multiply Buffer", mulBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {RenderTable("Add Buffer", addBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {RenderTable("Load Buffer", loadBuffer, ["busy", "address"])}
      {RenderTable("Store Buffer", storeBuffer, ["busy", "address", "v", "q"])}
      {RenderTable("Register File", registerFile, ["register", "value", "qi"])}
      {RenderTable("Summary", summary, [
        "iteration",
        "instruction",
        "j",
        "k",
        "issue",
        "executionComplete",
        "writeBack",
      ])}

      <div className="my-4 text-center">
        <span className="text-xl font-semibold text-gray-800">
          Current Clock Cycle:{" "}
          <span className="text-blue-500">{GLOBAL_CLK}</span>
        </span>
      </div>

      <button
        onClick={handleOnNextClockCycleClick}
        className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
      >
        Next Clockcycle
      </button>
    </div>
  );
};

export default App;
