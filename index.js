#! /usr/bin/env node
var fs = require( 'fs' );
var path = require( 'path' );
var argv = require( 'minimist' )( process.argv.slice( 2 ) );
var log = require( 'npmlog' );
var os = require( 'os' );

console.log( os.endianness() );

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns a 0x## formatted hex string with trailing 0s up to size
function decToHexZerosRight(num, size) {
	var s = num.toString( 16 );

	// If the hex value is just one character, pad it front-wise
	// with a 0 for BMP format
	if ( s.length == 1 ) {
		s = '0' + s;
	}

	while ( s.length < size ) {
		s += '0';
	}
	return '0x' + s;
}

function roundToMultiple ( num, multiple ) {
	if ( num > 0 ) {
		return Math.ceil( num / multiple ) * multiple;
	} else if ( n < 3 ) {
		return Math.floor( num / multiple ) * multiple;
	} else {
		return multiple;
	}
}

var outPath = argv.o || argv.out || argv._[ 1 ] || 'out.bmp';
var filePath = argv.f || argv.file || argv._[ 0 ];

var fileBuffer = fs.readFileSync( filePath );
var byteCount = fileBuffer.length;
console.log( 'byteCount', byteCount );

var bpp = 24;

// var usePadding = false;
var width = argv.w || argv.width || 100;
var remainder = byteCount % width;

var bytesPerRow = width * 3;
var height = Math.ceil( byteCount / bytesPerRow );
var padding = roundToMultiple( bytesPerRow, 4 ) - bytesPerRow;
console.log( 'w', width, 'h', height, 're', remainder );
console.log( 'bytesPerRow', bytesPerRow );
console.log( 'padding', padding );

// Number of bytes required to hold pixel data
var trueSize = ( bytesPerRow + padding ) * height;
console.log( 'trueSize', trueSize );

// Buffer uses 8-bit sizes
var bitmap = new Buffer(56 + trueSize);
console.log( 'bitmap length', bitmap.length );

// Derived from wiki page on BMP. The total number of bytes necessary
// to store one row of pixels.
var rowSize = ( ( bpp * width + 31 ) / 32 ) * 4;
console.log( 'rowSize', rowSize );

/**************************
    Standard BMP Header
**************************/
// Bitmap signature
bitmap[0] = 0x42; // 'B'
bitmap[1] = 0x4D; // 'M'

// Size of the BMP (unreliable, made it up)
bitmap.writeUIntLE(0x66, 2, 4);

// Reserved field - all 0
bitmap.writeUIntLE(0x00, 6, 4);

// hex offset of pixel data inside the image - 0x36, dec 54
bitmap.writeUIntLE(0x36, 10, 4);

/**************************
         DIB Header
**************************/
// We're going to use the BITMAPINFOHEADER DIB
// See https://en.wikipedia.org/wiki/BMP_file_format - DIB header (bitmap information header)

// Size of this header
bitmap.writeUIntLE(0x28, 14, 4);

// DIMENSIONS

// Bitmap width in pixels - signed int
bitmap.writeUIntLE( '0x' + width.toString( 16 ), 18, 4);

// Bitmap height in pixels - signed int
bitmap.writeUIntLE( '0x' + height.toString( 16 ), 22, 4);

// PIXEL DATA
// Number of color planes (must be 1)
bitmap.writeUIntLE(0x01, 26, 2);

// Number of bits per pixel (typically 1, 4, 8, 16, 24, 32)
// We'll say 24 (remember hex 18 => dec 24)
bitmap.writeUIntLE(0x18, 28, 2);

// Compression method being used - we'll say none
bitmap.writeUIntLE(0x00, 30, 4);

// Image size of the raw bitmap data; with no compression method
// we can just put 0 here (this is called a BI_RGB bitmap)
bitmap.writeUIntLE(0x00, 34, 4);

// Horizontal resolution of the image (pixel per meter, signed int)
// Stole this from another same size image - seems to be 0x130B or dec 77835?
bitmap.writeUIntLE(0x130B, 38, 4);

// Vertical resolution of the image (pixel per meter, signed int)
// Stole this from another same size image - seems to be 0x130B or dec 77835?
bitmap.writeUIntLE(0x130B, 42, 4);

// Number of colors in the color palette, 0 to default to 2^n (n of what?)
bitmap.writeUIntLE(0x00, 46, 4);

// Number of important colors used, 0 when every color is important, generally ignored
bitmap.writeUIntLE(0x00, 50, 4);

// A color table would come here that is mandatory for color depths <= 8 bits,
// but we're using 24 bit so it doesn't matter.

/************************
        PIXEL DATA
*************************/

// Fill in pixel data
var iterations = 0;
var currentByte = 0;
// We use height here as it represents the number of rows
while ( iterations < height ) {
	var offset = 54 + iterations * ( bytesPerRow + padding );

	// Here we're copying from fileBuffer to bitmap for every row that bitmap can fit
	fileBuffer.copy( bitmap, offset, currentByte, currentByte + bytesPerRow );
	currentByte += bytesPerRow;
	iterations++;
}

console.log( bitmap );

var out = path.resolve( process.cwd(), outPath );

fs.writeFileSync( out, bitmap );

console.log( 'Ding! beamp\'d: ' + out );
