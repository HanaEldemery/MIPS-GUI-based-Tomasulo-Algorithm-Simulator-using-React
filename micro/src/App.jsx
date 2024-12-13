import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import UserInputForm from "./components/UserInputForm";
import ToRouteTo from "./components/ToRouteTo";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<UserInputForm />} />
          <Route path="/project" element={<ToRouteTo />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
