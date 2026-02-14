// =============================================
// LabBackground.tsx — Shared decorative wrapper
// WiggleWoo's Word Quest
// =============================================
// Renders the WiggleWoo lab environment:
//   - Background wallpaper (play-now-screen.png)
//   - Hanging light bulbs
//   - Left machine (machine2) with gear + pipes
//   - Right machine (machine1) with animated gauge/needle
//   - Background decorative gears
//   - Pipe strips, corner bolts
//
// Used by: PlayNowScreen, GameScreen, QuestMapScreen
// Children render inside the lab environment.
// =============================================

import React from "react";
import machine1 from "../assets/machine1.png";
import machine2 from "../assets/machine2.png";
import gaugeImg from "../assets/guage.png";
import needleImg from "../assets/needle_guage_pin.png";
import gear1 from "../assets/gear1.png";
import gear2 from "../assets/gear2.png";
import gear3 from "../assets/gear3.png";
import pipe1 from "../assets/pipe1.png";
import pipe2 from "../assets/pipe2.png";
import Bulb from "./Bulb";
import "../styles/home.css";

interface LabBackgroundProps {
  children: React.ReactNode;
  /** Additional CSS class on the root element */
  className?: string;
}

const LabBackground: React.FC<LabBackgroundProps> = ({ children, className = "" }) => {
  return (
    <div className={`lab-bg ${className}`}>
      {/* Background decorative gears — behind machines */}
      <img src={gear2} alt="" className="bg-gear bg-gear-1" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-2" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-3" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-4" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-5" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-6" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-7" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-8" draggable={false} />

      {/* Decorative workshop machine — left side */}
      <img
        src={machine2}
        alt=""
        className="home-machine home-machine-left"
        draggable={false}
      />
      {/* Gear mounted on machine joint */}
      <img
        src={gear1}
        alt=""
        className="home-gear home-gear-left"
        draggable={false}
      />
      {/* Pipe connecting machine to frame */}
      <img
        src={pipe1}
        alt=""
        className="home-pipe home-pipe-left"
        draggable={false}
      />
      {/* Straight pipe along bottom — floor supply line */}
      <img
        src={pipe2}
        alt=""
        className="home-pipe home-pipe-bottom"
        draggable={false}
      />

      {/* Decorative workshop machine — right side (with gauge + needle) */}
      <div className="home-machine-right-wrap">
        <img
          src={machine1}
          alt=""
          className="home-machine home-machine-right"
          draggable={false}
        />
        <img
          src={gaugeImg}
          alt=""
          className="home-gauge-face"
          draggable={false}
        />
        <div className="home-needle-wrap">
          <img
            src={needleImg}
            alt=""
            className="home-gauge-needle"
            draggable={false}
          />
        </div>
      </div>

      {/* Decorative light bulbs overlay */}
      <div className="bulb-overlay">
        <Bulb className="bulb-top-1" interval={4000} delay={300} onDuration={1400} />
        <Bulb className="bulb-top-2" interval={3500} delay={1200} onDuration={1200} />
        <Bulb className="bulb-top-3" interval={4500} delay={2000} onDuration={1300} />
        <Bulb className="bulb-top-4" interval={3800} delay={700} onDuration={1100} />
      </div>

      {/* Pipe strips + corner bolts */}
      <div className="machine-world-pipes-top" />
      <div className="machine-world-pipes-bottom" />
      <span className="machine-bolt machine-bolt--tl" />
      <span className="machine-bolt machine-bolt--tr" />
      <span className="machine-bolt machine-bolt--bl" />
      <span className="machine-bolt machine-bolt--br" />

      {/* Screen content renders here */}
      {children}
    </div>
  );
};

export default LabBackground;
