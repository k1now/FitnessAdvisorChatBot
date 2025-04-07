import Message from './message.js';
import LoadingIndicator from './loadingIndicator.js';
import ErrorMessage from './errorMessage.js';

const MessageList = ({ messages, isLoading, error }) => {
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return React.createElement('div', {
        className: 'messages-container'
    }, [
        ...messages.map((msg, index) => 
            React.createElement(Message, {
                key: index,
                text: msg.text,
                isUser: msg.isUser,
                timestamp: msg.timestamp
            })
        ),
        error && React.createElement(ErrorMessage, {
            key: 'error',
            message: error.message,
            onRetry: error.onRetry
        }),
        isLoading && React.createElement(LoadingIndicator, { key: 'loading' }),
        React.createElement('div', { key: 'scroll-ref', ref: messagesEndRef })
    ]);
};

export default MessageList; 