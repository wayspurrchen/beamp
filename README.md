# beamp

Simple Node.js script that converts your data into a .bmp image by taking the data and prepending it with a BMP format header. For the most part, the output looks like noise, but you can get particularly interesting results with other image files, and makes for a great source of noise or simple obfuscation (you can still open the BMP files and read the original contents in a hex editor).

## Using it

Want to use it? You'll need [Node.js](nodejs.org/) and at least version 0.12. Once you have it, you can clone the repo then run:

```
cd path/to/repo
npm install
node ./index.js --file input.dat --out out.bmp
```

Options:

param        | function
------------ | ----------
`f`, `file`  | input file path
`o`, `out`   | output path
`w`, `width` | width - height is determined automatically based on width and file size, defaults to 100

Global install options coming soon.

## Examples

### package.json

`package.json` from this repo! It came out at 10x12, but I upscaled it to 400x500 so it's more visible (TIP: if you're using Photoshop to size your images up, you can use the Nearest Neighbour resample option to preserve hard edges).

Command:

```
node ./index.js --file package.json --out package.json.bmp -w 10
```

Result:

![](http://i.imgur.com/tC7NOPZ.png)

### EVE_Online_Installer_852809.exe

4,632 kb file. Created a big field of noise. Not sure what the black glitches are towards the bottom, but they look cool!

```
node ./index.js --file EVE_Online_Installer_852809.exe --out eve.bmp -w 1200
```

![](http://i.imgur.com/Ha3bvmb.jpg)