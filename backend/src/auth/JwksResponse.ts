export interface JwksResponse {
    keys: [
        {
            alg: string, // is the algorithm for the key
            kty: string, // Key Type
            use: string, // how meant to be used
            x5c: string[], // is the x509 certificate chain
            n: string, // is the moduluos for a standard pem
            e: string, // is the exponent for a standard pem
            kid: string, // is the unique identifier for the key
            x5t: string //is the thumbprint of the x.509 cert (SHA-1 thumbprint)
        }
    ]
}