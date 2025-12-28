#!/bin/bash

# Clear browser localStorage for testing
# This helps when you have invalid/expired tokens

echo "🔧 Token Troubleshooting Guide"
echo "=============================="
echo ""
echo "If you're seeing 403 errors, it's likely due to an invalid JWT token."
echo ""
echo "Quick Fix Options:"
echo ""
echo "1. Open your browser console (F12) and run:"
echo "   localStorage.removeItem('token');"
echo "   localStorage.removeItem('user');"
echo "   Then refresh the page."
echo ""
echo "2. OR simply log out and log back in"
echo ""
echo "3. OR clear your browser's localStorage for localhost:3000"
echo ""
echo "Why this happens:"
echo "- The JWT_SECRET changed when containers restarted"
echo "- Old tokens signed with different secret are now invalid"
echo "- New login will generate fresh token with current secret"
echo ""
echo "The app now auto-detects this and will redirect you to login!"
echo ""
