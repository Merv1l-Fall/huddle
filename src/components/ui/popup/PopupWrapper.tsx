import "PopupWrapper.css";

const PopupWrapper: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
	return (
		<div className="popup-overlay" onClick={onClose}>
			<div className="popup-content" onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
}

export default PopupWrapper;