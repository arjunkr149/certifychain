#!/bin/bash
echo ""
echo " =========================================="
echo "  CertifyChain - AI Certificate Verifier"
echo " =========================================="
echo ""

# Kill anything on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo " Starting server on http://localhost:3000"
echo " Open this URL in your browser"
echo " Press Ctrl+C to stop"
echo ""
node server.js
