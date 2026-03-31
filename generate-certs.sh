#!/bin/bash

# Generate self-signed SSL certificates for development
mkdir -p ./certs

# Generate private key and certificate valid for 365 days
openssl req -x509 -newkey rsa:4096 -keyout ./certs/key.pem -out ./certs/cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,DNS:172.16.0.152,IP:127.0.0.1,IP:172.16.0.152"

echo "✅ SSL certificates generated in ./certs/"
echo "   - cert.pem"
echo "   - key.pem"
