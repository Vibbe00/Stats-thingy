import './footer.css'

export default function Footer(){

    return (
        
            <div className = "footer">
                <div className ="section-padding">
                    <div className ="footer-links">
                        <div className ="footer-links-div">
                            <h4>League Data</h4>
                            <ul>
                            <li><a href = "/tekstiä">tekstiä</a> </li> 
                            <li>  <a href = "/tekstiä">tekstiä</a> </li>
                            <li><a href = "/tekstiä">tekstiä</a> </li>
                            </ul>

                        </div>
                        <div className = "footer-links-div">
                            <h4>About us</h4>
                            <p>tekstiä</p>
                            <p>tekstiä</p>
                            <p>tekstiä</p>
                        </div>
                        <div className = "footer-links-div">
                            <h4>More</h4>
                            <p>tekstiä</p>
                            <p>tekstiä</p>
                            <p>tekstiä</p>
                        </div>
                    </div>
            <hr></hr>
            <div className="footer-below">
                <div className ="footer-copyright">
                    <p>@{new Date().getFullYear()} LeagueData. All right reserved.</p>
                </div>
                <div className = "footer-below-links">
                    <a href = "/terms"><div><p>Terms & Conditions</p></div></a>
                    <a href = "/Privacy"><div><p>Privacy</p></div></a>
                    <a href = "/Security"><div><p>Security</p></div></a>
                </div>
            </div>
                </div>
            </div>
      
    )
}