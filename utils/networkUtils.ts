/**
 * Detects the local IP address using WebRTC.
 * Note: Modern browsers may return an mDNS address (UUID-like string) instead of a raw IP
 * for privacy reasons unless specific browser flags are disabled.
 */
export const getLocalIpAddress = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Use Google's public STUN server to ensure candidate gathering triggers
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            peerConnection.createDataChannel('');

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
                    const match = event.candidate.candidate.match(ipRegex);

                    if (match) {
                        const ip = match[1];
                        // Simple check for private IP ranges (10.x, 192.168.x, 172.16-31.x)
                        // This helps avoid returning the public IP if the STUN server returns it first
                        if (ip.startsWith('192.168.') || ip.startsWith('10.') || (ip.startsWith('172.') && parseInt(ip.split('.')[1], 10) >= 16 && parseInt(ip.split('.')[1], 10) <= 31)) {
                            resolve(ip);
                            peerConnection.close();
                        }
                    }
                }
            };

            peerConnection.createOffer()
                .then((offer) => peerConnection.setLocalDescription(offer))
                .catch((err) => {
                    console.error('Error creating offer:', err);
                    resolve('Unavailable');
                });

            // Timeout after 3 seconds. If we found a candidate (even public), we might want to return it as fallback,
            // but for now let's stick to "Unavailable" if no private IP is found to avoid confusion.
            setTimeout(() => {
                if (peerConnection.signalingState !== 'closed') {
                    resolve('Unavailable (Check Browser Privacy Settings)');
                    peerConnection.close();
                }
            }, 3000);

        } catch (error) {
            console.error('Error getting local IP:', error);
            resolve('Error');
        }
    });
};
