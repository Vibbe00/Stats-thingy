import Navbar from "./components/Navbar";
import Body from "./components/Body";
import Footer from "./components/Footer";
import Header from "./components/Header"

import Champions from "./pages/champions";
import Profile from "./pages/profile";
import Home from "./pages/home";
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <>
      <Header/>
      <Navbar/>
      <Body>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/champions" element={<Champions />}/>
          <Route path="/profile/:region/:gameName/:tagLine" element={<Profile />}/>
        </Routes>
      </Body>
      <Footer/>
    </>
  );
}

export default App;