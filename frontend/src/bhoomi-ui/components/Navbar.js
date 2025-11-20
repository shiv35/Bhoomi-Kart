import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import '../styles/navbar.css';
const bhoomiNavigationBar = () => {
  const [showPopover, setShowPopover] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const closePopover = () => {
    setDontShowAgain(true);
    setShowPopover(false);
  };

  // useEffect(() => {
  //   if(showPopover) {
  //     const timeout = setTimeout(() => {
  //       setShowPopover(false);
  //     }, 5000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [showPopover]);

  useEffect(() => {
    const item = document.getElementById('itemToTrack');

    const handleScroll = () => {
      const itemRect = item.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (itemRect.top < windowHeight && itemRect.bottom > 70) {
        setShowPopover(true);
      } else {
        setShowPopover(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className="bhoomi-nav">
      <div className="bhoomi-nav-section">
        <ul className="bhoomi-nav-list">
          <li>
            <a href="#">All</a>
          </li>
          <li>
            <a href="#">Fresh</a>
          </li>
          <li>
            <a href="#">Today's Deals</a>
          </li>
          <li>
            <a href="#">Buy Again</a>
          </li>
          <li>
            <a href="#">Electronics</a>
          </li>
          <li>
            <a href="#">bhoomi Pay</a>
          </li>
          <li>
            <a href="#">Home & Kitchen</a>
          </li>
          <li>
            <a href="#">bhoomi miniTV</a>
          </li>
          <li>
            <a href="#">New Releases</a>
          </li>
          <li>
            <a href="#">Flights</a>
          </li>
          <li>
            <a href="#">Today's Deals</a>
          </li>
          <li>
            <a href="#">Customer Service</a>
          </li>
          {/* <li><a href="#">Gift cards</a></li> */}
          {/* <li><a href="#">Health, Household & Personal Care</a></li> */}
          {/* <Link style={{ textDecoration: "none" }} to="/seller">
            <li>
              <a href="#" style={{ color: "#146eb4" }}>
                Seller
              </a>
            </li> */}
          {/* </Link> */}
          {/* <Link style={{ textDecoration: "none" }} to="/education">
            <li>
              <a href="#" style={{ color: "#146eb4" }}>
                Educational Section
              </a>
            </li>
          </Link> */}
          {/* <Link style={{ textDecoration: "none" }} to="/sustainability">
            <li>
              <a href="#" style={{ color: "#146eb4" }}>
                Sustainability Reports
              </a>
            </li>
          </Link> */}

          <div className="popover_trigger_nav">
            <Link style={{ textDecoration: "none" }} to="/greencart">
              <button id="itemToTrack" className="button">
                GreenCart Zone
              </button>
            </Link>
            {showPopover && !dontShowAgain && (
              <div className="popover_content_nav">
                <div className="triangle"></div>
                <p>
                  Introducing our brand new section<br></br>GreenCart Zone
                </p>
                <button onClick={closePopover} className="got_it">
                  Got It
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>
    </div>
  );
};

export default bhoomiNavigationBar;