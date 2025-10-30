import './App.css'
import HeroSection from './components/Home'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Room from './components/Room'
import Game from './components/Game'


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<HeroSection/>}/>
          <Route path='/room' element={<Room/>}/>
          <Route path='/game' element={<Game/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
