// AES implementation using cryptojs

const keySize = 256;
const iterations = 100;

// We add an md5 hash to check if decryption is successful later on.
function encryptJson(json, pwd) {
	json.hash = md5(json.list);
	const msg = encrypt(JSON.stringify(json), pwd);
	return msg;
}

// Decrypt and check the hash to confirm the decryption
function decryptToJson(msg, pwd) {
	try {
		let decrypted = decrypt(msg, pwd).toString(CryptoJS.enc.Utf8);
		decrypted = JSON.parse(decrypted);
		if (decrypted.hash != null && decrypted.hash === md5(decrypted.list))
			return decrypted;
		else {
			return null;
		}
	} catch (e) {
		return null;
	}
}

// AES encryption with master password
function encrypt(msg, pass) {
	const salt = CryptoJS.lib.WordArray.random(128 / 8);
	const key = CryptoJS.PBKDF2(pass, salt, {
		keySize: keySize / 32,
		iterations: iterations,
	});

	const iv = CryptoJS.lib.WordArray.random(128 / 8);

	const encrypted = CryptoJS.AES.encrypt(msg, key, {
		iv: iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC,
	});
	// salt, iv will be hex 32 in length
	// append them to the ciphertext for use  in decryption
	const transitmessage =
		salt.toString() + iv.toString() + encrypted.toString();
	return transitmessage;
}

// AES decryption with master password
function decrypt(transitmessage, pass) {
	const salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
	const iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
	const encrypted = transitmessage.substring(64);

	const key = CryptoJS.PBKDF2(pass, salt, {
		keySize: keySize / 32,
		iterations: iterations,
	});

	const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
		iv: iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC,
	});
	return decrypted;
}
