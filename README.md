# Capstone Project

Our capstone project is a software application for small business management.  It is implemented as a cross-platform hybrid mobile app built with the Ionic framework.


## Installation Instructions

- Make sure you have [git](https://git-scm.com/) installed

- Clone this project

```shell
git clone https://github.com/nkeeslin/capstone.git
```

- Make sure you have [node](https://nodejs.org) installed

- Use npm (comes bundled with node) to install global dependencies

```shell
npm install -g cordova ionic bower gulp
```

- Move into the app root directory

```shell
cd capstone/MicrobusinessManager
```

- Once in the app root directory use npm and gulp to install dependencies

```shell
npm install

gulp install
```

- If you want to build and run the app for Android, you will need the Android SDK and an Android Virtual Device.  The easiest way to get everything installed is with [Android Studio](http://developer.android.com/sdk/index.html)

- If you want to build and run the app for iOS, you will need a Mac with [Xcode](https://developer.apple.com/xcode/download/) installed.

- Use the following ionic commands to add the platforms you want, as well as to build and run the app

```shell
ionic platform add android
ionic build android
ionic run android

ionic platform add ios
ionic build ios
ionic run ios
```

- Tips:
  - You can use the ```--live-reload``` flag on the ```ionic run ```commands to have your code changes show up immediately in your app.
  - Sometimes the live reload option can be buggy.  You can refresh your app by re-running the ```ionic run``` commands without re-starting the emulator
