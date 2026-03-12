const qrcode = require('qrcode');

const generateQR = async (text) => {
    try {
        const qrCodeDataUrl = await qrcode.toDataURL(text);
        return qrCodeDataUrl;
    } catch (err) {
        console.error('QR Code generation failed', err);
        throw err;
    }
};

module.exports = generateQR;
