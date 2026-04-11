/**
 * PortraitPay AI - Local-First Portrait Fingerprint Module
 *
 * This module implements perceptual hashing (pHash/dHash) in the browser
 * to generate irreversible portrait fingerprints WITHOUT uploading the original image.
 *
 * The fingerprint is a compact representation that can be used for similarity
 * matching but cannot be reverse-engineered to recreate the original image.
 */

class PortraitFingerprint {
    /**
     * Generate a perceptual hash from an image file.
     * Uses dHash (difference hash) algorithm - fast and effective.
     *
     * @param {File|Blob|string} imageSource - Image file, blob, or data URL
     * @returns {Promise<{hash: string, type: string, bits: number}>}
     */
    static async generate(imageSource) {
        const img = await this._loadImage(imageSource);
        const hash = await this._dHash(img);
        return {
            hash: hash,
            type: 'dhash',
            bits: hash.length * 4,  // Each hex char = 4 bits
            size: 8  // 8x8 hash
        };
    }

    /**
     * Generate multiple perceptual hashes for robustness.
     */
    static async generateMultiple(imageSource) {
        const img = await this._loadImage(imageSource);
        return {
            dhash: await this._dHash(img),
            ahash: await this._aHash(img),
            // phash is more expensive, only compute if needed
        };
    }

    /**
     * Load an image from various sources.
     */
    static _loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;

            if (source instanceof File || source instanceof Blob) {
                img.src = URL.createObjectURL(source);
            } else if (typeof source === 'string') {
                img.src = source;
            } else {
                reject(new Error('Invalid image source'));
            }
        });
    }

    /**
     * Difference Hash (dHash) - compares pixel brightness differences.
     * Produces a 64-bit hash from 8x8 grayscale image.
     */
    static async _dHash(img) {
        const size = 9;  // 9x8 for dHash (need 2 columns to compare)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resize to 9x8
        canvas.width = size;
        canvas.height = size - 1;
        ctx.drawImage(img, 0, 0, size, size - 1);

        const imageData = ctx.getImageData(0, 0, size, size - 1);
        const pixels = imageData.data;

        // Compute grayscale values (just the green channel as approximation)
        const grayscale = [];
        for (let i = 0; i < pixels.length; i += 4) {
            grayscale.push(pixels[i + 1]);  // Use green channel
        }

        // Compute differences between adjacent pixels (left to right)
        let hash = '';
        for (let row = 0; row < size - 1; row++) {
            for (let col = 0; col < size - 1; col++) {
                const left = grayscale[row * size + col];
                const right = grayscale[row * size + col + 1];
                hash += left < right ? '1' : '0';
            }
        }

        // Convert to hex
        return this._binaryToHex(hash);
    }

    /**
     * Average Hash (aHash) - compares pixels to average brightness.
     */
    static async _aHash(img) {
        const size = 8;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;

        // Compute average brightness
        let sum = 0;
        const grayscale = [];
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = pixels[i + 1];  // Green channel
            grayscale.push(gray);
            sum += gray;
        }
        const avg = sum / grayscale.length;

        // Compute hash based on whether pixel is above or below average
        let binary = '';
        for (const pixel of grayscale) {
            binary += pixel >= avg ? '1' : '0';
        }

        return this._binaryToHex(binary);
    }

    /**
     * Convert binary string to hexadecimal.
     */
    static _binaryToHex(binary) {
        let hex = '';
        for (let i = 0; i < binary.length; i += 4) {
            const nibble = binary.substring(i, i + 4);
            hex += parseInt(nibble, 2).toString(16);
        }
        return hex;
    }

    /**
     * Calculate Hamming distance between two hashes.
     * Lower distance = more similar images.
     */
    static hammingDistance(hash1, hash2) {
        if (hash1.length !== hash2.length) {
            // Try to match lengths
            const minLen = Math.min(hash1.length, hash2.length);
            hash1 = hash1.substring(0, minLen);
            hash2 = hash2.substring(0, minLen);
        }

        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            const n1 = parseInt(hash1[i], 16);
            const n2 = parseInt(hash2[i], 16);
            const xor = n1 ^ n2;
            distance += binCount(xor);
        }
        return distance;

        function binCount(n) {
            let count = 0;
            while (n) {
                count++;
                n &= n - 1;
            }
            return count;
        }
    }

    /**
     * Calculate similarity (0-1) between two hashes.
     * 1.0 = identical, 0.0 = completely different.
     */
    static similarity(hash1, hash2) {
        const maxBits = Math.max(hash1.length * 4, hash2.length * 4);
        const distance = this.hammingDistance(hash1, hash2);
        return 1.0 - (distance / maxBits);
    }
}


/**
 * Local Storage Manager for PortraitPay Local-First
 *
 * Handles storing portrait data locally in the browser's IndexedDB
 * so that original images never need to be sent to the server.
 */
class LocalPortraitStore {
    constructor(dbName = 'portraitpay_local', storeName = 'portraits') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('deviceId', 'deviceId', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * Save a portrait locally.
     * @param {Object} portraitData - { imageBlob, name, fingerprint, deviceId, metadata }
     */
    async savePortrait(portraitData) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const record = {
                ...portraitData,
                createdAt: new Date().toISOString()
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all locally stored portraits.
     */
    async getAllPortraits() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a portrait by ID.
     */
    async deletePortrait(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export all local data as a JSON blob for backup.
     */
    async exportData() {
        const portraits = await this.getAllPortraits();
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            portraits: portraits
        };
    }

    /**
     * Import data from a backup.
     */
    async importData(data) {
        if (!this.db) await this.init();
        if (data.version !== 1) {
            throw new Error('Unsupported backup version');
        }

        for (const portrait of data.portraits) {
            await this.savePortrait(portrait);
        }
    }
}


// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.PortraitFingerprint = PortraitFingerprint;
    window.LocalPortraitStore = LocalPortraitStore;
}
