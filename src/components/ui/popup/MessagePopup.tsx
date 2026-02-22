import "./MessagePopup.css";
interface MessagePopupProps {
    type: 'error' | 'success' | 'warning' | 'info';
    message: string;
    onClose: () => void;
    buttonText?: string;
}

const MessagePopup = ({ type, message, onClose, buttonText = 'Close' }: MessagePopupProps) => {
    return (
        <div className={`message-popup message-popup--${type}`}>
            <p>{message}</p>
            <button onClick={onClose}>{buttonText}</button>
        </div>
    );
}

export default MessagePopup;