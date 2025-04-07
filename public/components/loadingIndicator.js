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

export default LoadingIndicator; 