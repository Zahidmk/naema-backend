#!/bin/bash
# naema VPS - SSH Key Setup Script
# Run this on your LOCAL Mac to set up passwordless SSH authentication

VPS_IP="72.61.240.40"
VPS_USER="root"

echo "=============================================="
echo "  naema VPS - SSH Key Setup"
echo "=============================================="
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_ed25519.pub ]; then
    echo "❌ No SSH key found. Generating one..."
    ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)" -f ~/.ssh/id_ed25519 -N ""
    echo "✅ SSH key generated!"
else
    echo "✅ SSH key already exists"
fi

echo ""
echo "Your public key:"
echo "----------------------------------------"
cat ~/.ssh/id_ed25519.pub
echo "----------------------------------------"
echo ""

# Copy key to VPS
echo "📤 Copying SSH key to VPS..."
echo "   This will ask for your VPS password ONE LAST TIME"
echo ""

ssh-copy-id -i ~/.ssh/id_ed25519.pub ${VPS_USER}@${VPS_IP}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH key copied successfully!"
    echo ""
    
    # Test connection
    echo "🔐 Testing passwordless connection..."
    ssh -o PasswordAuthentication=no -o BatchMode=yes ${VPS_USER}@${VPS_IP} "echo '✅ SSH key authentication works!'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=============================================="
        echo "  ✅ SUCCESS! SSH Key Setup Complete"
        echo "=============================================="
        echo ""
        echo "You can now connect without password:"
        echo "  ssh root@${VPS_IP}"
        echo ""
        echo "Next step: Run the security hardening script:"
        echo "  ssh root@${VPS_IP} 'bash -s' < scripts/secure-vps.sh"
        echo ""
    else
        echo "⚠️  SSH key copied but test failed. Try manually:"
        echo "  ssh root@${VPS_IP}"
    fi
else
    echo ""
    echo "❌ Failed to copy SSH key. Try manually:"
    echo ""
    echo "cat ~/.ssh/id_ed25519.pub | ssh root@${VPS_IP} 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'"
fi
