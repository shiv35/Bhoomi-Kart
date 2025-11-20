import React from "react";
import "../styles/App.css";
import Header from "./Header";
import Home from "./Home";
import NavBar from "./Navbar";
import Footer from "./Footer";
import { Routes, Route } from "react-router-dom"; // Remove BrowserRouter import

function App() {
  return (
    <div className="App">
      {/* Remove <Router> wrapper, just use Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <NavBar />
              <Home />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
