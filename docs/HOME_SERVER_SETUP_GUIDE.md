# Complete Home Server Setup Guide
## MSI Pro DP21 with Ubuntu Server + Cloudflare Tunnel + Coolify

**Hardware Required:**
- MSI Pro DP21 mini PC
- USB flash drive (8GB or larger)
- Ethernet cable
- Keyboard (USB)
- Monitor with HDMI cable
- Surge protector

**Accounts Needed:**
- Cloudflare account (free) - https://dash.cloudflare.com
- GitHub account (for deploying sites)

---

# PHASE 1: CREATE THE BOOTABLE USB (On Your Windows PC)

## Step 1.1: Download Ubuntu Server

1. Open your web browser
2. Go to: `https://ubuntu.com/download/server`
3. Click the green button that says **"Download Ubuntu Server 24.04.1 LTS"**
4. Save the file to your **Downloads** folder
5. Wait for download to complete (about 2.5 GB)
6. The file will be named something like: `ubuntu-24.04.1-live-server-amd64.iso`

## Step 1.2: Download Rufus

1. Go to: `https://rufus.ie`
2. Scroll down to the **Download** section
3. Click **"Rufus 4.x"** (the standard version, not portable)
4. Save to your **Downloads** folder
5. The file will be named: `rufus-4.x.exe`

## Step 1.3: Prepare Your USB Flash Drive

1. Insert your USB flash drive into your Windows PC
2. Open **File Explorer** (Windows key + E)
3. Look at the left sidebar - note the drive letter of your USB (e.g., D:, E:, F:)
4. **WARNING**: Everything on this USB will be erased

## Step 1.4: Create the Bootable USB with Rufus

1. Double-click `rufus-4.x.exe` in your Downloads folder
2. If Windows asks "Do you want to allow this app to make changes?" click **Yes**
3. Rufus will open. Configure these settings:

```
┌─────────────────────────────────────────────────────────────┐
│ Device:           [Select your USB flash drive]            │
│                   (Make sure it shows correct size)         │
├─────────────────────────────────────────────────────────────┤
│ Boot selection:   [Disk or ISO image (Please select)]      │
│                   Click "SELECT" button ──────────────────► │
├─────────────────────────────────────────────────────────────┤
│ Partition scheme: [GPT]         ◄── Change if needed        │
├─────────────────────────────────────────────────────────────┤
│ Target system:    [UEFI (non CSM)]  ◄── Change if needed    │
├─────────────────────────────────────────────────────────────┤
│ Volume label:     [Ubuntu 24.04...]  (auto-filled)          │
├─────────────────────────────────────────────────────────────┤
│ File system:      [FAT32]       ◄── Leave as default        │
├─────────────────────────────────────────────────────────────┤
│ Cluster size:     [Default]     ◄── Leave as default        │
└─────────────────────────────────────────────────────────────┘
```

4. Click the **SELECT** button next to "Boot selection"
5. Navigate to your **Downloads** folder
6. Click on `ubuntu-24.04.1-live-server-amd64.iso`
7. Click **Open**
8. Verify settings:
   - **Partition scheme**: GPT
   - **Target system**: UEFI (non CSM)
9. Click **START** at the bottom
10. If a popup asks about ISO vs DD mode, select **"Write in ISO Image mode (Recommended)"** and click **OK**
11. A warning will appear: "All data on device will be destroyed" - click **OK**
12. Wait for the progress bar to complete (takes 5-10 minutes)
13. When it says **"READY"** in green at the bottom, click **CLOSE**
14. Safely eject the USB:
    - Click the **^** arrow in your taskbar (bottom right)
    - Click the USB icon
    - Click "Eject [Your USB Drive Name]"
15. Remove the USB flash drive

---

# PHASE 2: PREPARE THE MSI PRO DP21

## Step 2.1: Physical Setup

1. Unbox the MSI Pro DP21
2. Place it on a stable surface near your router (or where you'll do initial setup)
3. Connect the **surge protector** to power outlet
4. Plug the MSI power adapter into the surge protector
5. Connect the power adapter to the MSI
6. Connect **HDMI cable** from MSI to your monitor/TV
7. Connect **USB keyboard** to the MSI
8. Connect **ethernet cable** from your router to the MSI
9. Insert the **USB flash drive** (the one you just created) into the MSI
10. **DO NOT power on yet**

## Step 2.2: Enter BIOS

1. Turn on the monitor/TV first
2. Press the **power button** on the MSI
3. **Immediately start pressing the DEL key repeatedly** (tap it every half second)
4. Keep pressing DEL until you see the BIOS screen (blue/gray interface with MSI logo)

**If you miss it and Windows starts loading:**
- Hold the power button for 5 seconds to force shutdown
- Wait 10 seconds
- Try again, pressing DEL faster

## Step 2.3: Configure BIOS Settings

The BIOS interface uses keyboard navigation:
- **Arrow keys**: Move between options
- **Enter**: Select/confirm
- **Esc**: Go back
- **F10**: Save and exit

**Navigate and change these settings:**

### A. Set Boot Mode to UEFI
1. Use arrow keys to go to the **Settings** or **Boot** tab
2. Find **Boot mode select** or **UEFI/Legacy**
3. Press Enter, select **UEFI**
4. Press Enter to confirm

### B. Disable Secure Boot
1. Go to the **Security** tab (use arrow keys)
2. Find **Secure Boot**
3. Press Enter, select **Disabled**
4. Press Enter to confirm

### C. Set USB as First Boot Device
1. Go to the **Boot** tab
2. Find **Boot Option #1** or **Boot Priority**
3. Press Enter
4. Select your **USB flash drive** (may show as "UEFI: SanDisk" or similar)
5. Press Enter to confirm

### D. Save and Exit
1. Press **F10**
2. A popup will ask "Save configuration and exit?"
3. Select **Yes** and press Enter
4. The computer will restart

---

# PHASE 3: INSTALL UBUNTU SERVER

The computer will now boot from the USB drive. You'll see a black screen with text.

## Step 3.1: Start Installation

1. You'll see a menu with options. Use arrow keys to select:
   ```
   Try or Install Ubuntu Server
   ```
2. Press **Enter**
3. Wait for the installer to load (may take 1-2 minutes, you'll see scrolling text)

## Step 3.2: Language Selection

1. Screen shows "Welcome!" with language options
2. **English** should be highlighted by default
3. Press **Enter** to continue

## Step 3.3: Installer Update

1. If asked "Installer update available" - select **Continue without updating**
2. Press **Enter**

## Step 3.4: Keyboard Configuration

1. Screen shows "Keyboard configuration"
2. Layout should show **English (US)**
3. If correct, press **Tab** until **Done** is highlighted
4. Press **Enter**

## Step 3.5: Installation Type

1. Screen shows "Choose type of install"
2. Select **Ubuntu Server** (not minimized)
3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.6: Network Configuration

1. Screen shows "Network connections"
2. You should see your ethernet adapter (eth0, eno1, or enp1s0) with an IP address
3. If it shows an IP like `192.168.1.x` - your network is working
4. Press **Tab** to highlight **Done**
5. Press **Enter**

**If no IP address appears:**
- Check ethernet cable is plugged in
- Wait 30 seconds and press **Tab** then **Enter** on "Done" anyway - you can configure network later

## Step 3.7: Proxy Configuration

1. Screen shows "Configure proxy"
2. Leave the field **empty** (no proxy)
3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.8: Ubuntu Archive Mirror

1. Screen shows "Configure Ubuntu archive mirror"
2. Leave the default mirror URL
3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.9: Storage Configuration

**THIS STEP WILL ERASE WINDOWS 11 - MAKE SURE YOU'RE OK WITH THIS**

1. Screen shows "Guided storage configuration"
2. Select **Use an entire disk** (should be selected by default)
3. Below that, you'll see your SSD listed
4. Make sure your SSD is selected (highlighted)
5. Leave **Set up this disk as an LVM group** checked (default)
6. Press **Tab** to highlight **Done**
7. Press **Enter**

## Step 3.10: Storage Summary

1. Screen shows "Storage configuration" with a summary
2. Review the partition layout (you can just accept defaults)
3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.11: Confirm Destructive Action

1. A popup appears: "Confirm destructive action"
2. This is your last chance - it will erase everything
3. Press **Tab** to highlight **Continue**
4. Press **Enter**

## Step 3.12: Profile Setup

**WRITE THESE DOWN - YOU WILL NEED THEM**

1. Screen shows "Profile setup"
2. Fill in each field (use Tab to move between fields):

```
Your name:        [Your Full Name]
Your server's name: [homeserver]     ◄── This is the hostname
Pick a username:  [mark]             ◄── WRITE THIS DOWN
Choose a password: [**********]      ◄── WRITE THIS DOWN
Confirm password: [**********]       ◄── Must match above
```

**IMPORTANT**: Use a simple username (lowercase, no spaces). Examples: `mark`, `admin`, `user`

**IMPORTANT**: Remember your password! Write it on paper now.

3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.13: Upgrade to Ubuntu Pro

1. Screen shows "Upgrade to Ubuntu Pro"
2. Select **Skip for now**
3. Press **Tab** to highlight **Continue**
4. Press **Enter**

## Step 3.14: SSH Setup

**THIS IS CRITICAL - DO NOT SKIP**

1. Screen shows "SSH Setup"
2. Use arrow keys and **Space bar** to check: **[X] Install OpenSSH server**
3. Leave "Import SSH identity" as **No**
4. Press **Tab** to highlight **Done**
5. Press **Enter**

## Step 3.15: Featured Server Snaps

1. Screen shows "Featured Server Snaps"
2. **Do not select anything** - leave all unchecked
3. Press **Tab** to highlight **Done**
4. Press **Enter**

## Step 3.16: Installation Progress

1. Screen shows "Installing system"
2. Watch the progress - this takes 5-15 minutes
3. Log messages will scroll by - this is normal
4. Wait until you see **Install complete!** at the top
5. Below that, you'll see **Reboot Now**

## Step 3.17: Complete Installation

1. Make sure **Reboot Now** is highlighted
2. Press **Enter**
3. You'll see: "Please remove the installation medium, then press ENTER"
4. **Pull out the USB flash drive**
5. Press **Enter**
6. The computer will restart

---

# PHASE 4: FIRST LOGIN AND INITIAL CONFIGURATION

## Step 4.1: Wait for Boot

1. The screen will show scrolling text as Ubuntu boots
2. Wait until you see:
   ```
   homeserver login: _
   ```

## Step 4.2: Log In

1. Type your **username** (the one you wrote down, e.g., `mark`)
2. Press **Enter**
3. Type your **password** (characters won't show - this is normal)
4. Press **Enter**
5. You should see a welcome message and a command prompt:
   ```
   mark@homeserver:~$
   ```

**If login fails:**
- Make sure Caps Lock is OFF
- Try typing password slowly and carefully
- Username and password are case-sensitive

## Step 4.3: Update the System

Type each command exactly as shown, pressing **Enter** after each line:

```bash
sudo apt update
```

When prompted for password, type your password (characters won't show) and press Enter.

Then type:

```bash
sudo apt upgrade -y
```

Wait for this to complete (may take 5-10 minutes). You'll see lots of text scrolling.

## Step 4.4: Install Essential Tools

```bash
sudo apt install -y curl wget git ufw htop nano net-tools
```

Wait for installation to complete.

## Step 4.5: Find Your Network Interface Name

```bash
ip addr
```

You'll see output like this:
```
1: lo: <LOOPBACK,UP,LOWER_UP> ...
    inet 127.0.0.1/8 ...

2: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
    inet 192.168.1.45/24 ...
```

**Write down:**
- The interface name: `eno1` (yours might be `eth0`, `enp1s0`, or similar)
- The current IP: `192.168.1.45` (yours will be different)

## Step 4.6: Find Your Router's IP (Gateway)

```bash
ip route | grep default
```

Output example:
```
default via 192.168.1.1 dev eno1 proto dhcp
```

**Write down** the gateway IP: `192.168.1.1`

## Step 4.7: Set a Static IP Address

We'll set a static IP so the server always has the same address.

First, check what netplan files exist:

```bash
ls /etc/netplan/
```

You'll see a file like `00-installer-config.yaml` or `50-cloud-init.yaml`

Edit the file (replace filename with what you saw):

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

**Delete everything** in the file (hold Ctrl+K to delete lines)

**Type this exactly** (replace values with your network info):

```yaml
network:
  version: 2
  ethernets:
    eno1:
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
```

**IMPORTANT - Replace these values:**
- `eno1` → Your interface name from Step 4.5
- `192.168.1.100` → Pick an IP in your network range (use .100 to avoid conflicts)
- `192.168.1.1` → Your gateway IP from Step 4.6

**Save the file:**
1. Press **Ctrl+O** (letter O, not zero)
2. Press **Enter** to confirm filename
3. Press **Ctrl+X** to exit

**Apply the new network config:**

```bash
sudo netplan apply
```

**Verify it worked:**

```bash
ip addr
```

You should now see your new static IP (192.168.1.100)

**Test internet connection:**

```bash
ping -c 4 google.com
```

You should see replies. If not, recheck your netplan file for typos.

---

# PHASE 5: CONFIGURE FIREWALL

## Step 5.1: Allow SSH Access

```bash
sudo ufw allow OpenSSH
```

## Step 5.2: Enable Firewall

```bash
sudo ufw enable
```

When asked "Command may disrupt existing ssh connections. Proceed with operation?" type `y` and press Enter.

## Step 5.3: Verify Firewall Status

```bash
sudo ufw status
```

Should show:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
```

---

# PHASE 6: INSTALL CLOUDFLARE TUNNEL

This allows your server to be accessed from the internet without opening ports or having a static public IP.

## Step 6.1: Create Cloudflare Account (if needed)

On your regular computer (not the server), go to:
```
https://dash.cloudflare.com/sign-up
```

Create a free account.

## Step 6.2: Add Your Domain to Cloudflare (if not already)

1. Log into Cloudflare dashboard
2. Click **Add a Site**
3. Enter your domain name (e.g., `dealercharts.com`)
4. Select **Free** plan
5. Cloudflare will scan DNS records
6. Update your domain registrar's nameservers to Cloudflare's (instructions provided)

## Step 6.3: Create a Tunnel

1. In Cloudflare dashboard, click **Zero Trust** in left sidebar
2. If prompted, choose a team name (anything, e.g., your name)
3. Select **Free** plan
4. Go to **Networks** → **Tunnels**
5. Click **Create a tunnel**
6. Select **Cloudflared** as connector type
7. Click **Next**
8. Name your tunnel: `home-server`
9. Click **Save tunnel**

## Step 6.4: Install Cloudflared on Your Server

Cloudflare will show you install commands. On your server, type these commands:

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
```

```bash
sudo dpkg -i cloudflared.deb
```

Now copy the token command from Cloudflare dashboard. It looks like:
```bash
sudo cloudflared service install eyJhIjoiNjM0M...very-long-token...
```

Paste and run that command.

## Step 6.5: Verify Tunnel is Running

```bash
sudo systemctl status cloudflared
```

Should show "active (running)"

In Cloudflare dashboard, the tunnel should now show as **HEALTHY** (green).

## Step 6.6: Add Public Hostnames

In Cloudflare dashboard, still in your tunnel settings:

1. Click **Public Hostnames** tab
2. Click **Add a public hostname**
3. Configure:
   - **Subdomain**: leave empty for root domain, or enter subdomain
   - **Domain**: Select your domain
   - **Path**: leave empty
   - **Service Type**: HTTP
   - **URL**: `localhost:80`
4. Click **Save hostname**

Repeat for each domain/subdomain you want to expose.

---

# PHASE 7: INSTALL COOLIFY (Site Management Dashboard)

Coolify gives you a Digital Ocean-style interface to manage multiple sites.

## Step 7.1: Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

This takes 5-10 minutes. Wait for it to complete.

## Step 7.2: Access Coolify Dashboard

On your regular computer (same network), open a browser and go to:
```
http://192.168.1.100:8000
```
(Replace with your server's static IP)

## Step 7.3: Initial Coolify Setup

1. Create your admin account (email + password)
2. Click through the onboarding wizard
3. When asked about server, select **localhost** (it's already configured)

## Step 7.4: Expose Coolify Through Cloudflare Tunnel

Go back to Cloudflare dashboard → Zero Trust → Tunnels → Your tunnel → Public Hostnames

Add a new hostname:
- **Subdomain**: `panel` (or whatever you want)
- **Domain**: Your domain
- **Service Type**: HTTP
- **URL**: `localhost:8000`
- Click **Save**

Now you can access Coolify from anywhere at: `https://panel.yourdomain.com`

---

# PHASE 8: INSTALL DOCKER AND NODE.JS

## Step 8.1: Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
```

Add your user to docker group:

```bash
sudo usermod -aG docker $USER
```

**IMPORTANT**: Log out and log back in for this to take effect:

```bash
exit
```

Then log back in with your username and password.

Verify Docker works:

```bash
docker --version
```

## Step 8.2: Install Node.js (Optional - Coolify handles this, but useful for manual deploys)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

```bash
sudo apt install -y nodejs
```

```bash
sudo npm install -g pm2
```

Verify:

```bash
node --version
npm --version
pm2 --version
```

---

# PHASE 9: DEPLOY DEALERCHARTS

## Option A: Using Coolify (Recommended)

1. Open Coolify dashboard (`http://192.168.1.100:8000`)
2. Click **Projects** → **Add**
3. Name it: `DealerCharts`
4. Click **Add Resource** → **Public Repository**
5. Enter: `https://github.com/Markproto/Dealerhcharts`
6. Click **Check Repository**
7. Configure:
   - **Branch**: `main` or `claude/review-docs-3yWXm`
   - **Build Pack**: Nixpacks (auto-detects Node.js)
   - **Port**: 3001 (or whatever your server runs on)
8. Add Environment Variables:
   - Click **Environment Variables**
   - Add each variable:
     ```
     NODE_ENV=production
     PORT=3001
     ADMIN_SECRET=your-secret-token-here
     FMP_API_KEY=your-fmp-key
     ```
9. Click **Deploy**

10. Once deployed, go to Cloudflare tunnel and add hostname:
    - **Domain**: `dealercharts.com`
    - **Service**: `http://localhost:3001`

## Option B: Manual Deploy

```bash
cd /home/your-username
git clone https://github.com/Markproto/Dealerhcharts.git
cd Dealerhcharts
npm install
cd client && npm install && npm run build && cd ..
cd server && npm install && cd ..
```

Create environment file:

```bash
nano server/.env
```

Add:
```
NODE_ENV=production
PORT=3001
ADMIN_SECRET=your-secret-token-here
FMP_API_KEY=your-fmp-key-if-needed
```

Save (Ctrl+O, Enter, Ctrl+X)

Start with PM2:

```bash
cd server
pm2 start src/index.js --name dealercharts-api
pm2 save
pm2 startup
```

The last command will output a command to run - copy and run it.

---

# PHASE 10: MOVING SERVER TO PERMANENT LOCATION

Once everything is working:

## Step 10.1: Test Remote SSH Access

From your Lenovo laptop (or any other computer on the same network):

1. Open Command Prompt or PowerShell
2. Type:
   ```
   ssh youruser@192.168.1.100
   ```
3. Type `yes` if asked about fingerprint
4. Enter your password
5. You should now be logged into the server remotely

## Step 10.2: Shutdown Server Safely

On the server (via SSH or direct):

```bash
sudo shutdown now
```

## Step 10.3: Move the Hardware

1. Unplug all cables from the MSI
2. Move it to permanent location (near router)
3. Connect:
   - Power (through surge protector)
   - Ethernet cable to router
4. Press power button

## Step 10.4: Verify Everything Works

From any computer on your network:

1. SSH in:
   ```
   ssh youruser@192.168.1.100
   ```
2. Check services:
   ```bash
   sudo systemctl status cloudflared
   pm2 status
   ```
3. Access Coolify: `http://192.168.1.100:8000`
4. Access your sites through Cloudflare URLs

---

# TROUBLESHOOTING

## Can't SSH into server

1. Make sure you're on same network
2. Verify server IP: check your router's connected devices
3. Try pinging: `ping 192.168.1.100`
4. If IP changed, connect monitor/keyboard and run `ip addr`

## Cloudflare Tunnel not connecting

```bash
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
journalctl -u cloudflared -f
```

## Site not loading through Cloudflare

1. Verify tunnel is healthy in Cloudflare dashboard
2. Check hostname configuration in tunnel settings
3. Verify local service is running: `pm2 status` or `docker ps`
4. Test locally: `curl http://localhost:PORT`

## Forgot password

You'll need to connect monitor/keyboard and boot into recovery mode. Search "Ubuntu recovery mode reset password"

## Server won't boot

1. Connect monitor to see error messages
2. Try booting from USB installer and selecting "Rescue mode"

---

# QUICK REFERENCE

## SSH into server
```bash
ssh youruser@192.168.1.100
```

## Check running services
```bash
pm2 status
docker ps
sudo systemctl status cloudflared
```

## Restart services
```bash
pm2 restart all
sudo systemctl restart cloudflared
```

## View logs
```bash
pm2 logs
journalctl -u cloudflared -f
```

## Update system
```bash
sudo apt update && sudo apt upgrade -y
```

## Reboot server
```bash
sudo reboot
```

## Shutdown server
```bash
sudo shutdown now
```

---

# YOUR SERVER INFO (FILL THIS IN)

```
Server Username:     ____________________
Server Password:     ____________________
Server Static IP:    192.168.1.___
Router Gateway IP:   192.168.1.___
Interface Name:      ____________________
Cloudflare Email:    ____________________
Coolify Admin Email: ____________________
```

---

# ADDING MORE SITES

For each new site:

1. Open Coolify dashboard
2. Add new resource (GitHub repo or Docker)
3. Configure build settings and port
4. Deploy
5. Add public hostname in Cloudflare tunnel pointing to that port

That's it! Coolify handles the rest.
