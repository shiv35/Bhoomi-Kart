import React from "react";
import "../styles/Home.css";

// Remove the duplicate ImageSlider import here
// import ImageSlider from "/Imageslider";
import ImageSlider from "./Imageslider";
import Product from "./Product";
// import {
//   ImageSlider,
//   Productbutton,
//   Productbutton1,
// } from "./MissingComponents";

function Home() {
  return (
    <div className="home">
      <div className="home__container">
        {/* <img
          className="home__image"
          src="https://images-eu.ssl-images-bhoomi.com/images/G/02/digital/video/merch2016/Hero/Covid19/Generic/GWBleedingHero_ENG_COVIDUPDATE__XSite_1500x600_PV_en-GB._CB428684220_.jpg"
          alt=""
        /> */}
        <ImageSlider />

        <div className="home__row">
          <Product
            id="12321341"
            title="Disposable Plastic Drinking Straws – a pack of 100 clear, BPA-free straws designed for convenience and reliability, 7.75-inch"
            price={7.5}
            rating={3}
            image="/images/straw.jpg"
            badge_id={0}
          />
          <Product
            id="49538094"
            title="Kenwood kMix Stand Mixer for Baking, Stylish Kitchen Mixer with K-beater, Dough Hook and Whisk, 5 Litre Glass Bowl"
            price={239.0}
            rating={4}
            image="/images/mixer.jpg"
            badge_id={0}
          />
        </div>

        <div className="home__row">
          <Product
            id="3254354345"
            title="New Apple iPad Pro (12.9-inch, Wi-Fi, 128GB) - Silver (4th Generation)"
            price={598.99}
            rating={4}
            image="/images/tablet.jpg"
            badge_id={0}
          />
          <Product
            id="23445930"
            title="bhoomi Echo (3rd generation) | Smart speaker with Alexa, Charcoal Fabric"
            price={98.99}
            rating={5}
            image="/images/echo.jpg"
            badge_id={0}
          />
          <Product
            id="958462"
            title="Woven Bag for Women, Leather Tote Bag Large Summer Beach Travel Handbag and Purse Retro Handmade Shoulder Bag"
            price={19.99}
            rating={5}
            image="/images/leatherbag.jpg"
            badge_id={0}
          />
        </div>

        <div className="home__row">
          <Product
            id="90829332"
            title="Samsung LC49RG90SSUXEN 49' Curved LED Gaming Monitor - Super Ultra Wide Dual WQHD 5120 x 1440"
            price={1094.98}
            rating={4}
            image="/images/monitor.jpg"
            badge_id={0}
          />
        </div>
        <button
          onClick={() => (window.location.href = "/greencart")}
          style={{
            backgroundColor: "#388e3c",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Available in GreenCart zone
        </button>
      </div>
    </div>
  );
}

export default Home;
