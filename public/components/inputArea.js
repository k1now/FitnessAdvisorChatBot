const InputArea = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = React.useState('');
    const textareaRef = React.useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    React.useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    return React.createElement('form', {
        className: 'input-container',
        onSubmit: handleSubmit
    }, [
        React.createElement('textarea', {
            key: 'input',
            ref: textareaRef,
            className: 'input-field',
            value: message,
            onChange: (e) => setMessage(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: 'Type your message...',
            disabled: isLoading
        }),
        React.createElement('button', {
            key: 'button',
            type: 'submit',
            className: 'send-button',
            disabled: !message.trim() || isLoading
        }, 'Send')
    ]);
};

export default InputArea; 