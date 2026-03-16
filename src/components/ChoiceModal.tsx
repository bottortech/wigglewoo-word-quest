// =============================================
// ChoiceModal.tsx — Learn a Fact / Power It Up choice
// WiggleWoo's Word Quest
// =============================================

import "../styles/choice-modal.css";

interface ChoiceModalProps {
  objectName: string;
  onLearnFact: () => void;
  onPowerUp: () => void;
  onClose: () => void;
}

const ChoiceModal: React.FC<ChoiceModalProps> = ({ objectName, onLearnFact, onPowerUp, onClose }) => (
  <div className="choice-modal-backdrop" onClick={onClose}>
    <div className="choice-modal" onClick={(e) => e.stopPropagation()}>
      <button className="choice-modal__x" onClick={onClose}>✕</button>
      <h3 className="choice-modal__title">{objectName}</h3>
      <p className="choice-modal__note">How would you like to discover this?</p>
      <div className="choice-modal__buttons">
        <button className="choice-modal__btn choice-modal__btn--learn" onClick={onLearnFact}>
          <span className="choice-modal__btn-icon">📖</span>
          <span className="choice-modal__btn-label">Learn a Fact</span>
          <span className="choice-modal__btn-reward">+1 Sticker</span>
        </button>
        <button className="choice-modal__btn choice-modal__btn--power" onClick={onPowerUp}>
          <span className="choice-modal__btn-icon">⚡</span>
          <span className="choice-modal__btn-label">Power It Up</span>
          <span className="choice-modal__btn-reward">+2 Stickers</span>
        </button>
      </div>
    </div>
  </div>
);

export default ChoiceModal;
