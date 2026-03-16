// =============================================
// SkyLayer.tsx — Sky clouds above islands
// WiggleWoo's Word Quest
// =============================================

import "./SkyLayer.css";

const CLOUD = "/assets/cloud-cluster.png";

const SkyLayer: React.FC = () => (
  <div className="cloud-layer">
    {/* Smooth gradient sky — sits behind clouds */}
    <div className="sky-backdrop" />
    {/* Above castle island (top-left) */}
    <img className="cloud cloud--1" src={CLOUD} alt="" draggable={false} />
    {/* Above volcano (top-center-left) */}
    <img className="cloud cloud--2" src={CLOUD} alt="" draggable={false} />
    {/* Small filler between volcano and city */}
    <img className="cloud cloud--3" src={CLOUD} alt="" draggable={false} />
    {/* Above crystal city (top-right) */}
    <img className="cloud cloud--4" src={CLOUD} alt="" draggable={false} />
  </div>
);

export default SkyLayer;
