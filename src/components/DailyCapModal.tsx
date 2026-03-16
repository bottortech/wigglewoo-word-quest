// =============================================
// DailyCapModal.tsx — Daily fact cap reached message
// WiggleWoo's Word Quest
// =============================================

import "../styles/choice-modal.css";

interface DailyCapModalProps {
  onClose: () => void;
}

const DailyCapModal: React.FC<DailyCapModalProps> = ({ onClose }) => (
  <div className="choice-modal-backdrop" onClick={onClose}>
    <div className="choice-modal choice-modal--cap" onClick={(e) => e.stopPropagation()}>
      <div className="choice-modal__emoji">🌟</div>
      <h3 className="choice-modal__title">Great Exploring!</h3>
      <p className="choice-modal__cap-msg">
        You discovered 4 facts today!<br />
        Come back tomorrow to explore more!
      </p>
      <button className="choice-modal__close-btn" onClick={onClose}>
        OK!
      </button>
    </div>
  </div>
);

export default DailyCapModal;
