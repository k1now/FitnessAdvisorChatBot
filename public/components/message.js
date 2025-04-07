const Message = ({ text, isUser, timestamp }) => {
    const messageClass = `message ${isUser ? 'user' : 'bot'}`;
    const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    return React.createElement('div', {
        className: messageClass
    }, [
        React.createElement('div', {
            key: 'text',
            style: { marginBottom: '4px' }
        }, text),
        React.createElement('div', {
            key: 'time',
            className: 'message-time'
        }, formattedTime)
    ]);
};

export default Message; 