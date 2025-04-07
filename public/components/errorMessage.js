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

export default ErrorMessage; 