// LoadingIndicator Component
const LoadingIndicator = () => {
    return React.createElement('div', {
        className: 'loading-indicator'
    }, [
        React.createElement('div', {
            key: 'dot1',
            className: 'loading-dot'
        }),
        React.createElement('div', {
            key: 'dot2',
            className: 'loading-dot'
        }),
        React.createElement('div', {
            key: 'dot3',
            className: 'loading-dot'
        })
    ]);
};

// ErrorMessage Component
const ErrorMessage = ({ message, onRetry }) => {
    return React.createElement('div', {
        className: 'error-message'
    }, [
        React.createElement('span', {
            key: 'text'
        }, message),
        onRetry && React.createElement('button', {
            key: 'retry',
            onClick: onRetry
        }, 'Retry')
    ]);
};

// Message Component
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

// MessageList Component
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

// InputArea Component
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

// App Component
const App = () => {
    const [messages, setMessages] = React.useState([
        { text: "Hello! How can I help you today?", isUser: false, timestamp: Date.now() }
    ]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleSendMessage = async (text) => {
        // Input validation
        if (!text.trim()) {
            setError({
                message: 'Please enter a message',
                onRetry: null
            });
            return;
        }

        if (text.length > 1000) {
            setError({
                message: 'Message is too long (max 1000 characters)',
                onRetry: null
            });
            return;
        }

        // Add user message
        const userMessage = { text, isUser: true, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response from server');
            }

            const botMessage = {
                text: typeof data.message === 'string' ? data.message : JSON.stringify(data.message),
                isUser: false,
                timestamp: data.timestamp
            };
            
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            // Handle specific error cases
            let errorMessage = err.message;
            let showRetry = true;

            if (err.message.includes('Server configuration error')) {
                errorMessage = 'Server is not properly configured. Please contact support.';
                showRetry = false;
            } else if (err.message.includes('Message is required')) {
                errorMessage = 'Please enter a message';
                showRetry = false;
            } else if (err.message.includes('Message must be a string')) {
                errorMessage = 'Invalid message format';
                showRetry = false;
            } else if (err.message.includes('Message is too long')) {
                errorMessage = 'Message is too long (max 1000 characters)';
                showRetry = false;
            }

            setError({
                message: errorMessage,
                onRetry: showRetry ? () => handleSendMessage(text) : null
            });
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', {
        className: 'chat-container'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'chat-header'
        }, React.createElement('h1', null, 'Workout Advisor ChatBot')),
        React.createElement(MessageList, {
            key: 'messages',
            messages: messages,
            isLoading: isLoading,
            error: error
        }),
        React.createElement(InputArea, {
            key: 'input',
            onSendMessage: handleSendMessage,
            isLoading: isLoading
        })
    ]);
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
