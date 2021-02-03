const startAutolock = async autoLock => {
	//Receive autoLock from the popup (upon registration or unlocking)
	if (
		idleListenerReady === false &&
		autoLock &&
		autoLock.type !== 'default' &&
		(autoLock.type === 'locked' || autoLock.type === 'idle')
	) {
		chrome.idle.setDetectionInterval(parseInt(autoLock.mn) * 60);
		chrome.idle.onStateChanged.addListener(state => {
			switch (true) {
				case autoLock.type === 'locked' && state === 'locked':
					mk = null;
					break;
				case autoLock.type === 'idle' && state !== 'active':
					mk = null;
					break;
				default:
					// Nothing
					break;
			}
		});
		idleListenerReady = true;
	}
};
