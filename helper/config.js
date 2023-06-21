const config = {
    app: {
        port: 3002
    },
    secret_key:'Quoded_secret_key',
    
    // 64 bit secret key
    // crypto_key:"d1d169f499786282b8547cc8a1b25d651b24bd8dbdd9edb25e145a3b2fac319e04d7989a3cc94314dcc40463a17b0ff2b816c77f189bc511324d5ffcc09f6af1",
    // 16 bit InitVector
    // crypto_initVector:"ce7b2e85830ea740fb73d2ecc5e4f7db",

    // 34 bit secret key
    crypto_key:"wdl2nplkJNrXp+yP2n3ZQmdcFNyvKDZF1W6x0VD80h8=",
    // 32 bit InitVector
    crypto_initVector :"2EWIBgwI/QXjsjDtM0I+m8RHX1BF/XZ1ujVjB096qVI=",
    // crypto_algorithm:"aes-256-cbc"
}

module.exports = config;
