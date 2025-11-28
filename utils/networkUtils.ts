/**
 * Detects the local IP address using WebRTC.
 * Note: Modern browsers may return an mDNS address (UUID-like string) instead of a raw IP
 * for privacy reasons unless specific browser flags are disabled.
 */
export const getLocalIpAddress = async (): Promise<string> => {
    try {
        const response = await fetch('/api/host-ip');
        if (response.ok) {
            const data = await response.json();
            return data.ip;
        }
        return 'Unavailable';
    } catch (error) {
        console.error('Error fetching host IP:', error);
        return 'Error';
    }
};
