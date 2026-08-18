import { BrowserRouter, Routes, Route } from "react-router";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ProtectedRoute from "@/ProtectedRoute";
import Foods from "@/pages/Foods";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/foods" element={<Foods />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
