# uku.backend

Backend del proyecto Uku

# Changelog (controller side)

## 0.4.1

- Feat: Controller connection was not being notified to the web app

## 0.4.2

- Fix: Could not save new vms preference due to not considering some grid options.

## 0.4.3

- Fix: Error when creating a user and then editing it before saving to the database. The 'date' value was being passed as '~' as it is the default value for a new user.

---

# Installation guide (Ubuntu)

- Install MySQL: `sudo apt install mysql`. Change MySQL identification method to `mysql_native_password` and change password.
- Install NodeJS:
- Install `pm2`. Run `pm2` and save process list with `pm2 save`.
- Install `mosquitto`: `sudo apt install mosquitto`. Use `janox-mosquitto-ubuntu.conf` (read first file line). Grant write permission to log file to `mosquitto` user. Locally, notifications are show in real time. Over internet, the web need to refresh to show them.
- Install `ffmpeg` (repository version doesn't work. Pending to check right version).

# Installation guide (windows)

- Install MySQL community server and use the configurator to create an account, save credentials for the .env file.
- Install NodeJS and npm.
- Install Eclipse Mosquitto ([Website](https://mosquitto.org/)) for Windows. Copy `mqtt_service_files\janox-mosquitto-win.conf` and replace the default config file. Make sure to open related ports.
- Install `ffmpeg` (same or greater than `N-120493-g9a32b86307-20250804`). Add binaries path to system PATH.
- Install `pm2` using `npm install pm2@latest -g`. Start service and save list: `pm2 start ecosystem.config.js` and `pm2 save`. Schedule a task to execute `dbTemplates/janox.bat` before login on every startup with highest privileges. Starting `pm2` before login will search for a different process list, so copy the local file `C:/Users/user/.pm2/dump.pm2` to `C:/etc/.pm2/`.
