import { useState } from "react";
import Navbar from "./components/Navbar";
import Body from "./components/Body";
import Footer from "./components/Footer";
import Header from "./components/Header"


import Champions from "./pages/champions";
import Juu from "./pages/juu";
import Joo from "./pages/joo";
import Home from "./pages/home";
import { Route, Routes} from 'react-router-dom'

function App() {


  return (
    <>
      <Header/>
      <Navbar/>
      <Routes>
        <Route path="/" element = {<Home />}/>
        <Route path="/champions" element = {<Champions />}/>
        <Route path="/joo" element = {<Joo />}/>
        <Route path="/juu" element = {<Juu />}/>
      </Routes>
      <Body/>
      <Footer/>
      
      
    </>
  );
}

export default App;
