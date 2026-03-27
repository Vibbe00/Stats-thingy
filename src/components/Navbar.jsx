import { Link } from 'react-router-dom'
import './navbar.css'

export default function Navbar(){

    return (
    
    <nav className="nav">
        

    <ul>
        <li><Link to ="/">Home</Link></li>
        <li className = "active"><Link to = "/Champions">Champions</Link> </li>
        <li><Link to = "/juu">juu</Link> </li> 
        <li><Link to = "/joo">joo</Link></li> 
    </ul>
    </nav>
    )

    
}
