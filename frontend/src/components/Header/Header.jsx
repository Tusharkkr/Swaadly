import React from 'react'
import './Header.css'

const Header = () => {
    return (
        <div className='header'>
            <div className='header-contents'>
                <span className="header-badge">Freshly made • Delivered fast</span>
                <h1>Good food.<br /><em>Good mood.</em></h1>
                <p>Restaurant-quality favourites, made with fresh ingredients and delivered warm to your door.</p>
                <div className="header-actions">
                    <a href="#explore-menu" className="header-primary-button">Explore menu <span>↗</span></a>
                    <a href="#app-download" className="header-secondary-button">Get the app</a>
                </div>
                <div className="header-highlights">
                    <span><b>30 min</b> average delivery</span>
                    <span><b>4.8/5</b> customer rating</span>
                </div>
            </div>
        </div>
    )
}

export default Header
