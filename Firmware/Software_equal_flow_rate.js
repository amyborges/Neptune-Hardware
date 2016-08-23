"use strict";

var numeric = (typeof exports === "undefined")?(function numeric() {}):(exports);
if(typeof global !== "undefined") { global.numeric = numeric; }

numeric.version = "1.2.6";

// 1. Utility functions
numeric.bench = function bench (f,interval) {
    var t1,t2,n,i;
    if(typeof interval === "undefined") { interval = 15; }
    n = 0.5;
    t1 = new Date();
    while(1) {
        n*=2;
        for(i=n;i>3;i-=4) { f(); f(); f(); f(); }
        while(i>0) { f(); i--; }
        t2 = new Date();
        if(t2-t1 > interval) break;
    }
    for(i=n;i>3;i-=4) { f(); f(); f(); f(); }
    while(i>0) { f(); i--; }
    t2 = new Date();
    return 1000*(3*n-1)/(t2-t1);
}

numeric._myIndexOf = (function _myIndexOf(w) {
    var n = this.length,k;
    for(k=0;k<n;++k) if(this[k]===w) return k;
    return -1;
});
numeric.myIndexOf = (Array.prototype.indexOf)?Array.prototype.indexOf:numeric._myIndexOf;

numeric.Function = Function;
numeric.precision = 4;
numeric.largeArray = 50;

numeric.prettyPrint = function prettyPrint(x) {
    function fmtnum(x) {
        if(x === 0) { return '0'; }
        if(isNaN(x)) { return 'NaN'; }
        if(x<0) { return '-'+fmtnum(-x); }
        if(isFinite(x)) {
            var scale = Math.floor(Math.log(x) / Math.log(10));
            var normalized = x / Math.pow(10,scale);
            var basic = normalized.toPrecision(numeric.precision);
            if(parseFloat(basic) === 10) { scale++; normalized = 1; basic = normalized.toPrecision(numeric.precision); }
            return parseFloat(basic).toString()+'e'+scale.toString();
        }
        return 'Infinity';
    }
    var ret = [];
    function foo(x) {
        var k;
        if(typeof x === "undefined") { ret.push(Array(numeric.precision+8).join(' ')); return false; }
        if(typeof x === "string") { ret.push('"'+x+'"'); return false; }
        if(typeof x === "boolean") { ret.push(x.toString()); return false; }
        if(typeof x === "number") {
            var a = fmtnum(x);
            var b = x.toPrecision(numeric.precision);
            var c = parseFloat(x.toString()).toString();
            var d = [a,b,c,parseFloat(b).toString(),parseFloat(c).toString()];
            for(k=1;k<d.length;k++) { if(d[k].length < a.length) a = d[k]; }
            ret.push(Array(numeric.precision+8-a.length).join(' ')+a);
            return false;
        }
        if(x === null) { ret.push("null"); return false; }
        if(typeof x === "function") { 
            ret.push(x.toString());
            var flag = false;
            for(k in x) { if(x.hasOwnProperty(k)) { 
                if(flag) ret.push(',\n');
                else ret.push('\n{');
                flag = true; 
                ret.push(k); 
                ret.push(': \n'); 
                foo(x[k]); 
            } }
            if(flag) ret.push('}\n');
            return true;
        }
        if(x instanceof Array) {
            if(x.length > numeric.largeArray) { ret.push('...Large Array...'); return true; }
            var flag = false;
            ret.push('[');
            for(k=0;k<x.length;k++) { if(k>0) { ret.push(','); if(flag) ret.push('\n '); } flag = foo(x[k]); }
            ret.push(']');
            return true;
        }
        ret.push('{');
        var flag = false;
        for(k in x) { if(x.hasOwnProperty(k)) { if(flag) ret.push(',\n'); flag = true; ret.push(k); ret.push(': \n'); foo(x[k]); } }
        ret.push('}');
        return true;
    }
    foo(x);
    return ret.join('');
}

numeric.parseDate = function parseDate(d) {
    function foo(d) {
        if(typeof d === 'string') { return Date.parse(d.replace(/-/g,'/')); }
        if(!(d instanceof Array)) { throw new Error("parseDate: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return foo(d);
}

numeric.parseFloat = function parseFloat_(d) {
    function foo(d) {
        if(typeof d === 'string') { return parseFloat(d); }
        if(!(d instanceof Array)) { throw new Error("parseFloat: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return foo(d);
}

numeric.parseCSV = function parseCSV(t) {
    var foo = t.split('\n');
    var j,k;
    var ret = [];
    var pat = /(([^'",]*)|('[^']*')|("[^"]*")),/g;
    var patnum = /^\s*(([+-]?[0-9]+(\.[0-9]*)?(e[+-]?[0-9]+)?)|([+-]?[0-9]*(\.[0-9]+)?(e[+-]?[0-9]+)?))\s*$/;
    var stripper = function(n) { return n.substr(0,n.length-1); }
    var count = 0;
    for(k=0;k<foo.length;k++) {
      var bar = (foo[k]+",").match(pat),baz;
      if(bar.length>0) {
          ret[count] = [];
          for(j=0;j<bar.length;j++) {
              baz = stripper(bar[j]);
              if(patnum.test(baz)) { ret[count][j] = parseFloat(baz); }
              else ret[count][j] = baz;
          }
          count++;
      }
    }
    return ret;
}

numeric.toCSV = function toCSV(A) {
    var s = numeric.dim(A);
    var i,j,m,n,row,ret;
    m = s[0];
    n = s[1];
    ret = [];
    for(i=0;i<m;i++) {
        row = [];
        for(j=0;j<m;j++) { row[j] = A[i][j].toString(); }
        ret[i] = row.join(', ');
    }
    return ret.join('\n')+'\n';
}

numeric.getURL = function getURL(url) {
    var client = new XMLHttpRequest();
    client.open("GET",url,false);
    client.send();
    return client;
}

numeric.imageURL = function imageURL(img) {
    function base64(A) {
        var n = A.length, i,x,y,z,p,q,r,s;
        var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var ret = "";
        for(i=0;i<n;i+=3) {
            x = A[i];
            y = A[i+1];
            z = A[i+2];
            p = x >> 2;
            q = ((x & 3) << 4) + (y >> 4);
            r = ((y & 15) << 2) + (z >> 6);
            s = z & 63;
            if(i+1>=n) { r = s = 64; }
            else if(i+2>=n) { s = 64; }
            ret += key.charAt(p) + key.charAt(q) + key.charAt(r) + key.charAt(s);
            }
        return ret;
    }
    function crc32Array (a,from,to) {
        if(typeof from === "undefined") { from = 0; }
        if(typeof to === "undefined") { to = a.length; }
        var table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
                     0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 
                     0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
                     0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 
                     0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 
                     0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 
                     0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
                     0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
                     0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
                     0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 
                     0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 
                     0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 
                     0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 
                     0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 
                     0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 
                     0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 
                     0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 
                     0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 
                     0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 
                     0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 
                     0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 
                     0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 
                     0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 
                     0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 
                     0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 
                     0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 
                     0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 
                     0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 
                     0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 
                     0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 
                     0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 
                     0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D];
     
        var crc = -1, y = 0, n = a.length,i;

        for (i = from; i < to; i++) {
            y = (crc ^ a[i]) & 0xFF;
            crc = (crc >>> 8) ^ table[y];
        }
     
        return crc ^ (-1);
    }

    var h = img[0].length, w = img[0][0].length, s1, s2, next,k,length,a,b,i,j,adler32,crc32;
    var stream = [
                  137, 80, 78, 71, 13, 10, 26, 10,                           //  0: PNG signature
                  0,0,0,13,                                                  //  8: IHDR Chunk length
                  73, 72, 68, 82,                                            // 12: "IHDR" 
                  (w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w&255,   // 16: Width
                  (h >> 24) & 255, (h >> 16) & 255, (h >> 8) & 255, h&255,   // 20: Height
                  8,                                                         // 24: bit depth
                  2,                                                         // 25: RGB
                  0,                                                         // 26: deflate
                  0,                                                         // 27: no filter
                  0,                                                         // 28: no interlace
                  -1,-2,-3,-4,                                               // 29: CRC
                  -5,-6,-7,-8,                                               // 33: IDAT Chunk length
                  73, 68, 65, 84,                                            // 37: "IDAT"
                  // RFC 1950 header starts here
                  8,                                                         // 41: RFC1950 CMF
                  29                                                         // 42: RFC1950 FLG
                  ];
    crc32 = crc32Array(stream,12,29);
    stream[29] = (crc32>>24)&255;
    stream[30] = (crc32>>16)&255;
    stream[31] = (crc32>>8)&255;
    stream[32] = (crc32)&255;
    s1 = 1;
    s2 = 0;
    for(i=0;i<h;i++) {
        if(i<h-1) { stream.push(0); }
        else { stream.push(1); }
        a = (3*w+1+(i===0))&255; b = ((3*w+1+(i===0))>>8)&255;
        stream.push(a); stream.push(b);
        stream.push((~a)&255); stream.push((~b)&255);
        if(i===0) stream.push(0);
        for(j=0;j<w;j++) {
            for(k=0;k<3;k++) {
                a = img[k][i][j];
                if(a>255) a = 255;
                else if(a<0) a=0;
                else a = Math.round(a);
                s1 = (s1 + a )%65521;
                s2 = (s2 + s1)%65521;
                stream.push(a);
            }
        }
        stream.push(0);
    }
    adler32 = (s2<<16)+s1;
    stream.push((adler32>>24)&255);
    stream.push((adler32>>16)&255);
    stream.push((adler32>>8)&255);
    stream.push((adler32)&255);
    length = stream.length - 41;
    stream[33] = (length>>24)&255;
    stream[34] = (length>>16)&255;
    stream[35] = (length>>8)&255;
    stream[36] = (length)&255;
    crc32 = crc32Array(stream,37);
    stream.push((crc32>>24)&255);
    stream.push((crc32>>16)&255);
    stream.push((crc32>>8)&255);
    stream.push((crc32)&255);
    stream.push(0);
    stream.push(0);
    stream.push(0);
    stream.push(0);
//    a = stream.length;
    stream.push(73);  // I
    stream.push(69);  // E
    stream.push(78);  // N
    stream.push(68);  // D
    stream.push(174); // CRC1
    stream.push(66);  // CRC2
    stream.push(96);  // CRC3
    stream.push(130); // CRC4
    return 'data:image/png;base64,'+base64(stream);
}

// 2. Linear algebra with Arrays.
numeric._dim = function _dim(x) {
    var ret = [];
    while(typeof x === "object") { ret.push(x.length); x = x[0]; }
    return ret;
}

numeric.dim = function dim(x) {
    var y,z;
    if(typeof x === "object") {
        y = x[0];
        if(typeof y === "object") {
            z = y[0];
            if(typeof z === "object") {
                return numeric._dim(x);
            }
            return [x.length,y.length];
        }
        return [x.length];
    }
    return [];
}

numeric.mapreduce = function mapreduce(body,init) {
    return Function('x','accum','_s','_k',
            'if(typeof accum === "undefined") accum = '+init+';\n'+
            'if(typeof x === "number") { var xi = x; '+body+'; return accum; }\n'+
            'if(typeof _s === "undefined") _s = numeric.dim(x);\n'+
            'if(typeof _k === "undefined") _k = 0;\n'+
            'var _n = _s[_k];\n'+
            'var i,xi;\n'+
            'if(_k < _s.length-1) {\n'+
            '    for(i=_n-1;i>=0;i--) {\n'+
            '        accum = arguments.callee(x[i],accum,_s,_k+1);\n'+
            '    }'+
            '    return accum;\n'+
            '}\n'+
            'for(i=_n-1;i>=1;i-=2) { \n'+
            '    xi = x[i];\n'+
            '    '+body+';\n'+
            '    xi = x[i-1];\n'+
            '    '+body+';\n'+
            '}\n'+
            'if(i === 0) {\n'+
            '    xi = x[i];\n'+
            '    '+body+'\n'+
            '}\n'+
            'return accum;'
            );
}
numeric.mapreduce2 = function mapreduce2(body,setup) {
    return Function('x',
            'var n = x.length;\n'+
            'var i,xi;\n'+setup+';\n'+
            'for(i=n-1;i!==-1;--i) { \n'+
            '    xi = x[i];\n'+
            '    '+body+';\n'+
            '}\n'+
            'return accum;'
            );
}


numeric.same = function same(x,y) {
    var i,n;
    if(!(x instanceof Array) || !(y instanceof Array)) { return false; }
    n = x.length;
    if(n !== y.length) { return false; }
    for(i=0;i<n;i++) {
        if(x[i] === y[i]) { continue; }
        if(typeof x[i] === "object") { if(!same(x[i],y[i])) return false; }
        else { return false; }
    }
    return true;
}

numeric.rep = function rep(s,v,k) {
    if(typeof k === "undefined") { k=0; }
    var n = s[k], ret = Array(n), i;
    if(k === s.length-1) {
        for(i=n-2;i>=0;i-=2) { ret[i+1] = v; ret[i] = v; }
        if(i===-1) { ret[0] = v; }
        return ret;
    }
    for(i=n-1;i>=0;i--) { ret[i] = numeric.rep(s,v,k+1); }
    return ret;
}


numeric.dotMMsmall = function dotMMsmall(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0;
    p = x.length; q = y.length; r = y[0].length;
    ret = Array(p);
    for(i=p-1;i>=0;i--) {
        foo = Array(r);
        bar = x[i];
        for(k=r-1;k>=0;k--) {
            woo = bar[q-1]*y[q-1][k];
            for(j=q-2;j>=1;j-=2) {
                i0 = j-1;
                woo += bar[j]*y[j][k] + bar[i0]*y[i0][k];
            }
            if(j===0) { woo += bar[0]*y[0][k]; }
            foo[k] = woo;
        }
        ret[i] = foo;
    }
    return ret;
}
numeric._getCol = function _getCol(A,j,x) {
    var n = A.length, i;
    for(i=n-1;i>0;--i) {
        x[i] = A[i][j];
        --i;
        x[i] = A[i][j];
    }
    if(i===0) x[0] = A[0][j];
}
numeric.dotMMbig = function dotMMbig(x,y){
    var gc = numeric._getCol, p = y.length, v = Array(p);
    var m = x.length, n = y[0].length, A = new Array(m), xj;
    var VV = numeric.dotVV;
    var i,j,k,z;
    --p;
    --m;
    for(i=m;i!==-1;--i) A[i] = Array(n);
    --n;
    for(i=n;i!==-1;--i) {
        gc(y,i,v);
        for(j=m;j!==-1;--j) {
            z=0;
            xj = x[j];
            A[j][i] = VV(xj,v);
        }
    }
    return A;
}

numeric.dotMV = function dotMV(x,y) {
    var p = x.length, q = y.length,i;
    var ret = Array(p), dotVV = numeric.dotVV;
    for(i=p-1;i>=0;i--) { ret[i] = dotVV(x[i],y); }
    return ret;
}

numeric.dotVM = function dotVM(x,y) {
    var i,j,k,p,q,r,ret,foo,bar,woo,i0,k0,p0,r0,s1,s2,s3,baz,accum;
    p = x.length; q = y[0].length;
    ret = Array(q);
    for(k=q-1;k>=0;k--) {
        woo = x[p-1]*y[p-1][k];
        for(j=p-2;j>=1;j-=2) {
            i0 = j-1;
            woo += x[j]*y[j][k] + x[i0]*y[i0][k];
        }
        if(j===0) { woo += x[0]*y[0][k]; }
        ret[k] = woo;
    }
    return ret;
}

numeric.dotVV = function dotVV(x,y) {
    var i,n=x.length,i1,ret = x[n-1]*y[n-1];
    for(i=n-2;i>=1;i-=2) {
        i1 = i-1;
        ret += x[i]*y[i] + x[i1]*y[i1];
    }
    if(i===0) { ret += x[0]*y[0]; }
    return ret;
}

numeric.dot = function dot(x,y) {
    var d = numeric.dim;
    switch(d(x).length*1000+d(y).length) {
    case 2002:
        if(y.length < 10) return numeric.dotMMsmall(x,y);
        else return numeric.dotMMbig(x,y);
    case 2001: return numeric.dotMV(x,y);
    case 1002: return numeric.dotVM(x,y);
    case 1001: return numeric.dotVV(x,y);
    case 1000: return numeric.mulVS(x,y);
    case 1: return numeric.mulSV(x,y);
    case 0: return x*y;
    default: throw new Error('numeric.dot only works on vectors and matrices');
    }
}

numeric.diag = function diag(d) {
    var i,i1,j,n = d.length, A = Array(n), Ai;
    for(i=n-1;i>=0;i--) {
        Ai = Array(n);
        i1 = i+2;
        for(j=n-1;j>=i1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j>i) { Ai[j] = 0; }
        Ai[i] = d[i];
        for(j=i-1;j>=1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j===0) { Ai[0] = 0; }
        A[i] = Ai;
    }
    return A;
}
numeric.getDiag = function(A) {
    var n = Math.min(A.length,A[0].length),i,ret = Array(n);
    for(i=n-1;i>=1;--i) {
        ret[i] = A[i][i];
        --i;
        ret[i] = A[i][i];
    }
    if(i===0) {
        ret[0] = A[0][0];
    }
    return ret;
}

numeric.identity = function identity(n) { return numeric.diag(numeric.rep([n],1)); }
numeric.pointwise = function pointwise(params,body,setup) {
    if(typeof setup === "undefined") { setup = ""; }
    var fun = [];
    var k;
    var avec = /\[i\]$/,p,thevec = '';
    var haveret = false;
    for(k=0;k<params.length;k++) {
        if(avec.test(params[k])) {
            p = params[k].substring(0,params[k].length-3);
            thevec = p;
        } else { p = params[k]; }
        if(p==='ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = '_s';
    fun[params.length+1] = '_k';
    fun[params.length+2] = (
            'if(typeof _s === "undefined") _s = numeric.dim('+thevec+');\n'+
            'if(typeof _k === "undefined") _k = 0;\n'+
            'var _n = _s[_k];\n'+
            'var i'+(haveret?'':', ret = Array(_n)')+';\n'+
            'if(_k < _s.length-1) {\n'+
            '    for(i=_n-1;i>=0;i--) ret[i] = arguments.callee('+params.join(',')+',_s,_k+1);\n'+
            '    return ret;\n'+
            '}\n'+
            setup+'\n'+
            'for(i=_n-1;i!==-1;--i) {\n'+
            '    '+body+'\n'+
            '}\n'+
            'return ret;'
            );
    return Function.apply(null,fun);
}
numeric.pointwise2 = function pointwise2(params,body,setup) {
    if(typeof setup === "undefined") { setup = ""; }
    var fun = [];
    var k;
    var avec = /\[i\]$/,p,thevec = '';
    var haveret = false;
    for(k=0;k<params.length;k++) {
        if(avec.test(params[k])) {
            p = params[k].substring(0,params[k].length-3);
            thevec = p;
        } else { p = params[k]; }
        if(p==='ret') haveret = true;
        fun.push(p);
    }
    fun[params.length] = (
            'var _n = '+thevec+'.length;\n'+
            'var i'+(haveret?'':', ret = Array(_n)')+';\n'+
            setup+'\n'+
            'for(i=_n-1;i!==-1;--i) {\n'+
            body+'\n'+
            '}\n'+
            'return ret;'
            );
    return Function.apply(null,fun);
}
numeric._biforeach = (function _biforeach(x,y,s,k,f) {
    if(k === s.length-1) { f(x,y); return; }
    var i,n=s[k];
    for(i=n-1;i>=0;i--) { _biforeach(typeof x==="object"?x[i]:x,typeof y==="object"?y[i]:y,s,k+1,f); }
});
numeric._biforeach2 = (function _biforeach2(x,y,s,k,f) {
    if(k === s.length-1) { return f(x,y); }
    var i,n=s[k],ret = Array(n);
    for(i=n-1;i>=0;--i) { ret[i] = _biforeach2(typeof x==="object"?x[i]:x,typeof y==="object"?y[i]:y,s,k+1,f); }
    return ret;
});
numeric._foreach = (function _foreach(x,s,k,f) {
    if(k === s.length-1) { f(x); return; }
    var i,n=s[k];
    for(i=n-1;i>=0;i--) { _foreach(x[i],s,k+1,f); }
});
numeric._foreach2 = (function _foreach2(x,s,k,f) {
    if(k === s.length-1) { return f(x); }
    var i,n=s[k], ret = Array(n);
    for(i=n-1;i>=0;i--) { ret[i] = _foreach2(x[i],s,k+1,f); }
    return ret;
});

/*numeric.anyV = numeric.mapreduce('if(xi) return true;','false');
numeric.allV = numeric.mapreduce('if(!xi) return false;','true');
numeric.any = function(x) { if(typeof x.length === "undefined") return x; return numeric.anyV(x); }
numeric.all = function(x) { if(typeof x.length === "undefined") return x; return numeric.allV(x); }*/

numeric.ops2 = {
        add: '+',
        sub: '-',
        mul: '*',
        div: '/',
        mod: '%',
        and: '&&',
        or:  '||',
        eq:  '===',
        neq: '!==',
        lt:  '<',
        gt:  '>',
        leq: '<=',
        geq: '>=',
        band: '&',
        bor: '|',
        bxor: '^',
        lshift: '<<',
        rshift: '>>',
        rrshift: '>>>'
};
numeric.opseq = {
        addeq: '+=',
        subeq: '-=',
        muleq: '*=',
        diveq: '/=',
        modeq: '%=',
        lshifteq: '<<=',
        rshifteq: '>>=',
        rrshifteq: '>>>=',
        bandeq: '&=',
        boreq: '|=',
        bxoreq: '^='
};
numeric.mathfuns = ['abs','acos','asin','atan','ceil','cos',
                    'exp','floor','log','round','sin','sqrt','tan',
                    'isNaN','isFinite'];
numeric.mathfuns2 = ['atan2','pow','max','min'];
numeric.ops1 = {
        neg: '-',
        not: '!',
        bnot: '~',
        clone: ''
};
numeric.mapreducers = {
        any: ['if(xi) return true;','var accum = false;'],
        all: ['if(!xi) return false;','var accum = true;'],
        sum: ['accum += xi;','var accum = 0;'],
        prod: ['accum *= xi;','var accum = 1;'],
        norm2Squared: ['accum += xi*xi;','var accum = 0;'],
        norminf: ['accum = max(accum,abs(xi));','var accum = 0, max = Math.max, abs = Math.abs;'],
        norm1: ['accum += abs(xi)','var accum = 0, abs = Math.abs;'],
        sup: ['accum = max(accum,xi);','var accum = -Infinity, max = Math.max;'],
        inf: ['accum = min(accum,xi);','var accum = Infinity, min = Math.min;']
};

(function () {
    var i,o;
    for(i=0;i<numeric.mathfuns2.length;++i) {
        o = numeric.mathfuns2[i];
        numeric.ops2[o] = o;
    }
    for(i in numeric.ops2) {
        if(numeric.ops2.hasOwnProperty(i)) {
            o = numeric.ops2[i];
            var code, codeeq, setup = '';
            if(numeric.myIndexOf.call(numeric.mathfuns2,i)!==-1) {
                setup = 'var '+o+' = Math.'+o+';\n';
                code = function(r,x,y) { return r+' = '+o+'('+x+','+y+')'; };
                codeeq = function(x,y) { return x+' = '+o+'('+x+','+y+')'; };
            } else {
                code = function(r,x,y) { return r+' = '+x+' '+o+' '+y; };
                if(numeric.opseq.hasOwnProperty(i+'eq')) {
                    codeeq = function(x,y) { return x+' '+o+'= '+y; };
                } else {
                    codeeq = function(x,y) { return x+' = '+x+' '+o+' '+y; };                    
                }
            }
            numeric[i+'VV'] = numeric.pointwise2(['x[i]','y[i]'],code('ret[i]','x[i]','y[i]'),setup);
            numeric[i+'SV'] = numeric.pointwise2(['x','y[i]'],code('ret[i]','x','y[i]'),setup);
            numeric[i+'VS'] = numeric.pointwise2(['x[i]','y'],code('ret[i]','x[i]','y'),setup);
            numeric[i] = Function(
                    'var n = arguments.length, i, x = arguments[0], y;\n'+
                    'var VV = numeric.'+i+'VV, VS = numeric.'+i+'VS, SV = numeric.'+i+'SV;\n'+
                    'var dim = numeric.dim;\n'+
                    'for(i=1;i!==n;++i) { \n'+
                    '  y = arguments[i];\n'+
                    '  if(typeof x === "object") {\n'+
                    '      if(typeof y === "object") x = numeric._biforeach2(x,y,dim(x),0,VV);\n'+
                    '      else x = numeric._biforeach2(x,y,dim(x),0,VS);\n'+
                    '  } else if(typeof y === "object") x = numeric._biforeach2(x,y,dim(y),0,SV);\n'+
                    '  else '+codeeq('x','y')+'\n'+
                    '}\nreturn x;\n');
            numeric[o] = numeric[i];
            numeric[i+'eqV'] = numeric.pointwise2(['ret[i]','x[i]'], codeeq('ret[i]','x[i]'),setup);
            numeric[i+'eqS'] = numeric.pointwise2(['ret[i]','x'], codeeq('ret[i]','x'),setup);
            numeric[i+'eq'] = Function(
                    'var n = arguments.length, i, x = arguments[0], y;\n'+
                    'var V = numeric.'+i+'eqV, S = numeric.'+i+'eqS\n'+
                    'var s = numeric.dim(x);\n'+
                    'for(i=1;i!==n;++i) { \n'+
                    '  y = arguments[i];\n'+
                    '  if(typeof y === "object") numeric._biforeach(x,y,s,0,V);\n'+
                    '  else numeric._biforeach(x,y,s,0,S);\n'+
                    '}\nreturn x;\n');
        }
    }
    for(i=0;i<numeric.mathfuns2.length;++i) {
        o = numeric.mathfuns2[i];
        delete numeric.ops2[o];
    }
    for(i=0;i<numeric.mathfuns.length;++i) {
        o = numeric.mathfuns[i];
        numeric.ops1[o] = o;
    }
    for(i in numeric.ops1) {
        if(numeric.ops1.hasOwnProperty(i)) {
            setup = '';
            o = numeric.ops1[i];
            if(numeric.myIndexOf.call(numeric.mathfuns,i)!==-1) {
                if(Math.hasOwnProperty(o)) setup = 'var '+o+' = Math.'+o+';\n';
            }
            numeric[i+'eqV'] = numeric.pointwise2(['ret[i]'],'ret[i] = '+o+'(ret[i]);',setup);
            numeric[i+'eq'] = Function('x',
                    'if(typeof x !== "object") return '+o+'x\n'+
                    'var i;\n'+
                    'var V = numeric.'+i+'eqV;\n'+
                    'var s = numeric.dim(x);\n'+
                    'numeric._foreach(x,s,0,V);\n'+
                    'return x;\n');
            numeric[i+'V'] = numeric.pointwise2(['x[i]'],'ret[i] = '+o+'(x[i]);',setup);
            numeric[i] = Function('x',
                    'if(typeof x !== "object") return '+o+'(x)\n'+
                    'var i;\n'+
                    'var V = numeric.'+i+'V;\n'+
                    'var s = numeric.dim(x);\n'+
                    'return numeric._foreach2(x,s,0,V);\n');
        }
    }
    for(i=0;i<numeric.mathfuns.length;++i) {
        o = numeric.mathfuns[i];
        delete numeric.ops1[o];
    }
    for(i in numeric.mapreducers) {
        if(numeric.mapreducers.hasOwnProperty(i)) {
            o = numeric.mapreducers[i];
            numeric[i+'V'] = numeric.mapreduce2(o[0],o[1]);
            numeric[i] = Function('x','s','k',
                    o[1]+
                    'if(typeof x !== "object") {'+
                    '    xi = x;\n'+
                    o[0]+';\n'+
                    '    return accum;\n'+
                    '}'+
                    'if(typeof s === "undefined") s = numeric.dim(x);\n'+
                    'if(typeof k === "undefined") k = 0;\n'+
                    'if(k === s.length-1) return numeric.'+i+'V(x);\n'+
                    'var xi;\n'+
                    'var n = x.length, i;\n'+
                    'for(i=n-1;i!==-1;--i) {\n'+
                    '   xi = arguments.callee(x[i]);\n'+
                    o[0]+';\n'+
                    '}\n'+
                    'return accum;\n');
        }
    }
}());

numeric.truncVV = numeric.pointwise(['x[i]','y[i]'],'ret[i] = round(x[i]/y[i])*y[i];','var round = Math.round;');
numeric.truncVS = numeric.pointwise(['x[i]','y'],'ret[i] = round(x[i]/y)*y;','var round = Math.round;');
numeric.truncSV = numeric.pointwise(['x','y[i]'],'ret[i] = round(x/y[i])*y[i];','var round = Math.round;');
numeric.trunc = function trunc(x,y) {
    if(typeof x === "object") {
        if(typeof y === "object") return numeric.truncVV(x,y);
        return numeric.truncVS(x,y);
    }
    if (typeof y === "object") return numeric.truncSV(x,y);
    return Math.round(x/y)*y;
}

numeric.inv = function inv(x) {
    var s = numeric.dim(x), abs = Math.abs, m = s[0], n = s[1];
    var A = numeric.clone(x), Ai, Aj;
    var I = numeric.identity(m), Ii, Ij;
    var i,j,k,x;
    for(j=0;j<n;++j) {
        var i0 = -1;
        var v0 = -1;
        for(i=j;i!==m;++i) { k = abs(A[i][j]); if(k>v0) { i0 = i; v0 = k; } }
        Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
        Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
        x = Aj[j];
        for(k=j;k!==n;++k)    Aj[k] /= x; 
        for(k=n-1;k!==-1;--k) Ij[k] /= x;
        for(i=m-1;i!==-1;--i) {
            if(i!==j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for(k=j+1;k!==n;++k)  Ai[k] -= Aj[k]*x;
                for(k=n-1;k>0;--k) { Ii[k] -= Ij[k]*x; --k; Ii[k] -= Ij[k]*x; }
                if(k===0) Ii[0] -= Ij[0]*x;
            }
        }
    }
    return I;
}

numeric.det = function det(x) {
    var s = numeric.dim(x);
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: det() only works on square matrices'); }
    var n = s[0], ret = 1,i,j,k,A = numeric.clone(x),Aj,Ai,alpha,temp,k1,k2,k3;
    for(j=0;j<n-1;j++) {
        k=j;
        for(i=j+1;i<n;i++) { if(Math.abs(A[i][j]) > Math.abs(A[k][j])) { k = i; } }
        if(k !== j) {
            temp = A[k]; A[k] = A[j]; A[j] = temp;
            ret *= -1;
        }
        Aj = A[j];
        for(i=j+1;i<n;i++) {
            Ai = A[i];
            alpha = Ai[j]/Aj[j];
            for(k=j+1;k<n-1;k+=2) {
                k1 = k+1;
                Ai[k] -= Aj[k]*alpha;
                Ai[k1] -= Aj[k1]*alpha;
            }
            if(k!==n) { Ai[k] -= Aj[k]*alpha; }
        }
        if(Aj[j] === 0) { return 0; }
        ret *= Aj[j];
    }
    return ret*A[j][j];
}

numeric.transpose = function transpose(x) {
    var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
    for(j=0;j<n;j++) ret[j] = Array(m);
    for(i=m-1;i>=1;i-=2) {
        A1 = x[i];
        A0 = x[i-1];
        for(j=n-1;j>=1;--j) {
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
            --j;
            Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
        }
        if(j===0) {
            Bj = ret[0]; Bj[i] = A1[0]; Bj[i-1] = A0[0];
        }
    }
    if(i===0) {
        A0 = x[0];
        for(j=n-1;j>=1;--j) {
            ret[j][0] = A0[j];
            --j;
            ret[j][0] = A0[j];
        }
        if(j===0) { ret[0][0] = A0[0]; }
    }
    return ret;
}
numeric.negtranspose = function negtranspose(x) {
    var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
    for(j=0;j<n;j++) ret[j] = Array(m);
    for(i=m-1;i>=1;i-=2) {
        A1 = x[i];
        A0 = x[i-1];
        for(j=n-1;j>=1;--j) {
            Bj = ret[j]; Bj[i] = -A1[j]; Bj[i-1] = -A0[j];
            --j;
            Bj = ret[j]; Bj[i] = -A1[j]; Bj[i-1] = -A0[j];
        }
        if(j===0) {
            Bj = ret[0]; Bj[i] = -A1[0]; Bj[i-1] = -A0[0];
        }
    }
    if(i===0) {
        A0 = x[0];
        for(j=n-1;j>=1;--j) {
            ret[j][0] = -A0[j];
            --j;
            ret[j][0] = -A0[j];
        }
        if(j===0) { ret[0][0] = -A0[0]; }
    }
    return ret;
}

numeric._random = function _random(s,k) {
    var i,n=s[k],ret=Array(n), rnd;
    if(k === s.length-1) {
        rnd = Math.random;
        for(i=n-1;i>=1;i-=2) {
            ret[i] = rnd();
            ret[i-1] = rnd();
        }
        if(i===0) { ret[0] = rnd(); }
        return ret;
    }
    for(i=n-1;i>=0;i--) ret[i] = _random(s,k+1);
    return ret;
}
numeric.random = function random(s) { return numeric._random(s,0); }

numeric.norm2 = function norm2(x) { return Math.sqrt(numeric.norm2Squared(x)); }

numeric.linspace = function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    var i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
}

numeric.getBlock = function getBlock(x,from,to) {
    var s = numeric.dim(x);
    function foo(x,k) {
        var i,a = from[k], n = to[k]-a, ret = Array(n);
        if(k === s.length-1) {
            for(i=n;i>=0;i--) { ret[i] = x[i+a]; }
            return ret;
        }
        for(i=n;i>=0;i--) { ret[i] = foo(x[i+a],k+1); }
        return ret;
    }
    return foo(x,0);
}

numeric.setBlock = function setBlock(x,from,to,B) {
    var s = numeric.dim(x);
    function foo(x,y,k) {
        var i,a = from[k], n = to[k]-a;
        if(k === s.length-1) { for(i=n;i>=0;i--) { x[i+a] = y[i]; } }
        for(i=n;i>=0;i--) { foo(x[i+a],y[i],k+1); }
    }
    foo(x,B,0);
    return x;
}

numeric.getRange = function getRange(A,I,J) {
    var m = I.length, n = J.length;
    var i,j;
    var B = Array(m), Bi, AI;
    for(i=m-1;i!==-1;--i) {
        B[i] = Array(n);
        Bi = B[i];
        AI = A[I[i]];
        for(j=n-1;j!==-1;--j) Bi[j] = AI[J[j]];
    }
    return B;
}

numeric.blockMatrix = function blockMatrix(X) {
    var s = numeric.dim(X);
    if(s.length<4) return numeric.blockMatrix([X]);
    var m=s[0],n=s[1],M,N,i,j,Xij;
    M = 0; N = 0;
    for(i=0;i<m;++i) M+=X[i][0].length;
    for(j=0;j<n;++j) N+=X[0][j][0].length;
    var Z = Array(M);
    for(i=0;i<M;++i) Z[i] = Array(N);
    var I=0,J,ZI,k,l,Xijk;
    for(i=0;i<m;++i) {
        J=N;
        for(j=n-1;j!==-1;--j) {
            Xij = X[i][j];
            J -= Xij[0].length;
            for(k=Xij.length-1;k!==-1;--k) {
                Xijk = Xij[k];
                ZI = Z[I+k];
                for(l = Xijk.length-1;l!==-1;--l) ZI[J+l] = Xijk[l];
            }
        }
        I += X[i][0].length;
    }
    return Z;
}

numeric.tensor = function tensor(x,y) {
    if(typeof x === "number" || typeof y === "number") return numeric.mul(x,y);
    var s1 = numeric.dim(x), s2 = numeric.dim(y);
    if(s1.length !== 1 || s2.length !== 1) {
        throw new Error('numeric: tensor product is only defined for vectors');
    }
    var m = s1[0], n = s2[0], A = Array(m), Ai, i,j,xi;
    for(i=m-1;i>=0;i--) {
        Ai = Array(n);
        xi = x[i];
        for(j=n-1;j>=3;--j) {
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
            --j;
            Ai[j] = xi * y[j];
        }
        while(j>=0) { Ai[j] = xi * y[j]; --j; }
        A[i] = Ai;
    }
    return A;
}

// 3. The Tensor type T
numeric.T = function T(x,y) { this.x = x; this.y = y; }
numeric.t = function t(x,y) { return new numeric.T(x,y); }

numeric.Tbinop = function Tbinop(rr,rc,cr,cc,setup) {
    var io = numeric.indexOf;
    if(typeof setup !== "string") {
        var k;
        setup = '';
        for(k in numeric) {
            if(numeric.hasOwnProperty(k) && (rr.indexOf(k)>=0 || rc.indexOf(k)>=0 || cr.indexOf(k)>=0 || cc.indexOf(k)>=0) && k.length>1) {
                setup += 'var '+k+' = numeric.'+k+';\n';
            }
        }
    }
    return Function(['y'],
            'var x = this;\n'+
            'if(!(y instanceof numeric.T)) { y = new numeric.T(y); }\n'+
            setup+'\n'+
            'if(x.y) {'+
            '  if(y.y) {'+
            '    return new numeric.T('+cc+');\n'+
            '  }\n'+
            '  return new numeric.T('+cr+');\n'+
            '}\n'+
            'if(y.y) {\n'+
            '  return new numeric.T('+rc+');\n'+
            '}\n'+
            'return new numeric.T('+rr+');\n'
    );
}

numeric.T.prototype.add = numeric.Tbinop(
        'add(x.x,y.x)',
        'add(x.x,y.x),y.y',
        'add(x.x,y.x),x.y',
        'add(x.x,y.x),add(x.y,y.y)');
numeric.T.prototype.sub = numeric.Tbinop(
        'sub(x.x,y.x)',
        'sub(x.x,y.x),neg(y.y)',
        'sub(x.x,y.x),x.y',
        'sub(x.x,y.x),sub(x.y,y.y)');
numeric.T.prototype.mul = numeric.Tbinop(
        'mul(x.x,y.x)',
        'mul(x.x,y.x),mul(x.x,y.y)',
        'mul(x.x,y.x),mul(x.y,y.x)',
        'sub(mul(x.x,y.x),mul(x.y,y.y)),add(mul(x.x,y.y),mul(x.y,y.x))');

numeric.T.prototype.reciprocal = function reciprocal() {
    var mul = numeric.mul, div = numeric.div;
    if(this.y) {
        var d = numeric.add(mul(this.x,this.x),mul(this.y,this.y));
        return new numeric.T(div(this.x,d),div(numeric.neg(this.y),d));
    }
    return new T(div(1,this.x));
}
numeric.T.prototype.div = function div(y) {
    if(!(y instanceof numeric.T)) y = new numeric.T(y);
    if(y.y) { return this.mul(y.reciprocal()); }
    var div = numeric.div;
    if(this.y) { return new numeric.T(div(this.x,y.x),div(this.y,y.x)); }
    return new numeric.T(div(this.x,y.x));
}
numeric.T.prototype.dot = numeric.Tbinop(
        'dot(x.x,y.x)',
        'dot(x.x,y.x),dot(x.x,y.y)',
        'dot(x.x,y.x),dot(x.y,y.x)',
        'sub(dot(x.x,y.x),dot(x.y,y.y)),add(dot(x.x,y.y),dot(x.y,y.x))'
        );
numeric.T.prototype.transpose = function transpose() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if(y) { return new numeric.T(t(x),t(y)); }
    return new numeric.T(t(x));
}
numeric.T.prototype.transjugate = function transjugate() {
    var t = numeric.transpose, x = this.x, y = this.y;
    if(y) { return new numeric.T(t(x),numeric.negtranspose(y)); }
    return new numeric.T(t(x));
}
numeric.Tunop = function Tunop(r,c,s) {
    if(typeof s !== "string") { s = ''; }
    return Function(
            'var x = this;\n'+
            s+'\n'+
            'if(x.y) {'+
            '  '+c+';\n'+
            '}\n'+
            r+';\n'
    );
}

numeric.T.prototype.exp = numeric.Tunop(
        'return new numeric.T(ex)',
        'return new numeric.T(mul(cos(x.y),ex),mul(sin(x.y),ex))',
        'var ex = numeric.exp(x.x), cos = numeric.cos, sin = numeric.sin, mul = numeric.mul;');
numeric.T.prototype.conj = numeric.Tunop(
        'return new numeric.T(x.x);',
        'return new numeric.T(x.x,numeric.neg(x.y));');
numeric.T.prototype.neg = numeric.Tunop(
        'return new numeric.T(neg(x.x));',
        'return new numeric.T(neg(x.x),neg(x.y));',
        'var neg = numeric.neg;');
numeric.T.prototype.sin = numeric.Tunop(
        'return new numeric.T(numeric.sin(x.x))',
        'return x.exp().sub(x.neg().exp()).div(new numeric.T(0,2));');
numeric.T.prototype.cos = numeric.Tunop(
        'return new numeric.T(numeric.cos(x.x))',
        'return x.exp().add(x.neg().exp()).div(2);');
numeric.T.prototype.abs = numeric.Tunop(
        'return new numeric.T(numeric.abs(x.x));',
        'return new numeric.T(numeric.sqrt(numeric.add(mul(x.x,x.x),mul(x.y,x.y))));',
        'var mul = numeric.mul;');
numeric.T.prototype.log = numeric.Tunop(
        'return new numeric.T(numeric.log(x.x));',
        'var theta = new numeric.T(numeric.atan2(x.y,x.x)), r = x.abs();\n'+
        'return new numeric.T(numeric.log(r.x),theta.x);');
numeric.T.prototype.norm2 = numeric.Tunop(
        'return numeric.norm2(x.x);',
        'var f = numeric.norm2Squared;\n'+
        'return Math.sqrt(f(x.x)+f(x.y));');
numeric.T.prototype.inv = function inv() {
    var A = this;
    if(typeof A.y === "undefined") { return new numeric.T(numeric.inv(A.x)); }
    var n = A.x.length, i, j, k;
    var Rx = numeric.identity(n),Ry = numeric.rep([n,n],0);
    var Ax = numeric.clone(A.x), Ay = numeric.clone(A.y);
    var Aix, Aiy, Ajx, Ajy, Rix, Riy, Rjx, Rjy;
    var i,j,k,d,d1,ax,ay,bx,by,temp;
    for(i=0;i<n;i++) {
        ax = Ax[i][i]; ay = Ay[i][i];
        d = ax*ax+ay*ay;
        k = i;
        for(j=i+1;j<n;j++) {
            ax = Ax[j][i]; ay = Ay[j][i];
            d1 = ax*ax+ay*ay;
            if(d1 > d) { k=j; d = d1; }
        }
        if(k!==i) {
            temp = Ax[i]; Ax[i] = Ax[k]; Ax[k] = temp;
            temp = Ay[i]; Ay[i] = Ay[k]; Ay[k] = temp;
            temp = Rx[i]; Rx[i] = Rx[k]; Rx[k] = temp;
            temp = Ry[i]; Ry[i] = Ry[k]; Ry[k] = temp;
        }
        Aix = Ax[i]; Aiy = Ay[i];
        Rix = Rx[i]; Riy = Ry[i];
        ax = Aix[i]; ay = Aiy[i];
        for(j=i+1;j<n;j++) {
            bx = Aix[j]; by = Aiy[j];
            Aix[j] = (bx*ax+by*ay)/d;
            Aiy[j] = (by*ax-bx*ay)/d;
        }
        for(j=0;j<n;j++) {
            bx = Rix[j]; by = Riy[j];
            Rix[j] = (bx*ax+by*ay)/d;
            Riy[j] = (by*ax-bx*ay)/d;
        }
        for(j=i+1;j<n;j++) {
            Ajx = Ax[j]; Ajy = Ay[j];
            Rjx = Rx[j]; Rjy = Ry[j];
            ax = Ajx[i]; ay = Ajy[i];
            for(k=i+1;k<n;k++) {
                bx = Aix[k]; by = Aiy[k];
                Ajx[k] -= bx*ax-by*ay;
                Ajy[k] -= by*ax+bx*ay;
            }
            for(k=0;k<n;k++) {
                bx = Rix[k]; by = Riy[k];
                Rjx[k] -= bx*ax-by*ay;
                Rjy[k] -= by*ax+bx*ay;
            }
        }
    }
    for(i=n-1;i>0;i--) {
        Rix = Rx[i]; Riy = Ry[i];
        for(j=i-1;j>=0;j--) {
            Rjx = Rx[j]; Rjy = Ry[j];
            ax = Ax[j][i]; ay = Ay[j][i];
            for(k=n-1;k>=0;k--) {
                bx = Rix[k]; by = Riy[k];
                Rjx[k] -= ax*bx - ay*by;
                Rjy[k] -= ax*by + ay*bx;
            }
        }
    }
    return new numeric.T(Rx,Ry);
}
numeric.T.prototype.get = function get(i) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length;
    if(y) {
        while(k<n) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        return new numeric.T(x,y);
    }
    while(k<n) {
        ik = i[k];
        x = x[ik];
        k++;
    }
    return new numeric.T(x);
}
numeric.T.prototype.set = function set(i,v) {
    var x = this.x, y = this.y, k = 0, ik, n = i.length, vx = v.x, vy = v.y;
    if(n===0) {
        if(vy) { this.y = vy; }
        else if(y) { this.y = undefined; }
        this.x = x;
        return this;
    }
    if(vy) {
        if(y) { /* ok */ }
        else {
            y = numeric.rep(numeric.dim(x),0);
            this.y = y;
        }
        while(k<n-1) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        y[ik] = vy;
        return this;
    }
    if(y) {
        while(k<n-1) {
            ik = i[k];
            x = x[ik];
            y = y[ik];
            k++;
        }
        ik = i[k];
        x[ik] = vx;
        if(vx instanceof Array) y[ik] = numeric.rep(numeric.dim(vx),0);
        else y[ik] = 0;
        return this;
    }
    while(k<n-1) {
        ik = i[k];
        x = x[ik];
        k++;
    }
    ik = i[k];
    x[ik] = vx;
    return this;
}
numeric.T.prototype.getRows = function getRows(i0,i1) {
    var n = i1-i0+1, j;
    var rx = Array(n), ry, x = this.x, y = this.y;
    for(j=i0;j<=i1;j++) { rx[j-i0] = x[j]; }
    if(y) {
        ry = Array(n);
        for(j=i0;j<=i1;j++) { ry[j-i0] = y[j]; }
        return new numeric.T(rx,ry);
    }
    return new numeric.T(rx);
}
numeric.T.prototype.setRows = function setRows(i0,i1,A) {
    var j;
    var rx = this.x, ry = this.y, x = A.x, y = A.y;
    for(j=i0;j<=i1;j++) { rx[j] = x[j-i0]; }
    if(y) {
        if(!ry) { ry = numeric.rep(numeric.dim(rx),0); this.y = ry; }
        for(j=i0;j<=i1;j++) { ry[j] = y[j-i0]; }
    } else if(ry) {
        for(j=i0;j<=i1;j++) { ry[j] = numeric.rep([x[j-i0].length],0); }
    }
    return this;
}
numeric.T.prototype.getRow = function getRow(k) {
    var x = this.x, y = this.y;
    if(y) { return new numeric.T(x[k],y[k]); }
    return new numeric.T(x[k]);
}
numeric.T.prototype.setRow = function setRow(i,v) {
    var rx = this.x, ry = this.y, x = v.x, y = v.y;
    rx[i] = x;
    if(y) {
        if(!ry) { ry = numeric.rep(numeric.dim(rx),0); this.y = ry; }
        ry[i] = y;
    } else if(ry) {
        ry = numeric.rep([x.length],0);
    }
    return this;
}

numeric.T.prototype.getBlock = function getBlock(from,to) {
    var x = this.x, y = this.y, b = numeric.getBlock;
    if(y) { return new numeric.T(b(x,from,to),b(y,from,to)); }
    return new numeric.T(b(x,from,to));
}
numeric.T.prototype.setBlock = function setBlock(from,to,A) {
    if(!(A instanceof numeric.T)) A = new numeric.T(A);
    var x = this.x, y = this.y, b = numeric.setBlock, Ax = A.x, Ay = A.y;
    if(Ay) {
        if(!y) { this.y = numeric.rep(numeric.dim(this),0); y = this.y; }
        b(x,from,to,Ax);
        b(y,from,to,Ay);
        return this;
    }
    b(x,from,to,Ax);
    if(y) b(y,from,to,numeric.rep(numeric.dim(Ax),0));
}
numeric.T.rep = function rep(s,v) {
    var T = numeric.T;
    if(!(v instanceof T)) v = new T(v);
    var x = v.x, y = v.y, r = numeric.rep;
    if(y) return new T(r(s,x),r(s,y));
    return new T(r(s,x));
}
numeric.T.diag = function diag(d) {
    if(!(d instanceof numeric.T)) d = new numeric.T(d);
    var x = d.x, y = d.y, diag = numeric.diag;
    if(y) return new numeric.T(diag(x),diag(y));
    return new numeric.T(diag(x));
}
numeric.T.eig = function eig() {
    if(this.y) { throw new Error('eig: not implemented for complex matrices.'); }
    return numeric.eig(this.x);
}
numeric.T.identity = function identity(n) { return new numeric.T(numeric.identity(n)); }
numeric.T.prototype.getDiag = function getDiag() {
    var n = numeric;
    var x = this.x, y = this.y;
    if(y) { return new n.T(n.getDiag(x),n.getDiag(y)); }
    return new n.T(n.getDiag(x));
}

// 4. Eigenvalues of real matrices

numeric.house = function house(x) {
    var v = numeric.clone(x);
    var s = x[0] >= 0 ? 1 : -1;
    var alpha = s*numeric.norm2(x);
    v[0] += alpha;
    var foo = numeric.norm2(v);
    if(foo === 0) { /* this should not happen */ throw new Error('eig: internal error'); }
    return numeric.div(v,foo);
}

numeric.toUpperHessenberg = function toUpperHessenberg(me) {
    var s = numeric.dim(me);
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: toUpperHessenberg() only works on square matrices'); }
    var m = s[0], i,j,k,x,v,A = numeric.clone(me),B,C,Ai,Ci,Q = numeric.identity(m),Qi;
    for(j=0;j<m-2;j++) {
        x = Array(m-j-1);
        for(i=j+1;i<m;i++) { x[i-j-1] = A[i][j]; }
        if(numeric.norm2(x)>0) {
            v = numeric.house(x);
            B = numeric.getBlock(A,[j+1,j],[m-1,m-1]);
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<m;i++) { Ai = A[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Ai[k] -= 2*Ci[k-j]; }
            B = numeric.getBlock(A,[0,j+1],[m-1,m-1]);
            C = numeric.tensor(numeric.dot(B,v),v);
            for(i=0;i<m;i++) { Ai = A[i]; Ci = C[i]; for(k=j+1;k<m;k++) Ai[k] -= 2*Ci[k-j-1]; }
            B = Array(m-j-1);
            for(i=j+1;i<m;i++) B[i-j-1] = Q[i];
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<m;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        }
    }
    return {H:A, Q:Q};
}

numeric.epsilon = 2.220446049250313e-16;

numeric.QRFrancis = function(H,maxiter) {
    if(typeof maxiter === "undefined") { maxiter = 10000; }
    H = numeric.clone(H);
    var H0 = numeric.clone(H);
    var s = numeric.dim(H),m=s[0],x,v,a,b,c,d,det,tr, Hloc, Q = numeric.identity(m), Qi, Hi, B, C, Ci,i,j,k,iter;
    if(m<3) { return {Q:Q, B:[ [0,m-1] ]}; }
    var epsilon = numeric.epsilon;
    for(iter=0;iter<maxiter;iter++) {
        for(j=0;j<m-1;j++) {
            if(Math.abs(H[j+1][j]) < epsilon*(Math.abs(H[j][j])+Math.abs(H[j+1][j+1]))) {
                var QH1 = numeric.QRFrancis(numeric.getBlock(H,[0,0],[j,j]),maxiter);
                var QH2 = numeric.QRFrancis(numeric.getBlock(H,[j+1,j+1],[m-1,m-1]),maxiter);
                B = Array(j+1);
                for(i=0;i<=j;i++) { B[i] = Q[i]; }
                C = numeric.dot(QH1.Q,B);
                for(i=0;i<=j;i++) { Q[i] = C[i]; }
                B = Array(m-j-1);
                for(i=j+1;i<m;i++) { B[i-j-1] = Q[i]; }
                C = numeric.dot(QH2.Q,B);
                for(i=j+1;i<m;i++) { Q[i] = C[i-j-1]; }
                return {Q:Q,B:QH1.B.concat(numeric.add(QH2.B,j+1))};
            }
        }
        a = H[m-2][m-2]; b = H[m-2][m-1];
        c = H[m-1][m-2]; d = H[m-1][m-1];
        tr = a+d;
        det = (a*d-b*c);
        Hloc = numeric.getBlock(H, [0,0], [2,2]);
        if(tr*tr>=4*det) {
            var s1,s2;
            s1 = 0.5*(tr+Math.sqrt(tr*tr-4*det));
            s2 = 0.5*(tr-Math.sqrt(tr*tr-4*det));
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc,Hloc),
                                           numeric.mul(Hloc,s1+s2)),
                               numeric.diag(numeric.rep([3],s1*s2)));
        } else {
            Hloc = numeric.add(numeric.sub(numeric.dot(Hloc,Hloc),
                                           numeric.mul(Hloc,tr)),
                               numeric.diag(numeric.rep([3],det)));
        }
        x = [Hloc[0][0],Hloc[1][0],Hloc[2][0]];
        v = numeric.house(x);
        B = [H[0],H[1],H[2]];
        C = numeric.tensor(v,numeric.dot(v,B));
        for(i=0;i<3;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<m;k++) Hi[k] -= 2*Ci[k]; }
        B = numeric.getBlock(H, [0,0],[m-1,2]);
        C = numeric.tensor(numeric.dot(B,v),v);
        for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<3;k++) Hi[k] -= 2*Ci[k]; }
        B = [Q[0],Q[1],Q[2]];
        C = numeric.tensor(v,numeric.dot(v,B));
        for(i=0;i<3;i++) { Qi = Q[i]; Ci = C[i]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        var J;
        for(j=0;j<m-2;j++) {
            for(k=j;k<=j+1;k++) {
                if(Math.abs(H[k+1][k]) < epsilon*(Math.abs(H[k][k])+Math.abs(H[k+1][k+1]))) {
                    var QH1 = numeric.QRFrancis(numeric.getBlock(H,[0,0],[k,k]),maxiter);
                    var QH2 = numeric.QRFrancis(numeric.getBlock(H,[k+1,k+1],[m-1,m-1]),maxiter);
                    B = Array(k+1);
                    for(i=0;i<=k;i++) { B[i] = Q[i]; }
                    C = numeric.dot(QH1.Q,B);
                    for(i=0;i<=k;i++) { Q[i] = C[i]; }
                    B = Array(m-k-1);
                    for(i=k+1;i<m;i++) { B[i-k-1] = Q[i]; }
                    C = numeric.dot(QH2.Q,B);
                    for(i=k+1;i<m;i++) { Q[i] = C[i-k-1]; }
                    return {Q:Q,B:QH1.B.concat(numeric.add(QH2.B,k+1))};
                }
            }
            J = Math.min(m-1,j+3);
            x = Array(J-j);
            for(i=j+1;i<=J;i++) { x[i-j-1] = H[i][j]; }
            v = numeric.house(x);
            B = numeric.getBlock(H, [j+1,j],[J,m-1]);
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<=J;i++) { Hi = H[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Hi[k] -= 2*Ci[k-j]; }
            B = numeric.getBlock(H, [0,j+1],[m-1,J]);
            C = numeric.tensor(numeric.dot(B,v),v);
            for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=j+1;k<=J;k++) Hi[k] -= 2*Ci[k-j-1]; }
            B = Array(J-j);
            for(i=j+1;i<=J;i++) B[i-j-1] = Q[i];
            C = numeric.tensor(v,numeric.dot(v,B));
            for(i=j+1;i<=J;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        }
    }
    throw new Error('numeric: eigenvalue iteration does not converge -- increase maxiter?');
}

numeric.eig = function eig(A,maxiter) {
    var QH = numeric.toUpperHessenberg(A);
    var QB = numeric.QRFrancis(QH.H,maxiter);
    var T = numeric.T;
    var n = A.length,i,k,flag = false,B = QB.B,H = numeric.dot(QB.Q,numeric.dot(QH.H,numeric.transpose(QB.Q)));
    var Q = new T(numeric.dot(QB.Q,QH.Q)),Q0;
    var m = B.length,j;
    var a,b,c,d,p1,p2,disc,x,y,p,q,n1,n2;
    var sqrt = Math.sqrt;
    for(k=0;k<m;k++) {
        i = B[k][0];
        if(i === B[k][1]) {
            // nothing
        } else {
            j = i+1;
            a = H[i][i];
            b = H[i][j];
            c = H[j][i];
            d = H[j][j];
            if(b === 0 && c === 0) continue;
            p1 = -a-d;
            p2 = a*d-b*c;
            disc = p1*p1-4*p2;
            if(disc>=0) {
                if(p1<0) x = -0.5*(p1-sqrt(disc));
                else     x = -0.5*(p1+sqrt(disc));
                n1 = (a-x)*(a-x)+b*b;
                n2 = c*c+(d-x)*(d-x);
                if(n1>n2) {
                    n1 = sqrt(n1);
                    p = (a-x)/n1;
                    q = b/n1;
                } else {
                    n2 = sqrt(n2);
                    p = c/n2;
                    q = (d-x)/n2;
                }
                Q0 = new T([[q,-p],[p,q]]);
                Q.setRows(i,j,Q0.dot(Q.getRows(i,j)));
            } else {
                x = -0.5*p1;
                y = 0.5*sqrt(-disc);
                n1 = (a-x)*(a-x)+b*b;
                n2 = c*c+(d-x)*(d-x);
                if(n1>n2) {
                    n1 = sqrt(n1+y*y);
                    p = (a-x)/n1;
                    q = b/n1;
                    x = 0;
                    y /= n1;
                } else {
                    n2 = sqrt(n2+y*y);
                    p = c/n2;
                    q = (d-x)/n2;
                    x = y/n2;
                    y = 0;
                }
                Q0 = new T([[q,-p],[p,q]],[[x,y],[y,-x]]);
                Q.setRows(i,j,Q0.dot(Q.getRows(i,j)));
            }
        }
    }
    var R = Q.dot(A).dot(Q.transjugate()), n = A.length, E = numeric.T.identity(n);
    for(j=0;j<n;j++) {
        if(j>0) {
            for(k=j-1;k>=0;k--) {
                var Rk = R.get([k,k]), Rj = R.get([j,j]);
                if(numeric.neq(Rk.x,Rj.x) || numeric.neq(Rk.y,Rj.y)) {
                    x = R.getRow(k).getBlock([k],[j-1]);
                    y = E.getRow(j).getBlock([k],[j-1]);
                    E.set([j,k],(R.get([k,j]).neg().sub(x.dot(y))).div(Rk.sub(Rj)));
                } else {
                    E.setRow(j,E.getRow(k));
                    continue;
                }
            }
        }
    }
    for(j=0;j<n;j++) {
        x = E.getRow(j);
        E.setRow(j,x.div(x.norm2()));
    }
    E = E.transpose();
    E = Q.transjugate().dot(E);
    return { lambda:R.getDiag(), E:E };
};

// 5. Compressed Column Storage matrices
numeric.ccsSparse = function ccsSparse(A) {
    var m = A.length,n,foo, i,j, counts = [];
    for(i=m-1;i!==-1;--i) {
        foo = A[i];
        for(j in foo) {
            j = parseInt(j);
            while(j>=counts.length) counts[counts.length] = 0;
            if(foo[j]!==0) counts[j]++;
        }
    }
    var n = counts.length;
    var Ai = Array(n+1);
    Ai[0] = 0;
    for(i=0;i<n;++i) Ai[i+1] = Ai[i] + counts[i];
    var Aj = Array(Ai[n]), Av = Array(Ai[n]);
    for(i=m-1;i!==-1;--i) {
        foo = A[i];
        for(j in foo) {
            if(foo[j]!==0) {
                counts[j]--;
                Aj[Ai[j]+counts[j]] = i;
                Av[Ai[j]+counts[j]] = foo[j];
            }
        }
    }
    return [Ai,Aj,Av];
}
numeric.ccsFull = function ccsFull(A) {
    var Ai = A[0], Aj = A[1], Av = A[2], s = numeric.ccsDim(A), m = s[0], n = s[1], i,j,j0,j1,k;
    var B = numeric.rep([m,n],0);
    for(i=0;i<n;i++) {
        j0 = Ai[i];
        j1 = Ai[i+1];
        for(j=j0;j<j1;++j) { B[Aj[j]][i] = Av[j]; }
    }
    return B;
}
numeric.ccsTSolve = function ccsTSolve(A,b,x,bj,xj) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, max = Math.max,n=0;
    if(typeof bj === "undefined") x = numeric.rep([m],0);
    if(typeof bj === "undefined") bj = numeric.linspace(0,x.length-1);
    if(typeof xj === "undefined") xj = [];
    function dfs(j) {
        var k;
        if(x[j] !== 0) return;
        x[j] = 1;
        for(k=Ai[j];k<Ai[j+1];++k) dfs(Aj[k]);
        xj[n] = j;
        ++n;
    }
    var i,j,j0,j1,k,l,l0,l1,a;
    for(i=bj.length-1;i!==-1;--i) { dfs(bj[i]); }
    xj.length = n;
    for(i=xj.length-1;i!==-1;--i) { x[xj[i]] = 0; }
    for(i=bj.length-1;i!==-1;--i) { j = bj[i]; x[j] = b[j]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        j0 = Ai[j];
        j1 = max(Ai[j+1],j0);
        for(k=j0;k!==j1;++k) { if(Aj[k] === j) { x[j] /= Av[k]; break; } }
        a = x[j];
        for(k=j0;k!==j1;++k) {
            l = Aj[k];
            if(l !== j) x[l] -= a*Av[k];
        }
    }
    return x;
}
numeric.ccsDFS = function ccsDFS(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
}
numeric.ccsDFS.prototype.dfs = function dfs(J,Ai,Aj,x,xj,Pinv) {
    var m = 0,foo,n=xj.length;
    var k = this.k, k1 = this.k1, j = this.j,km,k11;
    if(x[J]!==0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[J];
    k1[0] = k11 = Ai[J+1];
    while(1) {
        if(km >= k11) {
            xj[n] = j[m];
            if(m===0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Pinv[Aj[km]];
            if(x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                km = Ai[foo];
                k1[m] = k11 = Ai[foo+1];
            } else ++km;
        }
    }
}
numeric.ccsLPSolve = function ccsLPSolve(A,B,x,xj,I,Pinv,dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, n=0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    
    var i,i0,i1,j,J,j0,j1,k,l,l0,l1,a;
    i0 = Bi[I];
    i1 = Bi[I+1];
    xj.length = 0;
    for(i=i0;i<i1;++i) { dfs.dfs(Pinv[Bj[i]],Ai,Aj,x,xj,Pinv); }
    for(i=xj.length-1;i!==-1;--i) { x[xj[i]] = 0; }
    for(i=i0;i!==i1;++i) { j = Pinv[Bj[i]]; x[j] = Bv[i]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        j0 = Ai[j];
        j1 = Ai[j+1];
        for(k=j0;k<j1;++k) { if(Pinv[Aj[k]] === j) { x[j] /= Av[k]; break; } }
        a = x[j];
        for(k=j0;k<j1;++k) {
            l = Pinv[Aj[k]];
            if(l !== j) x[l] -= a*Av[k];
        }
    }
    return x;
}
numeric.ccsLUP1 = function ccsLUP1(A,threshold) {
    var m = A[0].length-1;
    var L = [numeric.rep([m+1],0),[],[]], U = [numeric.rep([m+1], 0),[],[]];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var x = numeric.rep([m],0), xj = numeric.rep([m],0);
    var i,j,k,j0,j1,a,e,c,d,K;
    var sol = numeric.ccsLPSolve, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0,m-1),Pinv = numeric.linspace(0,m-1);
    var dfs = new numeric.ccsDFS(m);
    if(typeof threshold === "undefined") { threshold = 1; }
    for(i=0;i<m;++i) {
        sol(L,A,x,xj,i,Pinv,dfs);
        a = -1;
        e = -1;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            if(k <= i) continue;
            c = abs(x[k]);
            if(c > a) { e = k; a = c; }
        }
        if(abs(x[i])<threshold*a) {
            j = P[i];
            a = P[e];
            P[i] = a; Pinv[a] = i;
            P[e] = j; Pinv[j] = e;
            a = x[i]; x[i] = x[e]; x[e] = a;
        }
        a = Li[i];
        e = Ui[i];
        d = x[i];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            c = x[k];
            xj[j] = 0;
            x[k] = 0;
            if(k<=i) { Uj[e] = k; Uv[e] = c;   ++e; }
            else     { Lj[a] = P[k]; Lv[a] = c/d; ++a; }
        }
        Li[i+1] = a;
        Ui[i+1] = e;
    }
    for(j=Lj.length-1;j!==-1;--j) { Lj[j] = Pinv[Lj[j]]; }
    return {L:L, U:U, P:P, Pinv:Pinv};
}
numeric.ccsDFS0 = function ccsDFS0(n) {
    this.k = Array(n);
    this.k1 = Array(n);
    this.j = Array(n);
}
numeric.ccsDFS0.prototype.dfs = function dfs(J,Ai,Aj,x,xj,Pinv,P) {
    var m = 0,foo,n=xj.length;
    var k = this.k, k1 = this.k1, j = this.j,km,k11;
    if(x[J]!==0) return;
    x[J] = 1;
    j[0] = J;
    k[0] = km = Ai[Pinv[J]];
    k1[0] = k11 = Ai[Pinv[J]+1];
    while(1) {
        if(isNaN(km)) throw new Error("Ow!");
        if(km >= k11) {
            xj[n] = Pinv[j[m]];
            if(m===0) return;
            ++n;
            --m;
            km = k[m];
            k11 = k1[m];
        } else {
            foo = Aj[km];
            if(x[foo] === 0) {
                x[foo] = 1;
                k[m] = km;
                ++m;
                j[m] = foo;
                foo = Pinv[foo];
                km = Ai[foo];
                k1[m] = k11 = Ai[foo+1];
            } else ++km;
        }
    }
}
numeric.ccsLPSolve0 = function ccsLPSolve0(A,B,y,xj,I,Pinv,P,dfs) {
    var Ai = A[0], Aj = A[1], Av = A[2],m = Ai.length-1, n=0;
    var Bi = B[0], Bj = B[1], Bv = B[2];
    
    var i,i0,i1,j,J,j0,j1,k,l,l0,l1,a;
    i0 = Bi[I];
    i1 = Bi[I+1];
    xj.length = 0;
    for(i=i0;i<i1;++i) { dfs.dfs(Bj[i],Ai,Aj,y,xj,Pinv,P); }
    for(i=xj.length-1;i!==-1;--i) { j = xj[i]; y[P[j]] = 0; }
    for(i=i0;i!==i1;++i) { j = Bj[i]; y[j] = Bv[i]; }
    for(i=xj.length-1;i!==-1;--i) {
        j = xj[i];
        l = P[j];
        j0 = Ai[j];
        j1 = Ai[j+1];
        for(k=j0;k<j1;++k) { if(Aj[k] === l) { y[l] /= Av[k]; break; } }
        a = y[l];
        for(k=j0;k<j1;++k) y[Aj[k]] -= a*Av[k];
        y[l] = a;
    }
}
numeric.ccsLUP0 = function ccsLUP0(A,threshold) {
    var m = A[0].length-1;
    var L = [numeric.rep([m+1],0),[],[]], U = [numeric.rep([m+1], 0),[],[]];
    var Li = L[0], Lj = L[1], Lv = L[2], Ui = U[0], Uj = U[1], Uv = U[2];
    var y = numeric.rep([m],0), xj = numeric.rep([m],0);
    var i,j,k,j0,j1,a,e,c,d,K;
    var sol = numeric.ccsLPSolve0, max = Math.max, abs = Math.abs;
    var P = numeric.linspace(0,m-1),Pinv = numeric.linspace(0,m-1);
    var dfs = new numeric.ccsDFS0(m);
    if(typeof threshold === "undefined") { threshold = 1; }
    for(i=0;i<m;++i) {
        sol(L,A,y,xj,i,Pinv,P,dfs);
        a = -1;
        e = -1;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            if(k <= i) continue;
            c = abs(y[P[k]]);
            if(c > a) { e = k; a = c; }
        }
        if(abs(y[P[i]])<threshold*a) {
            j = P[i];
            a = P[e];
            P[i] = a; Pinv[a] = i;
            P[e] = j; Pinv[j] = e;
        }
        a = Li[i];
        e = Ui[i];
        d = y[P[i]];
        Lj[a] = P[i];
        Lv[a] = 1;
        ++a;
        for(j=xj.length-1;j!==-1;--j) {
            k = xj[j];
            c = y[P[k]];
            xj[j] = 0;
            y[P[k]] = 0;
            if(k<=i) { Uj[e] = k; Uv[e] = c;   ++e; }
            else     { Lj[a] = P[k]; Lv[a] = c/d; ++a; }
        }
        Li[i+1] = a;
        Ui[i+1] = e;
    }
    for(j=Lj.length-1;j!==-1;--j) { Lj[j] = Pinv[Lj[j]]; }
    return {L:L, U:U, P:P, Pinv:Pinv};
}
numeric.ccsLUP = numeric.ccsLUP0;

numeric.ccsDim = function ccsDim(A) { return [numeric.sup(A[1])+1,A[0].length-1]; }
numeric.ccsGetBlock = function ccsGetBlock(A,i,j) {
    var s = numeric.ccsDim(A),m=s[0],n=s[1];
    if(typeof i === "undefined") { i = numeric.linspace(0,m-1); }
    else if(typeof i === "number") { i = [i]; }
    if(typeof j === "undefined") { j = numeric.linspace(0,n-1); }
    else if(typeof j === "number") { j = [j]; }
    var p,p0,p1,P = i.length,q,Q = j.length,r,jq,ip;
    var Bi = numeric.rep([n],0), Bj=[], Bv=[], B = [Bi,Bj,Bv];
    var Ai = A[0], Aj = A[1], Av = A[2];
    var x = numeric.rep([m],0),count=0,flags = numeric.rep([m],0);
    for(q=0;q<Q;++q) {
        jq = j[q];
        var q0 = Ai[jq];
        var q1 = Ai[jq+1];
        for(p=q0;p<q1;++p) {
            r = Aj[p];
            flags[r] = 1;
            x[r] = Av[p];
        }
        for(p=0;p<P;++p) {
            ip = i[p];
            if(flags[ip]) {
                Bj[count] = p;
                Bv[count] = x[i[p]];
                ++count;
            }
        }
        for(p=q0;p<q1;++p) {
            r = Aj[p];
            flags[r] = 0;
        }
        Bi[q+1] = count;
    }
    return B;
}

numeric.ccsDot = function ccsDot(A,B) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var Bi = B[0], Bj = B[1], Bv = B[2];
    var sA = numeric.ccsDim(A), sB = numeric.ccsDim(B);
    var m = sA[0], n = sA[1], o = sB[1];
    var x = numeric.rep([m],0), flags = numeric.rep([m],0), xj = Array(m);
    var Ci = numeric.rep([o],0), Cj = [], Cv = [], C = [Ci,Cj,Cv];
    var i,j,k,j0,j1,i0,i1,l,p,a,b;
    for(k=0;k!==o;++k) {
        j0 = Bi[k];
        j1 = Bi[k+1];
        p = 0;
        for(j=j0;j<j1;++j) {
            a = Bj[j];
            b = Bv[j];
            i0 = Ai[a];
            i1 = Ai[a+1];
            for(i=i0;i<i1;++i) {
                l = Aj[i];
                if(flags[l]===0) {
                    xj[p] = l;
                    flags[l] = 1;
                    p = p+1;
                }
                x[l] = x[l] + Av[i]*b;
            }
        }
        j0 = Ci[k];
        j1 = j0+p;
        Ci[k+1] = j1;
        for(j=p-1;j!==-1;--j) {
            b = j0+j;
            i = xj[j];
            Cj[b] = i;
            Cv[b] = x[i];
            flags[i] = 0;
            x[i] = 0;
        }
        Ci[k+1] = Ci[k]+p;
    }
    return C;
}

numeric.ccsLUPSolve = function ccsLUPSolve(LUP,B) {
    var L = LUP.L, U = LUP.U, P = LUP.P;
    var Bi = B[0];
    var flag = false;
    if(typeof Bi !== "object") { B = [[0,B.length],numeric.linspace(0,B.length-1),B]; Bi = B[0]; flag = true; }
    var Bj = B[1], Bv = B[2];
    var n = L[0].length-1, m = Bi.length-1;
    var x = numeric.rep([n],0), xj = Array(n);
    var b = numeric.rep([n],0), bj = Array(n);
    var Xi = numeric.rep([m+1],0), Xj = [], Xv = [];
    var sol = numeric.ccsTSolve;
    var i,j,j0,j1,k,J,N=0;
    for(i=0;i<m;++i) {
        k = 0;
        j0 = Bi[i];
        j1 = Bi[i+1];
        for(j=j0;j<j1;++j) { 
            J = LUP.Pinv[Bj[j]];
            bj[k] = J;
            b[J] = Bv[j];
            ++k;
        }
        bj.length = k;
        sol(L,b,x,bj,xj);
        for(j=bj.length-1;j!==-1;--j) b[bj[j]] = 0;
        sol(U,x,b,xj,bj);
        if(flag) return b;
        for(j=xj.length-1;j!==-1;--j) x[xj[j]] = 0;
        for(j=bj.length-1;j!==-1;--j) {
            J = bj[j];
            Xj[N] = J;
            Xv[N] = b[J];
            b[J] = 0;
            ++N;
        }
        Xi[i+1] = N;
    }
    return [Xi,Xj,Xv];
}

numeric.ccsbinop = function ccsbinop(body,setup) {
    if(typeof setup === "undefined") setup='';
    return Function('X','Y',
            'var Xi = X[0], Xj = X[1], Xv = X[2];\n'+
            'var Yi = Y[0], Yj = Y[1], Yv = Y[2];\n'+
            'var n = Xi.length-1,m = Math.max(numeric.sup(Xj),numeric.sup(Yj))+1;\n'+
            'var Zi = numeric.rep([n+1],0), Zj = [], Zv = [];\n'+
            'var x = numeric.rep([m],0),y = numeric.rep([m],0);\n'+
            'var xk,yk,zk;\n'+
            'var i,j,j0,j1,k,p=0;\n'+
            setup+
            'for(i=0;i<n;++i) {\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Xj[j];\n'+
            '    x[k] = 1;\n'+
            '    Zj[p] = k;\n'+
            '    ++p;\n'+
            '  }\n'+
            '  j0 = Yi[i]; j1 = Yi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Yj[j];\n'+
            '    y[k] = Yv[j];\n'+
            '    if(x[k] === 0) {\n'+
            '      Zj[p] = k;\n'+
            '      ++p;\n'+
            '    }\n'+
            '  }\n'+
            '  Zi[i+1] = p;\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) x[Xj[j]] = Xv[j];\n'+
            '  j0 = Zi[i]; j1 = Zi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) {\n'+
            '    k = Zj[j];\n'+
            '    xk = x[k];\n'+
            '    yk = y[k];\n'+
            body+'\n'+
            '    Zv[j] = zk;\n'+
            '  }\n'+
            '  j0 = Xi[i]; j1 = Xi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) x[Xj[j]] = 0;\n'+
            '  j0 = Yi[i]; j1 = Yi[i+1];\n'+
            '  for(j=j0;j!==j1;++j) y[Yj[j]] = 0;\n'+
            '}\n'+
            'return [Zi,Zj,Zv];'
            );
};

(function() {
    var k,A,B,C;
    for(k in numeric.ops2) {
        if(isFinite(eval('1'+numeric.ops2[k]+'0'))) A = '[Y[0],Y[1],numeric.'+k+'(X,Y[2])]';
        else A = 'NaN';
        if(isFinite(eval('0'+numeric.ops2[k]+'1'))) B = '[X[0],X[1],numeric.'+k+'(X[2],Y)]';
        else B = 'NaN';
        if(isFinite(eval('1'+numeric.ops2[k]+'0')) && isFinite(eval('0'+numeric.ops2[k]+'1'))) C = 'numeric.ccs'+k+'MM(X,Y)';
        else C = 'NaN';
        numeric['ccs'+k+'MM'] = numeric.ccsbinop('zk = xk '+numeric.ops2[k]+'yk;');
        numeric['ccs'+k] = Function('X','Y',
                'if(typeof X === "number") return '+A+';\n'+
                'if(typeof Y === "number") return '+B+';\n'+
                'return '+C+';\n'
                );
    }
}());

numeric.ccsScatter = function ccsScatter(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = numeric.sup(Aj)+1,m=Ai.length;
    var Ri = numeric.rep([n],0),Rj=Array(m), Rv = Array(m);
    var counts = numeric.rep([n],0),i;
    for(i=0;i<m;++i) counts[Aj[i]]++;
    for(i=0;i<n;++i) Ri[i+1] = Ri[i] + counts[i];
    var ptr = Ri.slice(0),k,Aii;
    for(i=0;i<m;++i) {
        Aii = Aj[i];
        k = ptr[Aii];
        Rj[k] = Ai[i];
        Rv[k] = Av[i];
        ptr[Aii]=ptr[Aii]+1;
    }
    return [Ri,Rj,Rv];
}

numeric.ccsGather = function ccsGather(A) {
    var Ai = A[0], Aj = A[1], Av = A[2];
    var n = Ai.length-1,m = Aj.length;
    var Ri = Array(m), Rj = Array(m), Rv = Array(m);
    var i,j,j0,j1,p;
    p=0;
    for(i=0;i<n;++i) {
        j0 = Ai[i];
        j1 = Ai[i+1];
        for(j=j0;j!==j1;++j) {
            Rj[p] = i;
            Ri[p] = Aj[j];
            Rv[p] = Av[j];
            ++p;
        }
    }
    return [Ri,Rj,Rv];
}

// The following sparse linear algebra routines are deprecated.

numeric.sdim = function dim(A,ret,k) {
    if(typeof ret === "undefined") { ret = []; }
    if(typeof A !== "object") return ret;
    if(typeof k === "undefined") { k=0; }
    if(!(k in ret)) { ret[k] = 0; }
    if(A.length > ret[k]) ret[k] = A.length;
    var i;
    for(i in A) {
        if(A.hasOwnProperty(i)) dim(A[i],ret,k+1);
    }
    return ret;
};

numeric.sclone = function clone(A,k,n) {
    if(typeof k === "undefined") { k=0; }
    if(typeof n === "undefined") { n = numeric.sdim(A).length; }
    var i,ret = Array(A.length);
    if(k === n-1) {
        for(i in A) { if(A.hasOwnProperty(i)) ret[i] = A[i]; }
        return ret;
    }
    for(i in A) {
        if(A.hasOwnProperty(i)) ret[i] = clone(A[i],k+1,n);
    }
    return ret;
}

numeric.sdiag = function diag(d) {
    var n = d.length,i,ret = Array(n),i1,i2,i3;
    for(i=n-1;i>=1;i-=2) {
        i1 = i-1;
        ret[i] = []; ret[i][i] = d[i];
        ret[i1] = []; ret[i1][i1] = d[i1];
    }
    if(i===0) { ret[0] = []; ret[0][0] = d[i]; }
    return ret;
}

numeric.sidentity = function identity(n) { return numeric.sdiag(numeric.rep([n],1)); }

numeric.stranspose = function transpose(A) {
    var ret = [], n = A.length, i,j,Ai;
    for(i in A) {
        if(!(A.hasOwnProperty(i))) continue;
        Ai = A[i];
        for(j in Ai) {
            if(!(Ai.hasOwnProperty(j))) continue;
            if(typeof ret[j] !== "object") { ret[j] = []; }
            ret[j][i] = Ai[j];
        }
    }
    return ret;
}

numeric.sLUP = function LUP(A,tol) {
    throw new Error("The function numeric.sLUP had a bug in it and has been removed. Please use the new numeric.ccsLUP function instead.");
};

numeric.sdotMM = function dotMM(A,B) {
    var p = A.length, q = B.length, BT = numeric.stranspose(B), r = BT.length, Ai, BTk;
    var i,j,k,accum;
    var ret = Array(p),reti;
    for(i=p-1;i>=0;i--) {
        reti = [];
        Ai = A[i];
        for(k=r-1;k>=0;k--) {
            accum = 0;
            BTk = BT[k];
            for(j in Ai) {
                if(!(Ai.hasOwnProperty(j))) continue;
                if(j in BTk) { accum += Ai[j]*BTk[j]; }
            }
            if(accum) reti[k] = accum;
        }
        ret[i] = reti;
    }
    return ret;
}

numeric.sdotMV = function dotMV(A,x) {
    var p = A.length, Ai, i,j;
    var ret = Array(p), accum;
    for(i=p-1;i>=0;i--) {
        Ai = A[i];
        accum = 0;
        for(j in Ai) {
            if(!(Ai.hasOwnProperty(j))) continue;
            if(x[j]) accum += Ai[j]*x[j];
        }
        if(accum) ret[i] = accum;
    }
    return ret;
}

numeric.sdotVM = function dotMV(x,A) {
    var i,j,Ai,alpha;
    var ret = [], accum;
    for(i in x) {
        if(!x.hasOwnProperty(i)) continue;
        Ai = A[i];
        alpha = x[i];
        for(j in Ai) {
            if(!Ai.hasOwnProperty(j)) continue;
            if(!ret[j]) { ret[j] = 0; }
            ret[j] += alpha*Ai[j];
        }
    }
    return ret;
}

numeric.sdotVV = function dotVV(x,y) {
    var i,ret=0;
    for(i in x) { if(x[i] && y[i]) ret+= x[i]*y[i]; }
    return ret;
}

numeric.sdot = function dot(A,B) {
    var m = numeric.sdim(A).length, n = numeric.sdim(B).length;
    var k = m*1000+n;
    switch(k) {
    case 0: return A*B;
    case 1001: return numeric.sdotVV(A,B);
    case 2001: return numeric.sdotMV(A,B);
    case 1002: return numeric.sdotVM(A,B);
    case 2002: return numeric.sdotMM(A,B);
    default: throw new Error('numeric.sdot not implemented for tensors of order '+m+' and '+n);
    }
}

numeric.sscatter = function scatter(V) {
    var n = V[0].length, Vij, i, j, m = V.length, A = [], Aj;
    for(i=n-1;i>=0;--i) {
        if(!V[m-1][i]) continue;
        Aj = A;
        for(j=0;j<m-2;j++) {
            Vij = V[j][i];
            if(!Aj[Vij]) Aj[Vij] = [];
            Aj = Aj[Vij];
        }
        Aj[V[j][i]] = V[j+1][i];
    }
    return A;
}

numeric.sgather = function gather(A,ret,k) {
    if(typeof ret === "undefined") ret = [];
    if(typeof k === "undefined") k = [];
    var n,i,Ai;
    n = k.length;
    for(i in A) {
        if(A.hasOwnProperty(i)) {
            k[n] = parseInt(i);
            Ai = A[i];
            if(typeof Ai === "number") {
                if(Ai) {
                    if(ret.length === 0) {
                        for(i=n+1;i>=0;--i) ret[i] = [];
                    }
                    for(i=n;i>=0;--i) ret[i].push(k[i]);
                    ret[n+1].push(Ai);
                }
            } else gather(Ai,ret,k);
        }
    }
    if(k.length>n) k.pop();
    return ret;
}

// 6. Coordinate matrices
numeric.cLU = function LU(A) {
    var I = A[0], J = A[1], V = A[2];
    var p = I.length, m=0, i,j,k,a,b,c;
    for(i=0;i<p;i++) if(I[i]>m) m=I[i];
    m++;
    var L = Array(m), U = Array(m), left = numeric.rep([m],Infinity), right = numeric.rep([m],-Infinity);
    var Ui, Uj,alpha;
    for(k=0;k<p;k++) {
        i = I[k];
        j = J[k];
        if(j<left[i]) left[i] = j;
        if(j>right[i]) right[i] = j;
    }
    for(i=0;i<m-1;i++) { if(right[i] > right[i+1]) right[i+1] = right[i]; }
    for(i=m-1;i>=1;i--) { if(left[i]<left[i-1]) left[i-1] = left[i]; }
    var countL = 0, countU = 0;
    for(i=0;i<m;i++) {
        U[i] = numeric.rep([right[i]-left[i]+1],0);
        L[i] = numeric.rep([i-left[i]],0);
        countL += i-left[i]+1;
        countU += right[i]-i+1;
    }
    for(k=0;k<p;k++) { i = I[k]; U[i][J[k]-left[i]] = V[k]; }
    for(i=0;i<m-1;i++) {
        a = i-left[i];
        Ui = U[i];
        for(j=i+1;left[j]<=i && j<m;j++) {
            b = i-left[j];
            c = right[i]-i;
            Uj = U[j];
            alpha = Uj[b]/Ui[a];
            if(alpha) {
                for(k=1;k<=c;k++) { Uj[k+b] -= alpha*Ui[k+a]; }
                L[j][i-left[j]] = alpha;
            }
        }
    }
    var Ui = [], Uj = [], Uv = [], Li = [], Lj = [], Lv = [];
    var p,q,foo;
    p=0; q=0;
    for(i=0;i<m;i++) {
        a = left[i];
        b = right[i];
        foo = U[i];
        for(j=i;j<=b;j++) {
            if(foo[j-a]) {
                Ui[p] = i;
                Uj[p] = j;
                Uv[p] = foo[j-a];
                p++;
            }
        }
        foo = L[i];
        for(j=a;j<i;j++) {
            if(foo[j-a]) {
                Li[q] = i;
                Lj[q] = j;
                Lv[q] = foo[j-a];
                q++;
            }
        }
        Li[q] = i;
        Lj[q] = i;
        Lv[q] = 1;
        q++;
    }
    return {U:[Ui,Uj,Uv], L:[Li,Lj,Lv]};
};

numeric.cLUsolve = function LUsolve(lu,b) {
    var L = lu.L, U = lu.U, ret = numeric.clone(b);
    var Li = L[0], Lj = L[1], Lv = L[2];
    var Ui = U[0], Uj = U[1], Uv = U[2];
    var p = Ui.length, q = Li.length;
    var m = ret.length,i,j,k;
    k = 0;
    for(i=0;i<m;i++) {
        while(Lj[k] < i) {
            ret[i] -= Lv[k]*ret[Lj[k]];
            k++;
        }
        k++;
    }
    k = p-1;
    for(i=m-1;i>=0;i--) {
        while(Uj[k] > i) {
            ret[i] -= Uv[k]*ret[Uj[k]];
            k--;
        }
        ret[i] /= Uv[k];
        k--;
    }
    return ret;
};

numeric.cgrid = function grid(n,shape) {
    if(typeof n === "number") n = [n,n];
    var ret = numeric.rep(n,-1);
    var i,j,count;
    if(typeof shape !== "function") {
        switch(shape) {
        case 'L':
            shape = function(i,j) { return (i>=n[0]/2 || j<n[1]/2); }
            break;
        default:
            shape = function(i,j) { return true; };
            break;
        }
    }
    count=0;
    for(i=1;i<n[0]-1;i++) for(j=1;j<n[1]-1;j++) 
        if(shape(i,j)) {
            ret[i][j] = count;
            count++;
        }
    return ret;
}

numeric.cdelsq = function delsq(g) {
    var dir = [[-1,0],[0,-1],[0,1],[1,0]];
    var s = numeric.dim(g), m = s[0], n = s[1], i,j,k,p,q;
    var Li = [], Lj = [], Lv = [];
    for(i=1;i<m-1;i++) for(j=1;j<n-1;j++) {
        if(g[i][j]<0) continue;
        for(k=0;k<4;k++) {
            p = i+dir[k][0];
            q = j+dir[k][1];
            if(g[p][q]<0) continue;
            Li.push(g[i][j]);
            Lj.push(g[p][q]);
            Lv.push(-1);
        }
        Li.push(g[i][j]);
        Lj.push(g[i][j]);
        Lv.push(4);
    }
    return [Li,Lj,Lv];
}

numeric.cdotMV = function dotMV(A,x) {
    var ret, Ai = A[0], Aj = A[1], Av = A[2],k,p=Ai.length,N;
    N=0;
    for(k=0;k<p;k++) { if(Ai[k]>N) N = Ai[k]; }
    N++;
    ret = numeric.rep([N],0);
    for(k=0;k<p;k++) { ret[Ai[k]]+=Av[k]*x[Aj[k]]; }
    return ret;
}

// 7. Splines

numeric.Spline = function Spline(x,yl,yr,kl,kr) { this.x = x; this.yl = yl; this.yr = yr; this.kl = kl; this.kr = kr; }
numeric.Spline.prototype._at = function _at(x1,p) {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var x1,a,b,t;
    var add = numeric.add, sub = numeric.sub, mul = numeric.mul;
    a = sub(mul(kl[p],x[p+1]-x[p]),sub(yr[p+1],yl[p]));
    b = add(mul(kr[p+1],x[p]-x[p+1]),sub(yr[p+1],yl[p]));
    t = (x1-x[p])/(x[p+1]-x[p]);
    var s = t*(1-t);
    return add(add(add(mul(1-t,yl[p]),mul(t,yr[p+1])),mul(a,s*(1-t))),mul(b,s*t));
}
numeric.Spline.prototype.at = function at(x0) {
    if(typeof x0 === "number") {
        var x = this.x;
        var n = x.length;
        var p,q,mid,floor = Math.floor,a,b,t;
        p = 0;
        q = n-1;
        while(q-p>1) {
            mid = floor((p+q)/2);
            if(x[mid] <= x0) p = mid;
            else q = mid;
        }
        return this._at(x0,p);
    }
    var n = x0.length, i, ret = Array(n);
    for(i=n-1;i!==-1;--i) ret[i] = this.at(x0[i]);
    return ret;
}
numeric.Spline.prototype.diff = function diff() {
    var x = this.x;
    var yl = this.yl;
    var yr = this.yr;
    var kl = this.kl;
    var kr = this.kr;
    var n = yl.length;
    var i,dx,dy;
    var zl = kl, zr = kr, pl = Array(n), pr = Array(n);
    var add = numeric.add, mul = numeric.mul, div = numeric.div, sub = numeric.sub;
    for(i=n-1;i!==-1;--i) {
        dx = x[i+1]-x[i];
        dy = sub(yr[i+1],yl[i]);
        pl[i] = div(add(mul(dy, 6),mul(kl[i],-4*dx),mul(kr[i+1],-2*dx)),dx*dx);
        pr[i+1] = div(add(mul(dy,-6),mul(kl[i], 2*dx),mul(kr[i+1], 4*dx)),dx*dx);
    }
    return new numeric.Spline(x,zl,zr,pl,pr);
}
numeric.Spline.prototype.roots = function roots() {
    function sqr(x) { return x*x; }
    function heval(y0,y1,k0,k1,x) {
        var A = k0*2-(y1-y0);
        var B = -k1*2+(y1-y0);
        var t = (x+1)*0.5;
        var s = t*(1-t);
        return (1-t)*y0+t*y1+A*s*(1-t)+B*s*t;
    }
    var ret = [];
    var x = this.x, yl = this.yl, yr = this.yr, kl = this.kl, kr = this.kr;
    if(typeof yl[0] === "number") {
        yl = [yl];
        yr = [yr];
        kl = [kl];
        kr = [kr];
    }
    var m = yl.length,n=x.length-1,i,j,k,y,s,t;
    var ai,bi,ci,di, ret = Array(m),ri,k0,k1,y0,y1,A,B,D,dx,cx,stops,z0,z1,zm,t0,t1,tm;
    var sqrt = Math.sqrt;
    for(i=0;i!==m;++i) {
        ai = yl[i];
        bi = yr[i];
        ci = kl[i];
        di = kr[i];
        ri = [];
        for(j=0;j!==n;j++) {
            if(j>0 && bi[j]*ai[j]<0) ri.push(x[j]);
            dx = (x[j+1]-x[j]);
            cx = x[j];
            y0 = ai[j];
            y1 = bi[j+1];
            k0 = ci[j]/dx;
            k1 = di[j+1]/dx;
            D = sqr(k0-k1+3*(y0-y1)) + 12*k1*y0;
            A = k1+3*y0+2*k0-3*y1;
            B = 3*(k1+k0+2*(y0-y1));
            if(D<=0) {
                z0 = A/B;
                if(z0>x[j] && z0<x[j+1]) stops = [x[j],z0,x[j+1]];
                else stops = [x[j],x[j+1]];
            } else {
                z0 = (A-sqrt(D))/B;
                z1 = (A+sqrt(D))/B;
                stops = [x[j]];
                if(z0>x[j] && z0<x[j+1]) stops.push(z0);
                if(z1>x[j] && z1<x[j+1]) stops.push(z1);
                stops.push(x[j+1]);
            }
            t0 = stops[0];
            z0 = this._at(t0,j);
            for(k=0;k<stops.length-1;k++) {
                t1 = stops[k+1];
                z1 = this._at(t1,j);
                if(z0 === 0) {
                    ri.push(t0); 
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                if(z1 === 0 || z0*z1>0) {
                    t0 = t1;
                    z0 = z1;
                    continue;
                }
                var side = 0;
                while(1) {
                    tm = (z0*t1-z1*t0)/(z0-z1);
                    if(tm <= t0 || tm >= t1) { break; }
                    zm = this._at(tm,j);
                    if(zm*z1>0) {
                        t1 = tm;
                        z1 = zm;
                        if(side === -1) z0*=0.5;
                        side = -1;
                    } else if(zm*z0>0) {
                        t0 = tm;
                        z0 = zm;
                        if(side === 1) z1*=0.5;
                        side = 1;
                    } else break;
                }
                ri.push(tm);
                t0 = stops[k+1];
                z0 = this._at(t0, j);
            }
            if(z1 === 0) ri.push(t1);
        }
        ret[i] = ri;
    }
    if(typeof this.yl[0] === "number") return ret[0];
    return ret;
}
numeric.spline = function spline(x,y,k1,kn) {
    var n = x.length, b = [], dx = [], dy = [];
    var i;
    var sub = numeric.sub,mul = numeric.mul,add = numeric.add;
    for(i=n-2;i>=0;i--) { dx[i] = x[i+1]-x[i]; dy[i] = sub(y[i+1],y[i]); }
    if(typeof k1 === "string" || typeof kn === "string") { 
        k1 = kn = "periodic";
    }
    // Build sparse tridiagonal system
    var T = [[],[],[]];
    switch(typeof k1) {
    case "undefined":
        b[0] = mul(3/(dx[0]*dx[0]),dy[0]);
        T[0].push(0,0);
        T[1].push(0,1);
        T[2].push(2/dx[0],1/dx[0]);
        break;
    case "string":
        b[0] = add(mul(3/(dx[n-2]*dx[n-2]),dy[n-2]),mul(3/(dx[0]*dx[0]),dy[0]));
        T[0].push(0,0,0);
        T[1].push(n-2,0,1);
        T[2].push(1/dx[n-2],2/dx[n-2]+2/dx[0],1/dx[0]);
        break;
    default:
        b[0] = k1;
        T[0].push(0);
        T[1].push(0);
        T[2].push(1);
        break;
    }
    for(i=1;i<n-1;i++) {
        b[i] = add(mul(3/(dx[i-1]*dx[i-1]),dy[i-1]),mul(3/(dx[i]*dx[i]),dy[i]));
        T[0].push(i,i,i);
        T[1].push(i-1,i,i+1);
        T[2].push(1/dx[i-1],2/dx[i-1]+2/dx[i],1/dx[i]);
    }
    switch(typeof kn) {
    case "undefined":
        b[n-1] = mul(3/(dx[n-2]*dx[n-2]),dy[n-2]);
        T[0].push(n-1,n-1);
        T[1].push(n-2,n-1);
        T[2].push(1/dx[n-2],2/dx[n-2]);
        break;
    case "string":
        T[1][T[1].length-1] = 0;
        break;
    default:
        b[n-1] = kn;
        T[0].push(n-1);
        T[1].push(n-1);
        T[2].push(1);
        break;
    }
    if(typeof b[0] !== "number") b = numeric.transpose(b);
    else b = [b];
    var k = Array(b.length);
    if(typeof k1 === "string") {
        for(i=k.length-1;i!==-1;--i) {
            k[i] = numeric.ccsLUPSolve(numeric.ccsLUP(numeric.ccsScatter(T)),b[i]);
            k[i][n-1] = k[i][0];
        }
    } else {
        for(i=k.length-1;i!==-1;--i) {
            k[i] = numeric.cLUsolve(numeric.cLU(T),b[i]);
        }
    }
    if(typeof y[0] === "number") k = k[0];
    else k = numeric.transpose(k);
    return new numeric.Spline(x,y,y,k,k);
}

// 8. FFT
numeric.fftpow2 = function fftpow2(x,y) {
    var n = x.length;
    if(n === 1) return;
    var cos = Math.cos, sin = Math.sin, i,j;
    var xe = Array(n/2), ye = Array(n/2), xo = Array(n/2), yo = Array(n/2);
    j = n/2;
    for(i=n-1;i!==-1;--i) {
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    fftpow2(xe,ye);
    fftpow2(xo,yo);
    j = n/2;
    var t,k = (-6.2831853071795864769252867665590057683943387987502116419/n),ci,si;
    for(i=n-1;i!==-1;--i) {
        --j;
        if(j === -1) j = n/2-1;
        t = k*i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci*xo[j] - si*yo[j];
        y[i] = ye[j] + ci*yo[j] + si*xo[j];
    }
}
numeric._ifftpow2 = function _ifftpow2(x,y) {
    var n = x.length;
    if(n === 1) return;
    var cos = Math.cos, sin = Math.sin, i,j;
    var xe = Array(n/2), ye = Array(n/2), xo = Array(n/2), yo = Array(n/2);
    j = n/2;
    for(i=n-1;i!==-1;--i) {
        --j;
        xo[j] = x[i];
        yo[j] = y[i];
        --i;
        xe[j] = x[i];
        ye[j] = y[i];
    }
    _ifftpow2(xe,ye);
    _ifftpow2(xo,yo);
    j = n/2;
    var t,k = (6.2831853071795864769252867665590057683943387987502116419/n),ci,si;
    for(i=n-1;i!==-1;--i) {
        --j;
        if(j === -1) j = n/2-1;
        t = k*i;
        ci = cos(t);
        si = sin(t);
        x[i] = xe[j] + ci*xo[j] - si*yo[j];
        y[i] = ye[j] + ci*yo[j] + si*xo[j];
    }
}
numeric.ifftpow2 = function ifftpow2(x,y) {
    numeric._ifftpow2(x,y);
    numeric.diveq(x,x.length);
    numeric.diveq(y,y.length);
}
numeric.convpow2 = function convpow2(ax,ay,bx,by) {
    numeric.fftpow2(ax,ay);
    numeric.fftpow2(bx,by);
    var i,n = ax.length,axi,bxi,ayi,byi;
    for(i=n-1;i!==-1;--i) {
        axi = ax[i]; ayi = ay[i]; bxi = bx[i]; byi = by[i];
        ax[i] = axi*bxi-ayi*byi;
        ay[i] = axi*byi+ayi*bxi;
    }
    numeric.ifftpow2(ax,ay);
}
numeric.T.prototype.fft = function fft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2),
        p = Math.ceil(log(2*n-1)/log2), m = Math.pow(2,p);
    var cx = numeric.rep([m],0), cy = numeric.rep([m],0), cos = Math.cos, sin = Math.sin;
    var k, c = (-3.141592653589793238462643383279502884197169399375105820/n),t;
    var a = numeric.rep([m],0), b = numeric.rep([m],0),nhalf = Math.floor(n/2);
    for(k=0;k<n;k++) a[k] = x[k];
    if(typeof y !== "undefined") for(k=0;k<n;k++) b[k] = y[k];
    cx[0] = 1;
    for(k=1;k<=m/2;k++) {
        t = c*k*k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m-k] = cos(t);
        cy[m-k] = sin(t)
    }
    var X = new numeric.T(a,b), Y = new numeric.T(cx,cy);
    X = X.mul(Y);
    numeric.convpow2(X.x,X.y,numeric.clone(Y.x),numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X;
}
numeric.T.prototype.ifft = function ifft() {
    var x = this.x, y = this.y;
    var n = x.length, log = Math.log, log2 = log(2),
        p = Math.ceil(log(2*n-1)/log2), m = Math.pow(2,p);
    var cx = numeric.rep([m],0), cy = numeric.rep([m],0), cos = Math.cos, sin = Math.sin;
    var k, c = (3.141592653589793238462643383279502884197169399375105820/n),t;
    var a = numeric.rep([m],0), b = numeric.rep([m],0),nhalf = Math.floor(n/2);
    for(k=0;k<n;k++) a[k] = x[k];
    if(typeof y !== "undefined") for(k=0;k<n;k++) b[k] = y[k];
    cx[0] = 1;
    for(k=1;k<=m/2;k++) {
        t = c*k*k;
        cx[k] = cos(t);
        cy[k] = sin(t);
        cx[m-k] = cos(t);
        cy[m-k] = sin(t)
    }
    var X = new numeric.T(a,b), Y = new numeric.T(cx,cy);
    X = X.mul(Y);
    numeric.convpow2(X.x,X.y,numeric.clone(Y.x),numeric.neg(Y.y));
    X = X.mul(Y);
    X.x.length = n;
    X.y.length = n;
    return X.div(n);
}

//9. Unconstrained optimization
numeric.gradient = function gradient(f,x) {
    var n = x.length;
    var f0 = f(x);
    if(isNaN(f0)) throw new Error('gradient: f(x) is a NaN!');
    var max = Math.max;
    var i,x0 = numeric.clone(x),f1,f2, J = Array(n);
    var div = numeric.div, sub = numeric.sub,errest,roundoff,max = Math.max,eps = 1e-3,abs = Math.abs, min = Math.min;
    var t0,t1,t2,it=0,d1,d2,N;
    for(i=0;i<n;i++) {
        var h = max(1e-6*f0,1e-8);
        while(1) {
            ++it;
            if(it>20) { throw new Error("Numerical gradient fails"); }
            x0[i] = x[i]+h;
            f1 = f(x0);
            x0[i] = x[i]-h;
            f2 = f(x0);
            x0[i] = x[i];
            if(isNaN(f1) || isNaN(f2)) { h/=16; continue; }
            J[i] = (f1-f2)/(2*h);
            t0 = x[i]-h;
            t1 = x[i];
            t2 = x[i]+h;
            d1 = (f1-f0)/h;
            d2 = (f0-f2)/h;
            N = max(abs(J[i]),abs(f0),abs(f1),abs(f2),abs(t0),abs(t1),abs(t2),1e-8);
            errest = min(max(abs(d1-J[i]),abs(d2-J[i]),abs(d1-d2))/N,h/N);
            if(errest>eps) { h/=16; }
            else break;
            }
    }
    return J;
}

numeric.uncmin = function uncmin(f,x0,tol,gradient,maxit,callback,options) {
    var grad = numeric.gradient;
    if(typeof options === "undefined") { options = {}; }
    if(typeof tol === "undefined") { tol = 1e-8; }
    if(typeof gradient === "undefined") { gradient = function(x) { return grad(f,x); }; }
    if(typeof maxit === "undefined") maxit = 1000;
    x0 = numeric.clone(x0);
    var n = x0.length;
    var f0 = f(x0),f1,df0;
    if(isNaN(f0)) throw new Error('uncmin: f(x0) is a NaN!');
    var max = Math.max, norm2 = numeric.norm2;
    tol = max(tol,numeric.epsilon);
    var step,g0,g1,H1 = options.Hinv || numeric.identity(n);
    var dot = numeric.dot, inv = numeric.inv, sub = numeric.sub, add = numeric.add, ten = numeric.tensor, div = numeric.div, mul = numeric.mul;
    var all = numeric.all, isfinite = numeric.isFinite, neg = numeric.neg;
    var it=0,i,s,x1,y,Hy,Hs,ys,i0,t,nstep,t1,t2;
    var msg = "";
    g0 = gradient(x0);
    while(it<maxit) {
        if(typeof callback === "function") { if(callback(it,x0,f0,g0,H1)) { msg = "Callback returned true"; break; } }
        if(!all(isfinite(g0))) { msg = "Gradient has Infinity or NaN"; break; }
        step = neg(dot(H1,g0));
        if(!all(isfinite(step))) { msg = "Search direction has Infinity or NaN"; break; }
        nstep = norm2(step);
        if(nstep < tol) { msg="Newton step smaller than tol"; break; }
        t = 1;
        df0 = dot(g0,step);
        // line search
        x1 = x0;
        while(it < maxit) {
            if(t*nstep < tol) { break; }
            s = mul(step,t);
            x1 = add(x0,s);
            f1 = f(x1);
            if(f1-f0 >= 0.1*t*df0 || isNaN(f1)) {
                t *= 0.5;
                ++it;
                continue;
            }
            break;
        }
        if(t*nstep < tol) { msg = "Line search step size smaller than tol"; break; }
        if(it === maxit) { msg = "maxit reached during line search"; break; }
        g1 = gradient(x1);
        y = sub(g1,g0);
        ys = dot(y,s);
        Hy = dot(H1,y);
        H1 = sub(add(H1,
                mul(
                        (ys+dot(y,Hy))/(ys*ys),
                        ten(s,s)    )),
                div(add(ten(Hy,s),ten(s,Hy)),ys));
        x0 = x1;
        f0 = f1;
        g0 = g1;
        ++it;
    }
    return {solution: x0, f: f0, gradient: g0, invHessian: H1, iterations:it, message: msg};
}

// 10. Ode solver (Dormand-Prince)
numeric.Dopri = function Dopri(x,y,f,ymid,iterations,msg,events) {
    this.x = x;
    this.y = y;
    this.f = f;
    this.ymid = ymid;
    this.iterations = iterations;
    this.events = events;
    this.message = msg;
}
numeric.Dopri.prototype._at = function _at(xi,j) {
    function sqr(x) { return x*x; }
    var sol = this;
    var xs = sol.x;
    var ys = sol.y;
    var k1 = sol.f;
    var ymid = sol.ymid;
    var n = xs.length;
    var x0,x1,xh,y0,y1,yh,xi;
    var floor = Math.floor,h;
    var c = 0.5;
    var add = numeric.add, mul = numeric.mul,sub = numeric.sub, p,q,w;
    x0 = xs[j];
    x1 = xs[j+1];
    y0 = ys[j];
    y1 = ys[j+1];
    h  = x1-x0;
    xh = x0+c*h;
    yh = ymid[j];
    p = sub(k1[j  ],mul(y0,1/(x0-xh)+2/(x0-x1)));
    q = sub(k1[j+1],mul(y1,1/(x1-xh)+2/(x1-x0)));
    w = [sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
         sqr(xi - x0) * sqr(xi - x1) / sqr(x0 - xh) / sqr(x1 - xh),
         sqr(xi - x0) * (xi - xh) / sqr(x1 - x0) / (x1 - xh),
         (xi - x0) * sqr(xi - x1) * (xi - xh) / sqr(x0-x1) / (x0 - xh),
         (xi - x1) * sqr(xi - x0) * (xi - xh) / sqr(x0-x1) / (x1 - xh)];
    return add(add(add(add(mul(y0,w[0]),
                           mul(yh,w[1])),
                           mul(y1,w[2])),
                           mul( p,w[3])),
                           mul( q,w[4]));
}
numeric.Dopri.prototype.at = function at(x) {
    var i,j,k,floor = Math.floor;
    if(typeof x !== "number") {
        var n = x.length, ret = Array(n);
        for(i=n-1;i!==-1;--i) {
            ret[i] = this.at(x[i]);
        }
        return ret;
    }
    var x0 = this.x;
    i = 0; j = x0.length-1;
    while(j-i>1) {
        k = floor(0.5*(i+j));
        if(x0[k] <= x) i = k;
        else j = k;
    }
    return this._at(x,i);
}

numeric.dopri = function dopri(x0,x1,y0,f,tol,maxit,event) {
    if(typeof tol === "undefined") { tol = 1e-6; }
    if(typeof maxit === "undefined") { maxit = 1000; }
    var xs = [x0], ys = [y0], k1 = [f(x0,y0)], k2,k3,k4,k5,k6,k7, ymid = [];
    var A2 = 1/5;
    var A3 = [3/40,9/40];
    var A4 = [44/45,-56/15,32/9];
    var A5 = [19372/6561,-25360/2187,64448/6561,-212/729];
    var A6 = [9017/3168,-355/33,46732/5247,49/176,-5103/18656];
    var b = [35/384,0,500/1113,125/192,-2187/6784,11/84];
    var bm = [0.5*6025192743/30085553152,
              0,
              0.5*51252292925/65400821598,
              0.5*-2691868925/45128329728,
              0.5*187940372067/1594534317056,
              0.5*-1776094331/19743644256,
              0.5*11237099/235043384];
    var c = [1/5,3/10,4/5,8/9,1,1];
    var e = [-71/57600,0,71/16695,-71/1920,17253/339200,-22/525,1/40];
    var i = 0,er,j;
    var h = (x1-x0)/10;
    var it = 0;
    var add = numeric.add, mul = numeric.mul, y1,erinf;
    var max = Math.max, min = Math.min, abs = Math.abs, norminf = numeric.norminf,pow = Math.pow;
    var any = numeric.any, lt = numeric.lt, and = numeric.and, sub = numeric.sub;
    var e0, e1, ev;
    var ret = new numeric.Dopri(xs,ys,k1,ymid,-1,"");
    if(typeof event === "function") e0 = event(x0,y0);
    while(x0<x1 && it<maxit) {
        ++it;
        if(x0+h>x1) h = x1-x0;
        k2 = f(x0+c[0]*h,                add(y0,mul(   A2*h,k1[i])));
        k3 = f(x0+c[1]*h,            add(add(y0,mul(A3[0]*h,k1[i])),mul(A3[1]*h,k2)));
        k4 = f(x0+c[2]*h,        add(add(add(y0,mul(A4[0]*h,k1[i])),mul(A4[1]*h,k2)),mul(A4[2]*h,k3)));
        k5 = f(x0+c[3]*h,    add(add(add(add(y0,mul(A5[0]*h,k1[i])),mul(A5[1]*h,k2)),mul(A5[2]*h,k3)),mul(A5[3]*h,k4)));
        k6 = f(x0+c[4]*h,add(add(add(add(add(y0,mul(A6[0]*h,k1[i])),mul(A6[1]*h,k2)),mul(A6[2]*h,k3)),mul(A6[3]*h,k4)),mul(A6[4]*h,k5)));
        y1 = add(add(add(add(add(y0,mul(k1[i],h*b[0])),mul(k3,h*b[2])),mul(k4,h*b[3])),mul(k5,h*b[4])),mul(k6,h*b[5]));
        k7 = f(x0+h,y1);
        er = add(add(add(add(add(mul(k1[i],h*e[0]),mul(k3,h*e[2])),mul(k4,h*e[3])),mul(k5,h*e[4])),mul(k6,h*e[5])),mul(k7,h*e[6]));
        if(typeof er === "number") erinf = abs(er);
        else erinf = norminf(er);
        if(erinf > tol) { // reject
            h = 0.2*h*pow(tol/erinf,0.25);
            if(x0+h === x0) {
                ret.msg = "Step size became too small";
                break;
            }
            continue;
        }
        ymid[i] = add(add(add(add(add(add(y0,
                mul(k1[i],h*bm[0])),
                mul(k3   ,h*bm[2])),
                mul(k4   ,h*bm[3])),
                mul(k5   ,h*bm[4])),
                mul(k6   ,h*bm[5])),
                mul(k7   ,h*bm[6]));
        ++i;
        xs[i] = x0+h;
        ys[i] = y1;
        k1[i] = k7;
        if(typeof event === "function") {
            var yi,xl = x0,xr = x0+0.5*h,xi;
            e1 = event(xr,ymid[i-1]);
            ev = and(lt(e0,0),lt(0,e1));
            if(!any(ev)) { xl = xr; xr = x0+h; e0 = e1; e1 = event(xr,y1); ev = and(lt(e0,0),lt(0,e1)); }
            if(any(ev)) {
                var xc, yc, en,ei;
                var side=0, sl = 1.0, sr = 1.0;
                while(1) {
                    if(typeof e0 === "number") xi = (sr*e1*xl-sl*e0*xr)/(sr*e1-sl*e0);
                    else {
                        xi = xr;
                        for(j=e0.length-1;j!==-1;--j) {
                            if(e0[j]<0 && e1[j]>0) xi = min(xi,(sr*e1[j]*xl-sl*e0[j]*xr)/(sr*e1[j]-sl*e0[j]));
                        }
                    }
                    if(xi <= xl || xi >= xr) break;
                    yi = ret._at(xi, i-1);
                    ei = event(xi,yi);
                    en = and(lt(e0,0),lt(0,ei));
                    if(any(en)) {
                        xr = xi;
                        e1 = ei;
                        ev = en;
                        sr = 1.0;
                        if(side === -1) sl *= 0.5;
                        else sl = 1.0;
                        side = -1;
                    } else {
                        xl = xi;
                        e0 = ei;
                        sl = 1.0;
                        if(side === 1) sr *= 0.5;
                        else sr = 1.0;
                        side = 1;
                    }
                }
                y1 = ret._at(0.5*(x0+xi),i-1);
                ret.f[i] = f(xi,yi);
                ret.x[i] = xi;
                ret.y[i] = yi;
                ret.ymid[i-1] = y1;
                ret.events = ev;
                ret.iterations = it;
                return ret;
            }
        }
        x0 += h;
        y0 = y1;
        e0 = e1;
        h = min(0.8*h*pow(tol/erinf,0.25),4*h);
    }
    ret.iterations = it;
    return ret;
}

// 11. Ax = b
numeric.LU = function(A, fast) {
  fast = fast || false;

  var abs = Math.abs;
  var i, j, k, absAjk, Akk, Ak, Pk, Ai;
  var max;
  var n = A.length, n1 = n-1;
  var P = new Array(n);
  if(!fast) A = numeric.clone(A);

  for (k = 0; k < n; ++k) {
    Pk = k;
    Ak = A[k];
    max = abs(Ak[k]);
    for (j = k + 1; j < n; ++j) {
      absAjk = abs(A[j][k]);
      if (max < absAjk) {
        max = absAjk;
        Pk = j;
      }
    }
    P[k] = Pk;

    if (Pk != k) {
      A[k] = A[Pk];
      A[Pk] = Ak;
      Ak = A[k];
    }

    Akk = Ak[k];

    for (i = k + 1; i < n; ++i) {
      A[i][k] /= Akk;
    }

    for (i = k + 1; i < n; ++i) {
      Ai = A[i];
      for (j = k + 1; j < n1; ++j) {
        Ai[j] -= Ai[k] * Ak[j];
        ++j;
        Ai[j] -= Ai[k] * Ak[j];
      }
      if(j===n1) Ai[j] -= Ai[k] * Ak[j];
    }
  }

  return {
    LU: A,
    P:  P
  };
}

numeric.LUsolve = function LUsolve(LUP, b) {
  var i, j;
  var LU = LUP.LU;
  var n   = LU.length;
  var x = numeric.clone(b);
  var P   = LUP.P;
  var Pi, LUi, LUii, tmp;

  for (i=n-1;i!==-1;--i) x[i] = b[i];
  for (i = 0; i < n; ++i) {
    Pi = P[i];
    if (P[i] !== i) {
      tmp = x[i];
      x[i] = x[Pi];
      x[Pi] = tmp;
    }

    LUi = LU[i];
    for (j = 0; j < i; ++j) {
      x[i] -= x[j] * LUi[j];
    }
  }

  for (i = n - 1; i >= 0; --i) {
    LUi = LU[i];
    for (j = i + 1; j < n; ++j) {
      x[i] -= x[j] * LUi[j];
    }

    x[i] /= LUi[i];
  }

  return x;
}

numeric.solve = function solve(A,b,fast) { return numeric.LUsolve(numeric.LU(A,fast), b); }

// 12. Linear programming
numeric.echelonize = function echelonize(A) {
    var s = numeric.dim(A), m = s[0], n = s[1];
    var I = numeric.identity(m);
    var P = Array(m);
    var i,j,k,l,Ai,Ii,Z,a;
    var abs = Math.abs;
    var diveq = numeric.diveq;
    A = numeric.clone(A);
    for(i=0;i<m;++i) {
        k = 0;
        Ai = A[i];
        Ii = I[i];
        for(j=1;j<n;++j) if(abs(Ai[k])<abs(Ai[j])) k=j;
        P[i] = k;
        diveq(Ii,Ai[k]);
        diveq(Ai,Ai[k]);
        for(j=0;j<m;++j) if(j!==i) {
            Z = A[j]; a = Z[k];
            for(l=n-1;l!==-1;--l) Z[l] -= Ai[l]*a;
            Z = I[j];
            for(l=m-1;l!==-1;--l) Z[l] -= Ii[l]*a;
        }
    }
    return {I:I, A:A, P:P};
}

numeric.__solveLP = function __solveLP(c,A,b,tol,maxit,x,flag) {
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var m = c.length, n = b.length,y;
    var unbounded = false, cb,i0=0;
    var alpha = 1.0;
    var f0,df0,AT = numeric.transpose(A), svd = numeric.svd,transpose = numeric.transpose,leq = numeric.leq, sqrt = Math.sqrt, abs = Math.abs;
    var muleq = numeric.muleq;
    var norm = numeric.norminf, any = numeric.any,min = Math.min;
    var all = numeric.all, gt = numeric.gt;
    var p = Array(m), A0 = Array(n),e=numeric.rep([n],1), H;
    var solve = numeric.solve, z = sub(b,dot(A,x)),count;
    var dotcc = dot(c,c);
    var g;
    for(count=i0;count<maxit;++count) {
        var i,j,d;
        for(i=n-1;i!==-1;--i) A0[i] = div(A[i],z[i]);
        var A1 = transpose(A0);
        for(i=m-1;i!==-1;--i) p[i] = (/*x[i]+*/sum(A1[i]));
        alpha = 0.25*abs(dotcc/dot(c,p));
        var a1 = 100*sqrt(dotcc/dot(p,p));
        if(!isFinite(alpha) || alpha>a1) alpha = a1;
        g = add(c,mul(alpha,p));
        H = dot(A1,A0);
        for(i=m-1;i!==-1;--i) H[i][i] += 1;
        d = solve(H,div(g,alpha),true);
        var t0 = div(z,dot(A,d));
        var t = 1.0;
        for(i=n-1;i!==-1;--i) if(t0[i]<0) t = min(t,-0.999*t0[i]);
        y = sub(x,mul(d,t));
        z = sub(b,dot(A,y));
        if(!all(gt(z,0))) return { solution: x, message: "", iterations: count };
        x = y;
        if(alpha<tol) return { solution: y, message: "", iterations: count };
        if(flag) {
            var s = dot(c,g), Ag = dot(A,g);
            unbounded = true;
            for(i=n-1;i!==-1;--i) if(s*Ag[i]<0) { unbounded = false; break; }
        } else {
            if(x[m-1]>=0) unbounded = false;
            else unbounded = true;
        }
        if(unbounded) return { solution: y, message: "Unbounded", iterations: count };
    }
    return { solution: x, message: "maximum iteration count exceeded", iterations:count };
}

numeric._solveLP = function _solveLP(c,A,b,tol,maxit) {
    var m = c.length, n = b.length,y;
    var sum = numeric.sum, log = numeric.log, mul = numeric.mul, sub = numeric.sub, dot = numeric.dot, div = numeric.div, add = numeric.add;
    var c0 = numeric.rep([m],0).concat([1]);
    var J = numeric.rep([n,1],-1);
    var A0 = numeric.blockMatrix([[A                   ,   J  ]]);
    var b0 = b;
    var y = numeric.rep([m],0).concat(Math.max(0,numeric.sup(numeric.neg(b)))+1);
    var x0 = numeric.__solveLP(c0,A0,b0,tol,maxit,y,false);
    var x = numeric.clone(x0.solution);
    x.length = m;
    var foo = numeric.inf(sub(b,dot(A,x)));
    if(foo<0) { return { solution: NaN, message: "Infeasible", iterations: x0.iterations }; }
    var ret = numeric.__solveLP(c, A, b, tol, maxit-x0.iterations, x, true);
    ret.iterations += x0.iterations;
    return ret;
};

numeric.solveLP = function solveLP(c,A,b,Aeq,beq,tol,maxit) {
    if(typeof maxit === "undefined") maxit = 1000;
    if(typeof tol === "undefined") tol = numeric.epsilon;
    if(typeof Aeq === "undefined") return numeric._solveLP(c,A,b,tol,maxit);
    var m = Aeq.length, n = Aeq[0].length, o = A.length;
    var B = numeric.echelonize(Aeq);
    var flags = numeric.rep([n],0);
    var P = B.P;
    var Q = [];
    var i;
    for(i=P.length-1;i!==-1;--i) flags[P[i]] = 1;
    for(i=n-1;i!==-1;--i) if(flags[i]===0) Q.push(i);
    var g = numeric.getRange;
    var I = numeric.linspace(0,m-1), J = numeric.linspace(0,o-1);
    var Aeq2 = g(Aeq,I,Q), A1 = g(A,J,P), A2 = g(A,J,Q), dot = numeric.dot, sub = numeric.sub;
    var A3 = dot(A1,B.I);
    var A4 = sub(A2,dot(A3,Aeq2)), b4 = sub(b,dot(A3,beq));
    var c1 = Array(P.length), c2 = Array(Q.length);
    for(i=P.length-1;i!==-1;--i) c1[i] = c[P[i]];
    for(i=Q.length-1;i!==-1;--i) c2[i] = c[Q[i]];
    var c4 = sub(c2,dot(c1,dot(B.I,Aeq2)));
    var S = numeric._solveLP(c4,A4,b4,tol,maxit);
    var x2 = S.solution;
    if(x2!==x2) return S;
    var x1 = dot(B.I,sub(beq,dot(Aeq2,x2)));
    var x = Array(c.length);
    for(i=P.length-1;i!==-1;--i) x[P[i]] = x1[i];
    for(i=Q.length-1;i!==-1;--i) x[Q[i]] = x2[i];
    return { solution: x, message:S.message, iterations: S.iterations };
}

numeric.MPStoLP = function MPStoLP(MPS) {
    if(MPS instanceof String) { MPS.split('\n'); }
    var state = 0;
    var states = ['Initial state','NAME','ROWS','COLUMNS','RHS','BOUNDS','ENDATA'];
    var n = MPS.length;
    var i,j,z,N=0,rows = {}, sign = [], rl = 0, vars = {}, nv = 0;
    var name;
    var c = [], A = [], b = [];
    function err(e) { throw new Error('MPStoLP: '+e+'\nLine '+i+': '+MPS[i]+'\nCurrent state: '+states[state]+'\n'); }
    for(i=0;i<n;++i) {
        z = MPS[i];
        var w0 = z.match(/\S*/g);
        var w = [];
        for(j=0;j<w0.length;++j) if(w0[j]!=="") w.push(w0[j]);
        if(w.length === 0) continue;
        for(j=0;j<states.length;++j) if(z.substr(0,states[j].length) === states[j]) break;
        if(j<states.length) {
            state = j;
            if(j===1) { name = w[1]; }
            if(j===6) return { name:name, c:c, A:numeric.transpose(A), b:b, rows:rows, vars:vars };
            continue;
        }
        switch(state) {
        case 0: case 1: err('Unexpected line');
        case 2: 
            switch(w[0]) {
            case 'N': if(N===0) N = w[1]; else err('Two or more N rows'); break;
            case 'L': rows[w[1]] = rl; sign[rl] = 1; b[rl] = 0; ++rl; break;
            case 'G': rows[w[1]] = rl; sign[rl] = -1;b[rl] = 0; ++rl; break;
            case 'E': rows[w[1]] = rl; sign[rl] = 0;b[rl] = 0; ++rl; break;
            default: err('Parse error '+numeric.prettyPrint(w));
            }
            break;
        case 3:
            if(!vars.hasOwnProperty(w[0])) { vars[w[0]] = nv; c[nv] = 0; A[nv] = numeric.rep([rl],0); ++nv; }
            var p = vars[w[0]];
            for(j=1;j<w.length;j+=2) {
                if(w[j] === N) { c[p] = parseFloat(w[j+1]); continue; }
                var q = rows[w[j]];
                A[p][q] = (sign[q]<0?-1:1)*parseFloat(w[j+1]);
            }
            break;
        case 4:
            for(j=1;j<w.length;j+=2) b[rows[w[j]]] = (sign[rows[w[j]]]<0?-1:1)*parseFloat(w[j+1]);
            break;
        case 5: /*FIXME*/ break;
        case 6: err('Internal error');
        }
    }
    err('Reached end of file without ENDATA');
}
// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */

// Patched by Seb so that seedrandom.js does not pollute the Math object.
// My tests suggest that doing Math.trouble = 1 makes Math lookups about 5%
// slower.
numeric.seedrandom = { pow:Math.pow, random:Math.random };

(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
}(
  [],   // pool: entropy pool starts empty
  numeric.seedrandom, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
  ));
/* This file is a slightly modified version of quadprog.js from Alberto Santini.
 * It has been slightly modified by SÃ©bastien Loisel to make sure that it handles
 * 0-based Arrays instead of 1-based Arrays.
 * License is in resources/LICENSE.quadprog */
(function(exports) {

function base0to1(A) {
    if(typeof A !== "object") { return A; }
    var ret = [], i,n=A.length;
    for(i=0;i<n;i++) ret[i+1] = base0to1(A[i]);
    return ret;
}
function base1to0(A) {
    if(typeof A !== "object") { return A; }
    var ret = [], i,n=A.length;
    for(i=1;i<n;i++) ret[i-1] = base1to0(A[i]);
    return ret;
}

function dpori(a, lda, n) {
    var i, j, k, kp1, t;

    for (k = 1; k <= n; k = k + 1) {
        a[k][k] = 1 / a[k][k];
        t = -a[k][k];
        //~ dscal(k - 1, t, a[1][k], 1);
        for (i = 1; i < k; i = i + 1) {
            a[i][k] = t * a[i][k];
        }

        kp1 = k + 1;
        if (n < kp1) {
            break;
        }
        for (j = kp1; j <= n; j = j + 1) {
            t = a[k][j];
            a[k][j] = 0;
            //~ daxpy(k, t, a[1][k], 1, a[1][j], 1);
            for (i = 1; i <= k; i = i + 1) {
                a[i][j] = a[i][j] + (t * a[i][k]);
            }
        }
    }

}

function dposl(a, lda, n, b) {
    var i, k, kb, t;

    for (k = 1; k <= n; k = k + 1) {
        //~ t = ddot(k - 1, a[1][k], 1, b[1], 1);
        t = 0;
        for (i = 1; i < k; i = i + 1) {
            t = t + (a[i][k] * b[i]);
        }

        b[k] = (b[k] - t) / a[k][k];
    }

    for (kb = 1; kb <= n; kb = kb + 1) {
        k = n + 1 - kb;
        b[k] = b[k] / a[k][k];
        t = -b[k];
        //~ daxpy(k - 1, t, a[1][k], 1, b[1], 1);
        for (i = 1; i < k; i = i + 1) {
            b[i] = b[i] + (t * a[i][k]);
        }
    }
}

function dpofa(a, lda, n, info) {
    var i, j, jm1, k, t, s;

    for (j = 1; j <= n; j = j + 1) {
        info[1] = j;
        s = 0;
        jm1 = j - 1;
        if (jm1 < 1) {
            s = a[j][j] - s;
            if (s <= 0) {
                break;
            }
            a[j][j] = Math.sqrt(s);
        } else {
            for (k = 1; k <= jm1; k = k + 1) {
                //~ t = a[k][j] - ddot(k - 1, a[1][k], 1, a[1][j], 1);
                t = a[k][j];
                for (i = 1; i < k; i = i + 1) {
                    t = t - (a[i][j] * a[i][k]);
                }
                t = t / a[k][k];
                a[k][j] = t;
                s = s + t * t;
            }
            s = a[j][j] - s;
            if (s <= 0) {
                break;
            }
            a[j][j] = Math.sqrt(s);
        }
        info[1] = 0;
    }
}

function qpgen2(dmat, dvec, fddmat, n, sol, crval, amat,
    bvec, fdamat, q, meq, iact, nact, iter, work, ierr) {

    var i, j, l, l1, info, it1, iwzv, iwrv, iwrm, iwsv, iwuv, nvl, r, iwnbv,
        temp, sum, t1, tt, gc, gs, nu,
        t1inf, t2min,
        vsmall, tmpa, tmpb,
        go;

    r = Math.min(n, q);
    l = 2 * n + (r * (r + 5)) / 2 + 2 * q + 1;

    vsmall = 1.0e-60;
    do {
        vsmall = vsmall + vsmall;
        tmpa = 1 + 0.1 * vsmall;
        tmpb = 1 + 0.2 * vsmall;
    } while (tmpa <= 1 || tmpb <= 1);

    for (i = 1; i <= n; i = i + 1) {
        work[i] = dvec[i];
    }
    for (i = n + 1; i <= l; i = i + 1) {
        work[i] = 0;
    }
    for (i = 1; i <= q; i = i + 1) {
        iact[i] = 0;
    }

    info = [];

    if (ierr[1] === 0) {
        dpofa(dmat, fddmat, n, info);
        if (info[1] !== 0) {
            ierr[1] = 2;
            return;
        }
        dposl(dmat, fddmat, n, dvec);
        dpori(dmat, fddmat, n);
    } else {
        for (j = 1; j <= n; j = j + 1) {
            sol[j] = 0;
            for (i = 1; i <= j; i = i + 1) {
                sol[j] = sol[j] + dmat[i][j] * dvec[i];
            }
        }
        for (j = 1; j <= n; j = j + 1) {
            dvec[j] = 0;
            for (i = j; i <= n; i = i + 1) {
                dvec[j] = dvec[j] + dmat[j][i] * sol[i];
            }
        }
    }

    crval[1] = 0;
    for (j = 1; j <= n; j = j + 1) {
        sol[j] = dvec[j];
        crval[1] = crval[1] + work[j] * sol[j];
        work[j] = 0;
        for (i = j + 1; i <= n; i = i + 1) {
            dmat[i][j] = 0;
        }
    }
    crval[1] = -crval[1] / 2;
    ierr[1] = 0;

    iwzv = n;
    iwrv = iwzv + n;
    iwuv = iwrv + r;
    iwrm = iwuv + r + 1;
    iwsv = iwrm + (r * (r + 1)) / 2;
    iwnbv = iwsv + q;

    for (i = 1; i <= q; i = i + 1) {
        sum = 0;
        for (j = 1; j <= n; j = j + 1) {
            sum = sum + amat[j][i] * amat[j][i];
        }
        work[iwnbv + i] = Math.sqrt(sum);
    }
    nact = 0;
    iter[1] = 0;
    iter[2] = 0;

    function fn_goto_50() {
        iter[1] = iter[1] + 1;

        l = iwsv;
        for (i = 1; i <= q; i = i + 1) {
            l = l + 1;
            sum = -bvec[i];
            for (j = 1; j <= n; j = j + 1) {
                sum = sum + amat[j][i] * sol[j];
            }
            if (Math.abs(sum) < vsmall) {
                sum = 0;
            }
            if (i > meq) {
                work[l] = sum;
            } else {
                work[l] = -Math.abs(sum);
                if (sum > 0) {
                    for (j = 1; j <= n; j = j + 1) {
                        amat[j][i] = -amat[j][i];
                    }
                    bvec[i] = -bvec[i];
                }
            }
        }

        for (i = 1; i <= nact; i = i + 1) {
            work[iwsv + iact[i]] = 0;
        }

        nvl = 0;
        temp = 0;
        for (i = 1; i <= q; i = i + 1) {
            if (work[iwsv + i] < temp * work[iwnbv + i]) {
                nvl = i;
                temp = work[iwsv + i] / work[iwnbv + i];
            }
        }
        if (nvl === 0) {
            return 999;
        }

        return 0;
    }

    function fn_goto_55() {
        for (i = 1; i <= n; i = i + 1) {
            sum = 0;
            for (j = 1; j <= n; j = j + 1) {
                sum = sum + dmat[j][i] * amat[j][nvl];
            }
            work[i] = sum;
        }

        l1 = iwzv;
        for (i = 1; i <= n; i = i + 1) {
            work[l1 + i] = 0;
        }
        for (j = nact + 1; j <= n; j = j + 1) {
            for (i = 1; i <= n; i = i + 1) {
                work[l1 + i] = work[l1 + i] + dmat[i][j] * work[j];
            }
        }

        t1inf = true;
        for (i = nact; i >= 1; i = i - 1) {
            sum = work[i];
            l = iwrm + (i * (i + 3)) / 2;
            l1 = l - i;
            for (j = i + 1; j <= nact; j = j + 1) {
                sum = sum - work[l] * work[iwrv + j];
                l = l + j;
            }
            sum = sum / work[l1];
            work[iwrv + i] = sum;
            if (iact[i] < meq) {
                // continue;
                break;
            }
            if (sum < 0) {
                // continue;
                break;
            }
            t1inf = false;
            it1 = i;
        }

        if (!t1inf) {
            t1 = work[iwuv + it1] / work[iwrv + it1];
            for (i = 1; i <= nact; i = i + 1) {
                if (iact[i] < meq) {
                    // continue;
                    break;
                }
                if (work[iwrv + i] < 0) {
                    // continue;
                    break;
                }
                temp = work[iwuv + i] / work[iwrv + i];
                if (temp < t1) {
                    t1 = temp;
                    it1 = i;
                }
            }
        }

        sum = 0;
        for (i = iwzv + 1; i <= iwzv + n; i = i + 1) {
            sum = sum + work[i] * work[i];
        }
        if (Math.abs(sum) <= vsmall) {
            if (t1inf) {
                ierr[1] = 1;
                // GOTO 999
                return 999;
            } else {
                for (i = 1; i <= nact; i = i + 1) {
                    work[iwuv + i] = work[iwuv + i] - t1 * work[iwrv + i];
                }
                work[iwuv + nact + 1] = work[iwuv + nact + 1] + t1;
                // GOTO 700
                return 700;
            }
        } else {
            sum = 0;
            for (i = 1; i <= n; i = i + 1) {
                sum = sum + work[iwzv + i] * amat[i][nvl];
            }
            tt = -work[iwsv + nvl] / sum;
            t2min = true;
            if (!t1inf) {
                if (t1 < tt) {
                    tt = t1;
                    t2min = false;
                }
            }

            for (i = 1; i <= n; i = i + 1) {
                sol[i] = sol[i] + tt * work[iwzv + i];
                if (Math.abs(sol[i]) < vsmall) {
                    sol[i] = 0;
                }
            }

            crval[1] = crval[1] + tt * sum * (tt / 2 + work[iwuv + nact + 1]);
            for (i = 1; i <= nact; i = i + 1) {
                work[iwuv + i] = work[iwuv + i] - tt * work[iwrv + i];
            }
            work[iwuv + nact + 1] = work[iwuv + nact + 1] + tt;

            if (t2min) {
                nact = nact + 1;
                iact[nact] = nvl;

                l = iwrm + ((nact - 1) * nact) / 2 + 1;
                for (i = 1; i <= nact - 1; i = i + 1) {
                    work[l] = work[i];
                    l = l + 1;
                }

                if (nact === n) {
                    work[l] = work[n];
                } else {
                    for (i = n; i >= nact + 1; i = i - 1) {
                        if (work[i] === 0) {
                            // continue;
                            break;
                        }
                        gc = Math.max(Math.abs(work[i - 1]), Math.abs(work[i]));
                        gs = Math.min(Math.abs(work[i - 1]), Math.abs(work[i]));
                        if (work[i - 1] >= 0) {
                            temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                        } else {
                            temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
                        }
                        gc = work[i - 1] / temp;
                        gs = work[i] / temp;

                        if (gc === 1) {
                            // continue;
                            break;
                        }
                        if (gc === 0) {
                            work[i - 1] = gs * temp;
                            for (j = 1; j <= n; j = j + 1) {
                                temp = dmat[j][i - 1];
                                dmat[j][i - 1] = dmat[j][i];
                                dmat[j][i] = temp;
                            }
                        } else {
                            work[i - 1] = temp;
                            nu = gs / (1 + gc);
                            for (j = 1; j <= n; j = j + 1) {
                                temp = gc * dmat[j][i - 1] + gs * dmat[j][i];
                                dmat[j][i] = nu * (dmat[j][i - 1] + temp) - dmat[j][i];
                                dmat[j][i - 1] = temp;

                            }
                        }
                    }
                    work[l] = work[nact];
                }
            } else {
                sum = -bvec[nvl];
                for (j = 1; j <= n; j = j + 1) {
                    sum = sum + sol[j] * amat[j][nvl];
                }
                if (nvl > meq) {
                    work[iwsv + nvl] = sum;
                } else {
                    work[iwsv + nvl] = -Math.abs(sum);
                    if (sum > 0) {
                        for (j = 1; j <= n; j = j + 1) {
                            amat[j][nvl] = -amat[j][nvl];
                        }
                        bvec[nvl] = -bvec[nvl];
                    }
                }
                // GOTO 700
                return 700;
            }
        }

        return 0;
    }

    function fn_goto_797() {
        l = iwrm + (it1 * (it1 + 1)) / 2 + 1;
        l1 = l + it1;
        if (work[l1] === 0) {
            // GOTO 798
            return 798;
        }
        gc = Math.max(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
        gs = Math.min(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
        if (work[l1 - 1] >= 0) {
            temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
        } else {
            temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
        }
        gc = work[l1 - 1] / temp;
        gs = work[l1] / temp;

        if (gc === 1) {
            // GOTO 798
            return 798;
        }
        if (gc === 0) {
            for (i = it1 + 1; i <= nact; i = i + 1) {
                temp = work[l1 - 1];
                work[l1 - 1] = work[l1];
                work[l1] = temp;
                l1 = l1 + i;
            }
            for (i = 1; i <= n; i = i + 1) {
                temp = dmat[i][it1];
                dmat[i][it1] = dmat[i][it1 + 1];
                dmat[i][it1 + 1] = temp;
            }
        } else {
            nu = gs / (1 + gc);
            for (i = it1 + 1; i <= nact; i = i + 1) {
                temp = gc * work[l1 - 1] + gs * work[l1];
                work[l1] = nu * (work[l1 - 1] + temp) - work[l1];
                work[l1 - 1] = temp;
                l1 = l1 + i;
            }
            for (i = 1; i <= n; i = i + 1) {
                temp = gc * dmat[i][it1] + gs * dmat[i][it1 + 1];
                dmat[i][it1 + 1] = nu * (dmat[i][it1] + temp) - dmat[i][it1 + 1];
                dmat[i][it1] = temp;
            }
        }

        return 0;
    }

    function fn_goto_798() {
        l1 = l - it1;
        for (i = 1; i <= it1; i = i + 1) {
            work[l1] = work[l];
            l = l + 1;
            l1 = l1 + 1;
        }

        work[iwuv + it1] = work[iwuv + it1 + 1];
        iact[it1] = iact[it1 + 1];
        it1 = it1 + 1;
        if (it1 < nact) {
            // GOTO 797
            return 797;
        }

        return 0;
    }

    function fn_goto_799() {
        work[iwuv + nact] = work[iwuv + nact + 1];
        work[iwuv + nact + 1] = 0;
        iact[nact] = 0;
        nact = nact - 1;
        iter[2] = iter[2] + 1;

        return 0;
    }

    go = 0;
    while (true) {
        go = fn_goto_50();
        if (go === 999) {
            return;
        }
        while (true) {
            go = fn_goto_55();
            if (go === 0) {
                break;
            }
            if (go === 999) {
                return;
            }
            if (go === 700) {
                if (it1 === nact) {
                    fn_goto_799();
                } else {
                    while (true) {
                        fn_goto_797();
                        go = fn_goto_798();
                        if (go !== 797) {
                            break;
                        }
                    }
                    fn_goto_799();
                }
            }
        }
    }

}

function solveQP(Dmat, dvec, Amat, bvec, meq, factorized) {
    Dmat = base0to1(Dmat);
    dvec = base0to1(dvec);
    Amat = base0to1(Amat);
    var i, n, q,
        nact, r,
        crval = [], iact = [], sol = [], work = [], iter = [],
        message;

    meq = meq || 0;
    factorized = factorized ? base0to1(factorized) : [undefined, 0];
    bvec = bvec ? base0to1(bvec) : [];

    // In Fortran the array index starts from 1
    n = Dmat.length - 1;
    q = Amat[1].length - 1;

    if (!bvec) {
        for (i = 1; i <= q; i = i + 1) {
            bvec[i] = 0;
        }
    }
    for (i = 1; i <= q; i = i + 1) {
        iact[i] = 0;
    }
    nact = 0;
    r = Math.min(n, q);
    for (i = 1; i <= n; i = i + 1) {
        sol[i] = 0;
    }
    crval[1] = 0;
    for (i = 1; i <= (2 * n + (r * (r + 5)) / 2 + 2 * q + 1); i = i + 1) {
        work[i] = 0;
    }
    for (i = 1; i <= 2; i = i + 1) {
        iter[i] = 0;
    }

    qpgen2(Dmat, dvec, n, n, sol, crval, Amat,
        bvec, n, q, meq, iact, nact, iter, work, factorized);

    message = "";
    if (factorized[1] === 1) {
        message = "constraints are inconsistent, no solution!";
    }
    if (factorized[1] === 2) {
        message = "matrix D in quadratic function is not positive definite!";
    }

    return {
        solution: base1to0(sol),
        value: base1to0(crval),
        unconstrained_solution: base1to0(dvec),
        iterations: base1to0(iter),
        iact: base1to0(iact),
        message: message
    };
}
exports.solveQP = solveQP;
}(numeric));
/*
Shanti Rao sent me this routine by private email. I had to modify it
slightly to work on Arrays instead of using a Matrix object.
It is apparently translated from http://stitchpanorama.sourceforge.net/Python/svd.py
*/

numeric.svd= function svd(A) {
    var temp;
//Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
	var prec= numeric.epsilon; //Math.pow(2,-52) // assumes double prec
	var tolerance= 1.e-64/prec;
	var itmax= 50;
	var c=0;
	var i=0;
	var j=0;
	var k=0;
	var l=0;
	
	var u= numeric.clone(A);
	var m= u.length;
	
	var n= u[0].length;
	
	if (m < n) throw "Need more rows than columns"
	
	var e = new Array(n);
	var q = new Array(n);
	for (i=0; i<n; i++) e[i] = q[i] = 0.0;
	var v = numeric.rep([n,n],0);
//	v.zero();
	
 	function pythag(a,b)
 	{
		a = Math.abs(a)
		b = Math.abs(b)
		if (a > b)
			return a*Math.sqrt(1.0+(b*b/a/a))
		else if (b == 0.0) 
			return a
		return b*Math.sqrt(1.0+(a*a/b/b))
	}

	//Householder's reduction to bidiagonal form

	var f= 0.0;
	var g= 0.0;
	var h= 0.0;
	var x= 0.0;
	var y= 0.0;
	var z= 0.0;
	var s= 0.0;
	
	for (i=0; i < n; i++)
	{	
		e[i]= g;
		s= 0.0;
		l= i+1;
		for (j=i; j < m; j++) 
			s += (u[j][i]*u[j][i]);
		if (s <= tolerance)
			g= 0.0;
		else
		{	
			f= u[i][i];
			g= Math.sqrt(s);
			if (f >= 0.0) g= -g;
			h= f*g-s
			u[i][i]=f-g;
			for (j=l; j < n; j++)
			{
				s= 0.0
				for (k=i; k < m; k++) 
					s += u[k][i]*u[k][j]
				f= s/h
				for (k=i; k < m; k++) 
					u[k][j]+=f*u[k][i]
			}
		}
		q[i]= g
		s= 0.0
		for (j=l; j < n; j++) 
			s= s + u[i][j]*u[i][j]
		if (s <= tolerance)
			g= 0.0
		else
		{	
			f= u[i][i+1]
			g= Math.sqrt(s)
			if (f >= 0.0) g= -g
			h= f*g - s
			u[i][i+1] = f-g;
			for (j=l; j < n; j++) e[j]= u[i][j]/h
			for (j=l; j < m; j++)
			{	
				s=0.0
				for (k=l; k < n; k++) 
					s += (u[j][k]*u[i][k])
				for (k=l; k < n; k++) 
					u[j][k]+=s*e[k]
			}	
		}
		y= Math.abs(q[i])+Math.abs(e[i])
		if (y>x) 
			x=y
	}
	
	// accumulation of right hand gtransformations
	for (i=n-1; i != -1; i+= -1)
	{	
		if (g != 0.0)
		{
		 	h= g*u[i][i+1]
			for (j=l; j < n; j++) 
				v[j][i]=u[i][j]/h
			for (j=l; j < n; j++)
			{	
				s=0.0
				for (k=l; k < n; k++) 
					s += u[i][k]*v[k][j]
				for (k=l; k < n; k++) 
					v[k][j]+=(s*v[k][i])
			}	
		}
		for (j=l; j < n; j++)
		{
			v[i][j] = 0;
			v[j][i] = 0;
		}
		v[i][i] = 1;
		g= e[i]
		l= i
	}
	
	// accumulation of left hand transformations
	for (i=n-1; i != -1; i+= -1)
	{	
		l= i+1
		g= q[i]
		for (j=l; j < n; j++) 
			u[i][j] = 0;
		if (g != 0.0)
		{
			h= u[i][i]*g
			for (j=l; j < n; j++)
			{
				s=0.0
				for (k=l; k < m; k++) s += u[k][i]*u[k][j];
				f= s/h
				for (k=i; k < m; k++) u[k][j]+=f*u[k][i];
			}
			for (j=i; j < m; j++) u[j][i] = u[j][i]/g;
		}
		else
			for (j=i; j < m; j++) u[j][i] = 0;
		u[i][i] += 1;
	}
	
	// diagonalization of the bidiagonal form
	prec= prec*x
	for (k=n-1; k != -1; k+= -1)
	{
		for (var iteration=0; iteration < itmax; iteration++)
		{	// test f splitting
			var test_convergence = false
			for (l=k; l != -1; l+= -1)
			{	
				if (Math.abs(e[l]) <= prec)
				{	test_convergence= true
					break 
				}
				if (Math.abs(q[l-1]) <= prec)
					break 
			}
			if (!test_convergence)
			{	// cancellation of e[l] if l>0
				c= 0.0
				s= 1.0
				var l1= l-1
				for (i =l; i<k+1; i++)
				{	
					f= s*e[i]
					e[i]= c*e[i]
					if (Math.abs(f) <= prec)
						break
					g= q[i]
					h= pythag(f,g)
					q[i]= h
					c= g/h
					s= -f/h
					for (j=0; j < m; j++)
					{	
						y= u[j][l1]
						z= u[j][i]
						u[j][l1] =  y*c+(z*s)
						u[j][i] = -y*s+(z*c)
					} 
				}	
			}
			// test f convergence
			z= q[k]
			if (l== k)
			{	//convergence
				if (z<0.0)
				{	//q[k] is made non-negative
					q[k]= -z
					for (j=0; j < n; j++)
						v[j][k] = -v[j][k]
				}
				break  //break out of iteration loop and move on to next k value
			}
			if (iteration >= itmax-1)
				throw 'Error: no convergence.'
			// shift from bottom 2x2 minor
			x= q[l]
			y= q[k-1]
			g= e[k-1]
			h= e[k]
			f= ((y-z)*(y+z)+(g-h)*(g+h))/(2.0*h*y)
			g= pythag(f,1.0)
			if (f < 0.0)
				f= ((x-z)*(x+z)+h*(y/(f-g)-h))/x
			else
				f= ((x-z)*(x+z)+h*(y/(f+g)-h))/x
			// next QR transformation
			c= 1.0
			s= 1.0
			for (i=l+1; i< k+1; i++)
			{	
				g= e[i]
				y= q[i]
				h= s*g
				g= c*g
				z= pythag(f,h)
				e[i-1]= z
				c= f/z
				s= h/z
				f= x*c+g*s
				g= -x*s+g*c
				h= y*s
				y= y*c
				for (j=0; j < n; j++)
				{	
					x= v[j][i-1]
					z= v[j][i]
					v[j][i-1] = x*c+z*s
					v[j][i] = -x*s+z*c
				}
				z= pythag(f,h)
				q[i-1]= z
				c= f/z
				s= h/z
				f= c*g+s*y
				x= -s*g+c*y
				for (j=0; j < m; j++)
				{
					y= u[j][i-1]
					z= u[j][i]
					u[j][i-1] = y*c+z*s
					u[j][i] = -y*s+z*c
				}
			}
			e[l]= 0.0
			e[k]= f
			q[k]= x
		} 
	}
		
	//vt= transpose(v)
	//return (u,q,vt)
	for (i=0;i<q.length; i++) 
	  if (q[i] < prec) q[i] = 0
	  
	//sort eigenvalues	
	for (i=0; i< n; i++)
	{	 
	//writeln(q)
	 for (j=i-1; j >= 0; j--)
	 {
	  if (q[j] < q[i])
	  {
	//  writeln(i,'-',j)
	   c = q[j]
	   q[j] = q[i]
	   q[i] = c
	   for(k=0;k<u.length;k++) { temp = u[k][i]; u[k][i] = u[k][j]; u[k][j] = temp; }
	   for(k=0;k<v.length;k++) { temp = v[k][i]; v[k][i] = v[k][j]; v[k][j] = temp; }
//	   u.swapCols(i,j)
//	   v.swapCols(i,j)
	   i = j	   
	  }
	 }	
	}
	
	return {U:u,S:q,V:v}
};






















/**
 * math.js
 * https://github.com/josdejong/mathjs
 *
 * Math.js is an extensive math library for JavaScript and Node.js,
 * It features real and complex numbers, units, matrices, a large set of
 * mathematical functions, and a flexible expression parser.
 *
 * @version 3.4.1
 * @date    2016-08-08
 *
 * @license
 * Copyright (C) 2013-2016 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.math=t():e.math=t()}(this,function(){return function(e){function t(n){if(r[n])return r[n].exports;var i=r[n]={exports:{},id:n,loaded:!1};return e[n].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t,r){function n(e){var t=i.create(e);return t.create=n,t["import"](r(13)),t}var i=r(1);e.exports=n()},function(e,t,r){e.exports=r(2)},function(e,t,r){var n=r(3).isFactory,i=(r(3).deepExtend,r(4)),o=r(8),a=r(10),s=r(12);t.create=function(e){function t(e){if(!n(e))throw new Error("Factory object with properties `type`, `name`, and `factory` expected");var i,o=r.indexOf(e);return-1===o?(i=e.math===!0?e.factory(c.type,f,t,c.typed,c):e.factory(c.type,f,t,c.typed),r.push(e),u.push(i)):i=u[o],i}if("function"!=typeof Object.create)throw new Error("ES5 not supported by this JavaScript engine. Please load the es5-shim and es5-sham library for compatibility.");var r=[],u=[],c=o.mixin({});c.type={},c.expression={transform:Object.create(c)},c.typed=i.create(c.type);var f={epsilon:1e-12,matrix:"Matrix",number:"number",precision:64,predictable:!1};return c["import"]=t(a),c.config=t(s),e&&c.config(e),c}},function(e,t){"use strict";t.clone=function r(e){var t=typeof e;if("number"===t||"string"===t||"boolean"===t||null===e||void 0===e)return e;if("function"==typeof e.clone)return e.clone();if(Array.isArray(e))return e.map(function(e){return r(e)});if(e instanceof Number)return new Number(e.valueOf());if(e instanceof String)return new String(e.valueOf());if(e instanceof Boolean)return new Boolean(e.valueOf());if(e instanceof Date)return new Date(e.valueOf());if(e&&e.isBigNumber===!0)return e;if(e instanceof RegExp)throw new TypeError("Cannot clone "+e);var n={};for(var i in e)e.hasOwnProperty(i)&&(n[i]=r(e[i]));return n},t.extend=function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);return e},t.deepExtend=function n(e,t){if(Array.isArray(t))throw new TypeError("Arrays are not supported by deepExtend");for(var r in t)if(t.hasOwnProperty(r))if(t[r]&&t[r].constructor===Object)void 0===e[r]&&(e[r]={}),e[r].constructor===Object?n(e[r],t[r]):e[r]=t[r];else{if(Array.isArray(t[r]))throw new TypeError("Arrays are not supported by deepExtend");e[r]=t[r]}return e},t.deepEqual=function(e,r){var n,i,o;if(Array.isArray(e)){if(!Array.isArray(r))return!1;if(e.length!=r.length)return!1;for(i=0,o=e.length;o>i;i++)if(!t.deepEqual(e[i],r[i]))return!1;return!0}if(e instanceof Object){if(Array.isArray(r)||!(r instanceof Object))return!1;for(n in e)if(!t.deepEqual(e[n],r[n]))return!1;for(n in r)if(!t.deepEqual(e[n],r[n]))return!1;return!0}return typeof e==typeof r&&e==r},t.canDefineProperty=function(){try{if(Object.defineProperty)return Object.defineProperty({},"x",{get:function(){}}),!0}catch(e){}return!1},t.lazy=function(e,r,n){if(t.canDefineProperty()){var i,o=!0;Object.defineProperty(e,r,{get:function(){return o&&(i=n(),o=!1),i},set:function(e){i=e,o=!1},configurable:!0,enumerable:!0})}else e[r]=n()},t.traverse=function(e,t){var r=e;if(t)for(var n=t.split("."),i=0;i<n.length;i++){var o=n[i];o in r||(r[o]={}),r=r[o]}return r},t.isFactory=function(e){return e&&"function"==typeof e.factory}},function(e,t,r){var n=r(5),i=r(6).digits,o=function(){return o=n.create,n};t.create=function(e){var t=o();return t.types=[{name:"number",test:function(e){return"number"==typeof e}},{name:"Complex",test:function(e){return e&&e.isComplex}},{name:"BigNumber",test:function(e){return e&&e.isBigNumber}},{name:"Fraction",test:function(e){return e&&e.isFraction}},{name:"Unit",test:function(e){return e&&e.isUnit}},{name:"string",test:function(e){return"string"==typeof e}},{name:"Array",test:Array.isArray},{name:"Matrix",test:function(e){return e&&e.isMatrix}},{name:"DenseMatrix",test:function(e){return e&&e.isDenseMatrix}},{name:"SparseMatrix",test:function(e){return e&&e.isSparseMatrix}},{name:"ImmutableDenseMatrix",test:function(e){return e&&e.isImmutableDenseMatrix}},{name:"Range",test:function(e){return e&&e.isRange}},{name:"Index",test:function(e){return e&&e.isIndex}},{name:"boolean",test:function(e){return"boolean"==typeof e}},{name:"ResultSet",test:function(e){return e&&e.isResultSet}},{name:"Help",test:function(e){return e&&e.isHelp}},{name:"function",test:function(e){return"function"==typeof e}},{name:"Date",test:function(e){return e instanceof Date}},{name:"RegExp",test:function(e){return e instanceof RegExp}},{name:"Object",test:function(e){return"object"==typeof e}},{name:"null",test:function(e){return null===e}},{name:"undefined",test:function(e){return void 0===e}}],t.conversions=[{from:"number",to:"BigNumber",convert:function(t){if(i(t)>15)throw new TypeError("Cannot implicitly convert a number with >15 significant digits to BigNumber (value: "+t+"). Use function bignumber(x) to convert to BigNumber.");return new e.BigNumber(t)}},{from:"number",to:"Complex",convert:function(t){return new e.Complex(t,0)}},{from:"number",to:"string",convert:function(e){return e+""}},{from:"BigNumber",to:"Complex",convert:function(t){return new e.Complex(t.toNumber(),0)}},{from:"Fraction",to:"Complex",convert:function(t){return new e.Complex(t.valueOf(),0)}},{from:"number",to:"Fraction",convert:function(t){if(i(t)>15)throw new TypeError("Cannot implicitly convert a number with >15 significant digits to Fraction (value: "+t+"). Use function fraction(x) to convert to Fraction.");return new e.Fraction(t)}},{from:"string",to:"number",convert:function(e){var t=Number(e);if(isNaN(t))throw new Error('Cannot convert "'+e+'" to a number');return t}},{from:"boolean",to:"number",convert:function(e){return+e}},{from:"boolean",to:"BigNumber",convert:function(t){return new e.BigNumber(+t)}},{from:"boolean",to:"Fraction",convert:function(t){return new e.Fraction(+t)}},{from:"boolean",to:"string",convert:function(e){return+e}},{from:"null",to:"number",convert:function(){return 0}},{from:"null",to:"string",convert:function(){return"null"}},{from:"null",to:"BigNumber",convert:function(){return new e.BigNumber(0)}},{from:"null",to:"Fraction",convert:function(){return new e.Fraction(0)}},{from:"Array",to:"Matrix",convert:function(t){return new e.DenseMatrix(t)}},{from:"Matrix",to:"Array",convert:function(e){return e.valueOf()}}],t}},function(e,t,r){var n,i,o;!function(r,a){i=[],n=a,o="function"==typeof n?n.apply(t,i):n,!(void 0!==o&&(e.exports=o))}(this,function(){function e(){function t(e){for(var t,r=0;r<N.types.length;r++){var n=N.types[r];if(n.name===e){t=n.test;break}}if(!t){var i;for(r=0;r<N.types.length;r++)if(n=N.types[r],n.name.toLowerCase()==e.toLowerCase()){i=n.name;break}throw new Error('Unknown type "'+e+'"'+(i?'. Did you mean "'+i+'"?':""))}return t}function r(e){for(var t="",r=0;r<e.length;r++){var n=e[r];if(n.signatures&&""!=n.name)if(""==t)t=n.name;else if(t!=n.name){var i=new Error("Function names do not match (expected: "+t+", actual: "+n.name+")");throw i.data={actual:n.name,expected:t},i}}return t}function n(e,t,r,n,i){var o,a=m(n),s=i?i.split(","):null,u=e||"unnamed",c=s&&d(s,"any"),f={fn:e,index:r,actual:n,expected:s};o=s?t>r&&!c?"Unexpected type of argument in function "+u+" (expected: "+s.join(" or ")+", actual: "+a+", index: "+r+")":"Too few arguments in function "+u+" (expected: "+s.join(" or ")+", index: "+r+")":"Too many arguments in function "+u+" (expected: "+r+", actual: "+t+")";var l=new TypeError(o);return l.data=f,l}function i(e){this.name=e||"refs",this.categories={}}function o(e,t){if("string"==typeof e){var r=e.trim(),n="..."===r.substr(0,3);if(n&&(r=r.substr(3)),""===r)this.types=["any"];else{this.types=r.split("|");for(var i=0;i<this.types.length;i++)this.types[i]=this.types[i].trim()}}else{if(!Array.isArray(e)){if(e instanceof o)return e.clone();throw new Error("String or Array expected")}this.types=e}this.conversions=[],this.varArgs=n||t||!1,this.anyType=-1!==this.types.indexOf("any")}function a(e,t){var r;if("string"==typeof e)r=""!==e?e.split(","):[];else{if(!Array.isArray(e))throw new Error("string or Array expected");r=e}this.params=new Array(r.length);for(var n=0;n<r.length;n++){var i=new o(r[n]);if(this.params[n]=i,n===r.length-1)this.varArgs=i.varArgs;else if(i.varArgs)throw new SyntaxError('Unexpected variable arguments operator "..."')}this.fn=t}function s(e,t,r){this.path=e||[],this.param=e[e.length-1]||null,this.signature=t||null,this.childs=r||[]}function u(e){var t,r,n={},i=[];for(var o in e)if(e.hasOwnProperty(o)){var s=e[o];if(t=new a(o,s),t.ignore())continue;var u=t.expand();for(r=0;r<u.length;r++){var c=u[r],f=c.toString(),l=n[f];if(l){var p=a.compare(c,l);if(0>p)n[f]=c;else if(0===p)throw new Error('Signature "'+f+'" is defined twice')}else n[f]=c}}for(f in n)n.hasOwnProperty(f)&&i.push(n[f]);for(i.sort(function(e,t){return a.compare(e,t)}),r=0;r<i.length;r++)if(t=i[r],t.varArgs)for(var h=t.params.length-1,m=t.params[h],g=0;g<m.types.length;){if(m.conversions[g])for(var v=m.types[g],y=0;y<i.length;y++){var x=i[y],b=x.params[h];if(x!==t&&b&&d(b.types,v)&&!b.conversions[h]){m.types.splice(g,1),m.conversions.splice(g,1),g--;break}}g++}return i}function c(e){for(var t={},r=0;r<e.length;r++){var n=e[r];if(n.fn&&!n.hasConversions()){var i=n.params.join(",");t[i]=n.fn}}return t}function f(e,t){var r,n,i,a=t.length,u=[];for(r=0;r<e.length;r++)n=e[r],n.params.length!==a||i||(i=n),void 0!=n.params[a]&&u.push(n);u.sort(function(e,t){return o.compare(e.params[a],t.params[a])});var c=[];for(r=0;r<u.length;r++){n=u[r];var l=n.params[a],p=c.filter(function(e){return e.param.overlapping(l)})[0];if(p){if(p.param.varArgs)throw new Error('Conflicting types "'+p.param+'" and "'+l+'"');p.signatures.push(n)}else c.push({param:l,signatures:[n]})}var h=new Array(c.length);for(r=0;r<c.length;r++){var m=c[r];h[r]=f(m.signatures,t.concat(m.param))}return new s(t,i,h)}function l(e){for(var t=[],r=0;e>r;r++)t[r]="arg"+r;return t}function p(e,t){var r=new i,o=u(t);if(0==o.length)throw new Error("No signatures provided");var a=f(o,[]),s=[],p=e||"",m=l(h(o));s.push("function "+p+"("+m.join(", ")+") {"),s.push('  "use strict";'),s.push("  var name = '"+p+"';"),s.push(a.toCode(r,"  ")),s.push("}");var d=[r.toCode(),"return "+s.join("\n")].join("\n"),g=new Function(r.name,"createError",d),v=g(r,n);return v.signatures=c(o),v}function h(e){for(var t=0,r=0;r<e.length;r++){var n=e[r].params.length;n>t&&(t=n)}return t}function m(e){for(var t,r=0;r<N.types.length;r++){var n=N.types[r];if("Object"===n.name)t=n;else if(n.test(e))return n.name}return t&&t.test(e)?t.name:"unknown"}function d(e,t){return-1!==e.indexOf(t)}function g(e,t){if(!e.signatures)throw new TypeError("Function is no typed-function");var r;if("string"==typeof t){r=t.split(",");for(var n=0;n<r.length;n++)r[n]=r[n].trim()}else{if(!Array.isArray(t))throw new TypeError("String array or a comma separated string expected");r=t}var i=r.join(","),o=e.signatures[i];if(o)return o;throw new TypeError("Signature not found (signature: "+(e.name||"unnamed")+"("+r.join(", ")+"))")}function v(e,t){var r=m(e);if(t===r)return e;for(var n=0;n<N.conversions.length;n++){var i=N.conversions[n];if(i.from===r&&i.to===t)return i.convert(e)}throw new Error("Cannot convert from "+r+" to "+t)}i.prototype.add=function(e,t){var r=t||"fn";this.categories[r]||(this.categories[r]=[]);var n=this.categories[r].indexOf(e);return-1==n&&(n=this.categories[r].length,this.categories[r].push(e)),r+n},i.prototype.toCode=function(){var e=[],t=this.name+".categories",r=this.categories;for(var n in r)if(r.hasOwnProperty(n))for(var i=r[n],o=0;o<i.length;o++)e.push("var "+n+o+" = "+t+"['"+n+"']["+o+"];");return e.join("\n")},o.compare=function(e,t){if(e.anyType)return 1;if(t.anyType)return-1;if(d(e.types,"Object"))return 1;if(d(t.types,"Object"))return-1;if(e.hasConversions()){if(t.hasConversions()){var r,n,i;for(r=0;r<e.conversions.length;r++)if(void 0!==e.conversions[r]){n=e.conversions[r];break}for(r=0;r<t.conversions.length;r++)if(void 0!==t.conversions[r]){i=t.conversions[r];break}return N.conversions.indexOf(n)-N.conversions.indexOf(i)}return 1}if(t.hasConversions())return-1;var o,a;for(r=0;r<N.types.length;r++)if(N.types[r].name===e.types[0]){o=r;break}for(r=0;r<N.types.length;r++)if(N.types[r].name===t.types[0]){a=r;break}return o-a},o.prototype.overlapping=function(e){for(var t=0;t<this.types.length;t++)if(d(e.types,this.types[t]))return!0;return!1},o.prototype.clone=function(){var e=new o(this.types.slice(),this.varArgs);return e.conversions=this.conversions.slice(),e},o.prototype.hasConversions=function(){return this.conversions.length>0},o.prototype.contains=function(e){for(var t=0;t<this.types.length;t++)if(e[this.types[t]])return!0;return!1},o.prototype.toString=function(e){for(var t=[],r={},n=0;n<this.types.length;n++){var i=this.conversions[n],o=e&&i?i.to:this.types[n];o in r||(r[o]=!0,t.push(o))}return(this.varArgs?"...":"")+t.join("|")},a.prototype.clone=function(){return new a(this.params.slice(),this.fn)},a.prototype.expand=function(){function e(r,n){if(n.length<r.params.length){var i,s,u,c=r.params[n.length];if(c.varArgs){for(s=c.clone(),i=0;i<N.conversions.length;i++)if(u=N.conversions[i],!d(c.types,u.from)&&d(c.types,u.to)){var f=s.types.length;s.types[f]=u.from,s.conversions[f]=u}e(r,n.concat(s))}else{for(i=0;i<c.types.length;i++)e(r,n.concat(new o(c.types[i])));for(i=0;i<N.conversions.length;i++)u=N.conversions[i],!d(c.types,u.from)&&d(c.types,u.to)&&(s=new o(u.from),s.conversions[0]=u,e(r,n.concat(s)))}}else t.push(new a(n,r.fn))}var t=[];return e(this,[]),t},a.compare=function(e,t){if(e.params.length>t.params.length)return 1;if(e.params.length<t.params.length)return-1;var r,n=e.params.length,i=0,a=0;for(r=0;n>r;r++)e.params[r].hasConversions()&&i++,t.params[r].hasConversions()&&a++;if(i>a)return 1;if(a>i)return-1;for(r=0;r<e.params.length;r++){var s=o.compare(e.params[r],t.params[r]);if(0!==s)return s}return 0},a.prototype.hasConversions=function(){for(var e=0;e<this.params.length;e++)if(this.params[e].hasConversions())return!0;return!1},a.prototype.ignore=function(){for(var e={},t=0;t<N.ignore.length;t++)e[N.ignore[t]]=!0;for(t=0;t<this.params.length;t++)if(this.params[t].contains(e))return!0;return!1},a.prototype.toCode=function(e,t){for(var r=[],n=new Array(this.params.length),i=0;i<this.params.length;i++){var o=this.params[i],a=o.conversions[0];o.varArgs?n[i]="varArgs":a?n[i]=e.add(a.convert,"convert")+"(arg"+i+")":n[i]="arg"+i}var s=this.fn?e.add(this.fn,"signature"):void 0;return s?t+"return "+s+"("+n.join(", ")+"); // signature: "+this.params.join(", "):r.join("\n")},a.prototype.toString=function(){return this.params.join(", ")},s.prototype.toCode=function(e,r,n){var i=[];if(this.param){var o=this.path.length-1,a=this.param.conversions[0],s="// type: "+(a?a.from+" (convert to "+a.to+")":this.param);if(this.param.varArgs)if(this.param.anyType)i.push(r+"if (arguments.length > "+o+") {"),i.push(r+"  var varArgs = [];"),i.push(r+"  for (var i = "+o+"; i < arguments.length; i++) {"),i.push(r+"    varArgs.push(arguments[i]);"),i.push(r+"  }"),i.push(this.signature.toCode(e,r+"  ")),i.push(r+"}");else{for(var u=function(r,n){for(var i=[],o=0;o<r.length;o++)i[o]=e.add(t(r[o]),"test")+"("+n+")";return i.join(" || ")}.bind(this),c=this.param.types,f=[],l=0;l<c.length;l++)void 0===this.param.conversions[l]&&f.push(c[l]);i.push(r+"if ("+u(c,"arg"+o)+") { "+s),i.push(r+"  var varArgs = [arg"+o+"];"),i.push(r+"  for (var i = "+(o+1)+"; i < arguments.length; i++) {"),i.push(r+"    if ("+u(f,"arguments[i]")+") {"),i.push(r+"      varArgs.push(arguments[i]);");for(var l=0;l<c.length;l++){var p=this.param.conversions[l];if(p){var h=e.add(t(c[l]),"test"),m=e.add(p.convert,"convert");i.push(r+"    }"),i.push(r+"    else if ("+h+"(arguments[i])) {"),i.push(r+"      varArgs.push("+m+"(arguments[i]));")}}i.push(r+"    } else {"),i.push(r+"      throw createError(name, arguments.length, i, arguments[i], '"+f.join(",")+"');"),i.push(r+"    }"),i.push(r+"  }"),i.push(this.signature.toCode(e,r+"  ")),i.push(r+"}")}else if(this.param.anyType)i.push(r+"// type: any"),i.push(this._innerCode(e,r,n));else{var d=this.param.types[0],h="any"!==d?e.add(t(d),"test"):null;i.push(r+"if ("+h+"(arg"+o+")) { "+s),i.push(this._innerCode(e,r+"  ",n)),i.push(r+"}")}}else i.push(this._innerCode(e,r,n));return i.join("\n")},s.prototype._innerCode=function(e,t,r){var n,i=[];this.signature&&(i.push(t+"if (arguments.length === "+this.path.length+") {"),i.push(this.signature.toCode(e,t+"  ")),i.push(t+"}"));var o;for(n=0;n<this.childs.length;n++)if(this.childs[n].param.anyType){o=this.childs[n];break}for(n=0;n<this.childs.length;n++)i.push(this.childs[n].toCode(e,t,o));r&&!this.param.anyType&&i.push(r.toCode(e,t,o));var a=this._exceptions(e,t);return a&&i.push(a),i.join("\n")},s.prototype._exceptions=function(e,t){var r=this.path.length;if(0===this.childs.length)return[t+"if (arguments.length > "+r+") {",t+"  throw createError(name, arguments.length, "+r+", arguments["+r+"]);",t+"}"].join("\n");for(var n={},i=[],o=0;o<this.childs.length;o++){var a=this.childs[o];if(a.param)for(var s=0;s<a.param.types.length;s++){var u=a.param.types[s];u in n||a.param.conversions[s]||(n[u]=!0,i.push(u))}}return t+"throw createError(name, arguments.length, "+r+", arguments["+r+"], '"+i.join(",")+"');"};var y=[{name:"number",test:function(e){return"number"==typeof e}},{name:"string",test:function(e){return"string"==typeof e}},{name:"boolean",test:function(e){return"boolean"==typeof e}},{name:"Function",test:function(e){return"function"==typeof e}},{name:"Array",test:Array.isArray},{name:"Date",test:function(e){return e instanceof Date}},{name:"RegExp",test:function(e){return e instanceof RegExp}},{name:"Object",test:function(e){return"object"==typeof e}},{name:"null",test:function(e){return null===e}},{name:"undefined",test:function(e){return void 0===e}}],x={},b=[],w=[],N={config:x,types:y,conversions:b,ignore:w};return N=p("typed",{Object:function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(e[n]);var i=r(t);return p(i,e)},"string, Object":p,"...Function":function(e){for(var t,n=r(e),i={},o=0;o<e.length;o++){var a=e[o];if("object"!=typeof a.signatures)throw t=new TypeError("Function is no typed-function (index: "+o+")"),t.data={index:o},t;for(var s in a.signatures)if(a.signatures.hasOwnProperty(s))if(i.hasOwnProperty(s)){if(a.signatures[s]!==i[s])throw t=new Error('Signature "'+s+'" is defined twice'),t.data={signature:s},t}else i[s]=a.signatures[s]}return p(n,i)}}),N.config=x,N.types=y,N.conversions=b,N.ignore=w,N.create=e,N.find=g,N.convert=v,N.addType=function(e){if(!e||"string"!=typeof e.name||"function"!=typeof e.test)throw new TypeError("Object with properties {name: string, test: function} expected");N.types.push(e)},N.addConversion=function(e){if(!e||"string"!=typeof e.from||"string"!=typeof e.to||"function"!=typeof e.convert)throw new TypeError("Object with properties {from: string, to: string, convert: function} expected");N.conversions.push(e)},N}return e()})},function(e,t,r){"use strict";var n=r(7);t.isNumber=function(e){return"number"==typeof e},t.isInteger=function(e){return isFinite(e)?e==Math.round(e):!1},t.sign=Math.sign||function(e){return e>0?1:0>e?-1:0},t.format=function(e,r){if("function"==typeof r)return r(e);if(e===1/0)return"Infinity";if(e===-(1/0))return"-Infinity";if(isNaN(e))return"NaN";var n="auto",i=void 0;switch(r&&(r.notation&&(n=r.notation),t.isNumber(r)?i=r:r.precision&&(i=r.precision)),n){case"fixed":return t.toFixed(e,i);case"exponential":return t.toExponential(e,i);case"engineering":return t.toEngineering(e,i);case"auto":return t.toPrecision(e,i,r&&r.exponential).replace(/((\.\d*?)(0+))($|e)/,function(){var e=arguments[2],t=arguments[4];return"."!==e?e+t:t});default:throw new Error('Unknown notation "'+n+'". Choose "auto", "exponential", or "fixed".')}},t.toExponential=function(e,t){return new n(e).toExponential(t)},t.toEngineering=function(e,t){return new n(e).toEngineering(t)},t.toFixed=function(e,t){return new n(e).toFixed(t)},t.toPrecision=function(e,t,r){return new n(e).toPrecision(t,r)},t.digits=function(e){return e.toExponential().replace(/e.*$/,"").replace(/^0\.?0*|\./,"").length},t.DBL_EPSILON=Number.EPSILON||2.220446049250313e-16,t.nearlyEqual=function(e,r,n){if(null==n)return e==r;if(e==r)return!0;if(isNaN(e)||isNaN(r))return!1;if(isFinite(e)&&isFinite(r)){var i=Math.abs(e-r);return i<t.DBL_EPSILON?!0:i<=Math.max(Math.abs(e),Math.abs(r))*n}return!1}},function(e,t){"use strict";function r(e){var t=String(e).toLowerCase().match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);if(!t)throw new SyntaxError("Invalid number");var r=t[1],n=t[2],i=parseFloat(t[4]||"0"),o=n.indexOf(".");i+=-1!==o?o-1:n.length-1,this.sign=r,this.coefficients=n.replace(".","").replace(/^0*/,function(e){return i-=e.length,""}).replace(/0*$/,"").split("").map(function(e){return parseInt(e)}),0===this.coefficients.length&&(this.coefficients.push(0),i++),this.exponent=i}function n(e){for(var t=[],r=0;e>r;r++)t.push(0);return t}r.prototype.toEngineering=function(e){var t=this.roundDigits(e),r=t.exponent,i=t.coefficients,o=r%3===0?r:0>r?r-3-r%3:r-r%3,a=r>=0?r:Math.abs(o);i.length-1<a&&(i=i.concat(n(a-(i.length-1))));for(var s=Math.abs(r-o),u=1,c="";--s>=0;)u++;var f=i.slice(u).join(""),l=f.match(/[1-9]/)?"."+f:"";return c=i.slice(0,u).join("")+l,c+="e"+(r>=0?"+":"")+o.toString(),t.sign+c},r.prototype.toFixed=function(e){var t=this.roundDigits(this.exponent+1+(e||0)),r=t.coefficients,i=t.exponent+1,o=i+(e||0);return r.length<o&&(r=r.concat(n(o-r.length))),0>i&&(r=n(-i+1).concat(r),i=1),e&&r.splice(i,0,0===i?"0.":"."),this.sign+r.join("")},r.prototype.toExponential=function(e){var t=e?this.roundDigits(e):this.clone(),r=t.coefficients,i=t.exponent;r.length<e&&(r=r.concat(n(e-r.length)));var o=r.shift();return this.sign+o+(r.length>0?"."+r.join(""):"")+"e"+(i>=0?"+":"")+i},r.prototype.toPrecision=function(e,t){var r=t&&void 0!==t.lower?t.lower:.001,i=t&&void 0!==t.upper?t.upper:1e5,o=Math.abs(Math.pow(10,this.exponent));if(r>o||o>=i)return this.toExponential(e);var a=e?this.roundDigits(e):this.clone(),s=a.coefficients,u=a.exponent;s.length<e&&(s=s.concat(n(e-s.length))),s=s.concat(n(u-s.length+1+(s.length<e?e-s.length:0))),s=n(-u).concat(s);var c=u>0?u:0;return c<s.length-1&&s.splice(c+1,0,"."),this.sign+s.join("")},r.prototype.clone=function(){var e=new r("0");return e.sign=this.sign,e.coefficients=this.coefficients.slice(0),e.exponent=this.exponent,e},r.prototype.roundDigits=function(e){for(var t=this.clone(),r=t.coefficients;0>=e;)r.unshift(0),t.exponent++,e++;if(r.length>e){var n=r.splice(e,r.length-e);if(n[0]>=5){var i=e-1;for(r[i]++;10===r[i];)r.pop(),0===i&&(r.unshift(0),t.exponent++,i++),i--,r[i]++}}return t},e.exports=r},function(e,t,r){var n=r(9);t.mixin=function(e){var t=new n;return e.on=t.on.bind(t),e.off=t.off.bind(t),e.once=t.once.bind(t),e.emit=t.emit.bind(t),e}},function(e,t){function r(){}r.prototype={on:function(e,t,r){var n=this.e||(this.e={});return(n[e]||(n[e]=[])).push({fn:t,ctx:r}),this},once:function(e,t,r){function n(){i.off(e,n),t.apply(r,arguments)}var i=this;return n._=t,this.on(e,n,r)},emit:function(e){var t=[].slice.call(arguments,1),r=((this.e||(this.e={}))[e]||[]).slice(),n=0,i=r.length;for(n;i>n;n++)r[n].fn.apply(r[n].ctx,t);return this},off:function(e,t){var r=this.e||(this.e={}),n=r[e],i=[];if(n&&t)for(var o=0,a=n.length;a>o;o++)n[o].fn!==t&&n[o].fn._!==t&&i.push(n[o]);return i.length?r[e]=i:delete r[e],this}},e.exports=r},function(e,t,r){"use strict";function n(e,t,r,n,u){function c(e,t){var r=arguments.length;if(1!=r&&2!=r)throw new s("import",r,1,2);if(t||(t={}),o(e))h(e,t);else if(Array.isArray(e))e.forEach(function(e){c(e,t)});else if("object"==typeof e){for(var n in e)if(e.hasOwnProperty(n)){var i=e[n];m(i)?f(n,i,t):o(e)?h(e,t):c(i,t)}}else if(!t.silent)throw new TypeError("Factory, Object, or Array expected")}function f(e,t,r){if(r.wrap&&"function"==typeof t&&(t=p(t)),d(u[e])&&d(t))return t=r.override?n(e,t.signatures):n(u[e],t),u[e]=t,l(e,t),void u.emit("import",e,function(){return t});if(void 0===u[e]||r.override)return u[e]=t,l(e,t),void u.emit("import",e,function(){return t});if(!r.silent)throw new Error('Cannot import "'+e+'": already exists')}function l(e,t){t&&"function"==typeof t.transform&&(u.expression.transform[e]=t.transform)}function p(e){var t=function(){for(var t=[],r=0,n=arguments.length;n>r;r++){var i=arguments[r];t[r]=i&&i.valueOf()}return e.apply(u,t)};return e.transform&&(t.transform=e.transform),t}function h(e,t){if("string"==typeof e.name){var o=e.name,s=e.path?a(u,e.path):u,c=s.hasOwnProperty(o)?s[o]:void 0,f=function(){var i=r(e);if(d(c)&&d(i))return t.override||(i=n(c,i)),i;if(void 0===c||t.override)return i;if(!t.silent)throw new Error('Cannot import "'+o+'": already exists')};e.lazy!==!1?i(s,o,f):s[o]=f(),u.emit("import",o,f,e.path)}else r(e)}function m(e){return"function"==typeof e||"number"==typeof e||"string"==typeof e||"boolean"==typeof e||null===e||e&&e.isUnit===!0||e&&e.isComplex===!0||e&&e.isBigNumber===!0||e&&e.isFraction===!0||e&&e.isMatrix===!0||e&&Array.isArray(e)===!0}function d(e){return"function"==typeof e&&"object"==typeof e.signatures}return c}var i=r(3).lazy,o=r(3).isFactory,a=r(3).traverse,s=(r(3).extend,r(11));t.math=!0,t.name="import",t.factory=n,t.lazy=!0},function(e,t){"use strict";function r(e,t,n,i){if(!(this instanceof r))throw new SyntaxError("Constructor must be called with the new operator");this.fn=e,this.count=t,this.min=n,this.max=i,this.message="Wrong number of arguments in function "+e+" ("+t+" provided, "+n+(void 0!=i?"-"+i:"")+" expected)",this.stack=(new Error).stack}r.prototype=new Error,r.prototype.constructor=Error,r.prototype.name="ArgumentsError",r.prototype.isArgumentsError=!0,e.exports=r},function(e,t,r){"use strict";function n(e,t,r,n,i){function o(e){if(e){var r=s.clone(t);a(e,"matrix",u),a(e,"number",c),s.deepExtend(t,e);var n=s.clone(t);return i.emit("config",n,r),n}return s.clone(t)}var u=["Matrix","Array"],c=["number","BigNumber","Fraction"];return o.MATRIX=u,o.NUMBER=c,o}function i(e,t){return-1!==e.indexOf(t)}function o(e,t){return e.map(function(e){return e.toLowerCase()}).indexOf(t.toLowerCase())}function a(e,t,r){if(void 0!==e[t]&&!i(r,e[t])){var n=o(r,e[t]);-1!==n?(console.warn('Warning: Wrong casing for configuration option "'+t+'", should be "'+r[n]+'" instead of "'+e[t]+'".'),e[t]=r[n]):console.warn('Warning: Unknown value "'+e[t]+'" for configuration option "'+t+'". Available options: '+r.map(JSON.stringify).join(", ")+".")}}var s=r(3);t.name="config",t.math=!0,t.factory=n},function(e,t,r){e.exports=[r(14),r(100),r(102),r(335),r(499),r(501)]},function(e,t,r){e.exports=[r(15),r(20),r(21),r(26),r(33),r(37),r(70),r(71),r(73),r(74)]},function(e,t,r){e.exports=[r(16),r(18)]},function(e,t,r){function n(e,t,r,n,o){var a=i.clone({precision:t.precision});return a.prototype.type="BigNumber",a.prototype.isBigNumber=!0,a.prototype.toJSON=function(){return{mathjs:"BigNumber",value:this.toString()}},a.fromJSON=function(e){return new a(e.value)},o.on("config",function(e,t){e.precision!==t.precision&&a.config({precision:e.precision})}),a}var i=r(17);t.name="BigNumber",t.path="type",t.factory=n,t.math=!0},function(e,t,r){var n;!function(i){"use strict";function o(e){var t,r,n,i=e.length-1,o="",a=e[0];if(i>0){for(o+=a,t=1;i>t;t++)n=e[t]+"",r=Pe-n.length,r&&(o+=g(r)),o+=n;a=e[t],n=a+"",r=Pe-n.length,r&&(o+=g(r))}else if(0===a)return"0";for(;a%10===0;)a/=10;return o+a}function a(e,t,r){if(e!==~~e||t>e||e>r)throw Error(Oe+e)}function s(e,t,r,n){var i,o,a,s;for(o=e[0];o>=10;o/=10)--t;return--t<0?(t+=Pe,i=0):(i=Math.ceil((t+1)/Pe),t%=Pe),o=Ce(10,Pe-t),s=e[i]%o|0,null==n?3>t?(0==t?s=s/100|0:1==t&&(s=s/10|0),a=4>r&&99999==s||r>3&&49999==s||5e4==s||0==s):a=(4>r&&s+1==o||r>3&&s+1==o/2)&&(e[i+1]/o/100|0)==Ce(10,t-2)-1||(s==o/2||0==s)&&0==(e[i+1]/o/100|0):4>t?(0==t?s=s/1e3|0:1==t?s=s/100|0:2==t&&(s=s/10|0),a=(n||4>r)&&9999==s||!n&&r>3&&4999==s):a=((n||4>r)&&s+1==o||!n&&r>3&&s+1==o/2)&&(e[i+1]/o/1e3|0)==Ce(10,t-3)-1,a}function u(e,t,r){for(var n,i,o=[0],a=0,s=e.length;s>a;){for(i=o.length;i--;)o[i]*=t;for(o[0]+=xe.indexOf(e.charAt(a++)),n=0;n<o.length;n++)o[n]>r-1&&(void 0===o[n+1]&&(o[n+1]=0),o[n+1]+=o[n]/r|0,o[n]%=r)}return o.reverse()}function c(e,t){var r,n,i=t.d.length;32>i?(r=Math.ceil(i/3),n=Math.pow(4,-r).toString()):(r=16,n="2.3283064365386962890625e-10"),e.precision+=r,t=O(e,1,t.times(n),new e(1));for(var o=r;o--;){var a=t.times(t);t=a.times(a).minus(a).times(8).plus(1)}return e.precision-=r,t}function f(e,t,r,n){var i,o,a,s,u,c,f,l,p,h=e.constructor;e:if(null!=t){if(l=e.d,!l)return e;for(i=1,s=l[0];s>=10;s/=10)i++;if(o=t-i,0>o)o+=Pe,a=t,f=l[p=0],u=f/Ce(10,i-a-1)%10|0;else if(p=Math.ceil((o+1)/Pe),s=l.length,p>=s){if(!n)break e;for(;s++<=p;)l.push(0);f=u=0,i=1,o%=Pe,a=o-Pe+1}else{for(f=s=l[p],i=1;s>=10;s/=10)i++;o%=Pe,a=o-Pe+i,u=0>a?0:f/Ce(10,i-a-1)%10|0}if(n=n||0>t||void 0!==l[p+1]||(0>a?f:f%Ce(10,i-a-1)),c=4>r?(u||n)&&(0==r||r==(e.s<0?3:2)):u>5||5==u&&(4==r||n||6==r&&(o>0?a>0?f/Ce(10,i-a):0:l[p-1])%10&1||r==(e.s<0?8:7)),1>t||!l[0])return l.length=0,c?(t-=e.e+1,l[0]=Ce(10,(Pe-t%Pe)%Pe),e.e=-t||0):l[0]=e.e=0,e;if(0==o?(l.length=p,s=1,p--):(l.length=p+1,s=Ce(10,Pe-o),l[p]=a>0?(f/Ce(10,i-a)%Ce(10,a)|0)*s:0),c)for(;;){if(0==p){for(o=1,a=l[0];a>=10;a/=10)o++;for(a=l[0]+=s,s=1;a>=10;a/=10)s++;o!=s&&(e.e++,l[0]==Ie&&(l[0]=1));break}if(l[p]+=s,l[p]!=Ie)break;l[p--]=0,s=1}for(o=l.length;0===l[--o];)l.pop()}return Me&&(e.e>h.maxE?(e.d=null,e.e=NaN):e.e<h.minE&&(e.e=0,e.d=[0])),e}function l(e,t,r){if(!e.isFinite())return N(e);var n,i=e.e,a=o(e.d),s=a.length;return t?(r&&(n=r-s)>0?a=a.charAt(0)+"."+a.slice(1)+g(n):s>1&&(a=a.charAt(0)+"."+a.slice(1)),a=a+(e.e<0?"e":"e+")+e.e):0>i?(a="0."+g(-i-1)+a,r&&(n=r-s)>0&&(a+=g(n))):i>=s?(a+=g(i+1-s),r&&(n=r-i-1)>0&&(a=a+"."+g(n))):((n=i+1)<s&&(a=a.slice(0,n)+"."+a.slice(n)),r&&(n=r-s)>0&&(i+1===s&&(a+="."),a+=g(n))),a}function p(e,t){for(var r=1,n=e[0];n>=10;n/=10)r++;return r+t*Pe-1}function h(e,t,r){if(t>Ue)throw Me=!0,r&&(e.precision=r),Error(_e);return f(new e(be),t,1,!0)}function m(e,t,r){if(t>qe)throw Error(_e);return f(new e(we),t,r,!0)}function d(e){var t=e.length-1,r=t*Pe+1;if(t=e[t]){for(;t%10==0;t/=10)r--;for(t=e[0];t>=10;t/=10)r++}return r}function g(e){for(var t="";e--;)t+="0";return t}function v(e,t,r,n){var i,o=new e(1),a=Math.ceil(n/Pe+4);for(Me=!1;;){if(r%2&&(o=o.times(t),C(o.d,a)&&(i=!0)),r=Te(r/2),0===r){r=o.d.length-1,i&&0===o.d[r]&&++o.d[r];break}t=t.times(t),C(t.d,a)}return Me=!0,o}function y(e){return 1&e.d[e.d.length-1]}function x(e,t,r){for(var n,i=new e(t[0]),o=0;++o<t.length;){if(n=new e(t[o]),!n.s){i=n;break}i[r](n)&&(i=n)}return i}function b(e,t){var r,n,i,a,u,c,l,p=0,h=0,m=0,d=e.constructor,g=d.rounding,v=d.precision;if(!e.d||!e.d[0]||e.e>17)return new d(e.d?e.d[0]?e.s<0?0:1/0:1:e.s?e.s<0?0:e:NaN);for(null==t?(Me=!1,l=v):l=t,c=new d(.03125);e.e>-2;)e=e.times(c),m+=5;for(n=Math.log(Ce(2,m))/Math.LN10*2+5|0,l+=n,r=a=u=new d(1),d.precision=l;;){if(a=f(a.times(e),l,1),r=r.times(++h),c=u.plus(je(a,r,l,1)),o(c.d).slice(0,l)===o(u.d).slice(0,l)){for(i=m;i--;)u=f(u.times(u),l,1);if(null!=t)return d.precision=v,u;if(!(3>p&&s(u.d,l-n,g,p)))return f(u,d.precision=v,g,Me=!0);d.precision=l+=10,r=a=c=new d(1),h=0,p++}u=c}}function w(e,t){var r,n,i,a,u,c,l,p,m,d,g,v=1,y=10,x=e,b=x.d,N=x.constructor,E=N.rounding,M=N.precision;if(x.s<0||!b||!b[0]||!x.e&&1==b[0]&&1==b.length)return new N(b&&!b[0]?-1/0:1!=x.s?NaN:b?0:x);if(null==t?(Me=!1,m=M):m=t,N.precision=m+=y,r=o(b),n=r.charAt(0),!(Math.abs(a=x.e)<15e14))return p=h(N,m+2,M).times(a+""),x=w(new N(n+"."+r.slice(1)),m-y).plus(p),N.precision=M,null==t?f(x,M,E,Me=!0):x;for(;7>n&&1!=n||1==n&&r.charAt(1)>3;)x=x.times(e),r=o(x.d),n=r.charAt(0),v++;for(a=x.e,n>1?(x=new N("0."+r),a++):x=new N(n+"."+r.slice(1)),d=x,l=u=x=je(x.minus(1),x.plus(1),m,1),g=f(x.times(x),m,1),i=3;;){if(u=f(u.times(g),m,1),p=l.plus(je(u,new N(i),m,1)),o(p.d).slice(0,m)===o(l.d).slice(0,m)){
if(l=l.times(2),0!==a&&(l=l.plus(h(N,m+2,M).times(a+""))),l=je(l,new N(v),m,1),null!=t)return N.precision=M,l;if(!s(l.d,m-y,E,c))return f(l,N.precision=M,E,Me=!0);N.precision=m+=y,p=u=x=je(d.minus(1),d.plus(1),m,1),g=f(x.times(x),m,1),i=c=1}l=p,i+=2}}function N(e){return String(e.s*e.s/0)}function E(e,t){var r,n,i;for((r=t.indexOf("."))>-1&&(t=t.replace(".","")),(n=t.search(/e/i))>0?(0>r&&(r=n),r+=+t.slice(n+1),t=t.substring(0,n)):0>r&&(r=t.length),n=0;48===t.charCodeAt(n);n++);for(i=t.length;48===t.charCodeAt(i-1);--i);if(t=t.slice(n,i)){if(i-=n,e.e=r=r-n-1,e.d=[],n=(r+1)%Pe,0>r&&(n+=Pe),i>n){for(n&&e.d.push(+t.slice(0,n)),i-=Pe;i>n;)e.d.push(+t.slice(n,n+=Pe));t=t.slice(n),n=Pe-t.length}else n-=i;for(;n--;)t+="0";e.d.push(+t),Me&&(e.e>e.constructor.maxE?(e.d=null,e.e=NaN):e.e<e.constructor.minE&&(e.e=0,e.d=[0]))}else e.e=0,e.d=[0];return e}function M(e,t){var r,n,i,o,a,s,c,f,l;if("Infinity"===t||"NaN"===t)return+t||(e.s=NaN),e.e=NaN,e.d=null,e;if(ze.test(t))r=16,t=t.toLowerCase();else if(Se.test(t))r=2;else{if(!Be.test(t))throw Error(Oe+t);r=8}for(o=t.search(/p/i),o>0?(c=+t.slice(o+1),t=t.substring(2,o)):t=t.slice(2),o=t.indexOf("."),a=o>=0,n=e.constructor,a&&(t=t.replace(".",""),s=t.length,o=s-o,i=v(n,new n(r),o,2*o)),f=u(t,r,Ie),l=f.length-1,o=l;0===f[o];--o)f.pop();return 0>o?new n(0*e.s):(e.e=p(f,l),e.d=f,Me=!1,a&&(e=je(e,i,4*s)),c&&(e=e.times(Math.abs(c)<54?Math.pow(2,c):Ne.pow(2,c))),Me=!0,e)}function A(e,t){var r,n=t.d.length;if(3>n)return O(e,2,t,t);r=1.4*Math.sqrt(n),r=r>16?16:0|r,t=t.times(Math.pow(5,-r)),t=O(e,2,t,t);for(var i,o=new e(5),a=new e(16),s=new e(20);r--;)i=t.times(t),t=t.times(o.plus(i.times(a.times(i).minus(s))));return t}function O(e,t,r,n,i){var o,a,s,u,c=1,f=e.precision,l=Math.ceil(f/Pe);for(Me=!1,u=r.times(r),s=new e(n);;){if(a=je(s.times(u),new e(t++*t++),f,1),s=i?n.plus(a):n.minus(a),n=je(a.times(u),new e(t++*t++),f,1),a=s.plus(n),void 0!==a.d[l]){for(o=l;a.d[o]===s.d[o]&&o--;);if(-1==o)break}o=s,s=n,n=a,a=o,c++}return Me=!0,a.d.length=l+1,a}function _(e,t){var r,n=t.s<0,i=m(e,e.precision,1),o=i.times(.5);if(t=t.abs(),t.lte(o))return ge=n?4:1,t;if(r=t.divToInt(i),r.isZero())ge=n?3:2;else{if(t=t.minus(r.times(i)),t.lte(o))return ge=y(r)?n?2:3:n?4:1,t;ge=y(r)?n?1:4:n?3:2}return t.minus(i).abs()}function T(e,t,r,n){var i,o,s,c,f,p,h,m,d,g=e.constructor,v=void 0!==r;if(v?(a(r,1,ye),void 0===n?n=g.rounding:a(n,0,8)):(r=g.precision,n=g.rounding),e.isFinite()){for(h=l(e),s=h.indexOf("."),v?(i=2,16==t?r=4*r-3:8==t&&(r=3*r-2)):i=t,s>=0&&(h=h.replace(".",""),d=new g(1),d.e=h.length-s,d.d=u(l(d),10,i),d.e=d.d.length),m=u(h,10,i),o=f=m.length;0==m[--f];)m.pop();if(m[0]){if(0>s?o--:(e=new g(e),e.d=m,e.e=o,e=je(e,d,r,n,0,i),m=e.d,o=e.e,p=de),s=m[r],c=i/2,p=p||void 0!==m[r+1],p=4>n?(void 0!==s||p)&&(0===n||n===(e.s<0?3:2)):s>c||s===c&&(4===n||p||6===n&&1&m[r-1]||n===(e.s<0?8:7)),m.length=r,p)for(;++m[--r]>i-1;)m[r]=0,r||(++o,m.unshift(1));for(f=m.length;!m[f-1];--f);for(s=0,h="";f>s;s++)h+=xe.charAt(m[s]);if(v){if(f>1)if(16==t||8==t){for(s=16==t?4:3,--f;f%s;f++)h+="0";for(m=u(h,i,t),f=m.length;!m[f-1];--f);for(s=1,h="1.";f>s;s++)h+=xe.charAt(m[s])}else h=h.charAt(0)+"."+h.slice(1);h=h+(0>o?"p":"p+")+o}else if(0>o){for(;++o;)h="0"+h;h="0."+h}else if(++o>f)for(o-=f;o--;)h+="0";else f>o&&(h=h.slice(0,o)+"."+h.slice(o))}else h=v?"0p+0":"0";h=(16==t?"0x":2==t?"0b":8==t?"0o":"")+h}else h=N(e);return e.s<0?"-"+h:h}function C(e,t){return e.length>t?(e.length=t,!0):void 0}function S(e){return new this(e).abs()}function z(e){return new this(e).acos()}function B(e){return new this(e).acosh()}function k(e,t){return new this(e).plus(t)}function I(e){return new this(e).asin()}function P(e){return new this(e).asinh()}function R(e){return new this(e).atan()}function U(e){return new this(e).atanh()}function q(e,t){e=new this(e),t=new this(t);var r,n=this.precision,i=this.rounding,o=n+4;return e.s&&t.s?e.d||t.d?!t.d||e.isZero()?(r=t.s<0?m(this,n,i):new this(0),r.s=e.s):!e.d||t.isZero()?(r=m(this,o,1).times(.5),r.s=e.s):t.s<0?(this.precision=o,this.rounding=1,r=this.atan(je(e,t,o,1)),t=m(this,o,1),this.precision=n,this.rounding=i,r=e.s<0?r.minus(t):r.plus(t)):r=this.atan(je(e,t,o,1)):(r=m(this,o,1).times(t.s>0?.25:.75),r.s=e.s):r=new this(NaN),r}function L(e){return new this(e).cbrt()}function j(e){return f(e=new this(e),e.e+1,2)}function F(e){if(!e||"object"!=typeof e)throw Error(Ae+"Object expected");var t,r,n,i=["precision",1,ye,"rounding",0,8,"toExpNeg",-ve,0,"toExpPos",0,ve,"maxE",0,ve,"minE",-ve,0,"modulo",0,9];for(t=0;t<i.length;t+=3)if(void 0!==(n=e[r=i[t]])){if(!(Te(n)===n&&n>=i[t+1]&&n<=i[t+2]))throw Error(Oe+r+": "+n);this[r]=n}if(e.hasOwnProperty(r="crypto"))if(void 0===(n=e[r]))this[r]=n;else{if(n!==!0&&n!==!1&&0!==n&&1!==n)throw Error(Oe+r+": "+n);this[r]=!(!n||!Ee||!Ee.getRandomValues&&!Ee.randomBytes)}return this}function D(e){return new this(e).cos()}function $(e){return new this(e).cosh()}function G(e){function t(e){var r,n,i,o=this;if(!(o instanceof t))return new t(e);if(o.constructor=t,e instanceof t)return o.s=e.s,o.e=e.e,void(o.d=(e=e.d)?e.slice():e);if(i=typeof e,"number"===i){if(0===e)return o.s=0>1/e?-1:1,o.e=0,void(o.d=[0]);if(0>e?(e=-e,o.s=-1):o.s=1,e===~~e&&1e7>e){for(r=0,n=e;n>=10;n/=10)r++;return o.e=r,void(o.d=[e])}return 0*e!==0?(e||(o.s=NaN),o.e=NaN,void(o.d=null)):E(o,e.toString())}if("string"!==i)throw Error(Oe+e);return 45===e.charCodeAt(0)?(e=e.slice(1),o.s=-1):o.s=1,ke.test(e)?E(o,e):M(o,e)}var r,n,i;if(t.prototype=Le,t.ROUND_UP=0,t.ROUND_DOWN=1,t.ROUND_CEIL=2,t.ROUND_FLOOR=3,t.ROUND_HALF_UP=4,t.ROUND_HALF_DOWN=5,t.ROUND_HALF_EVEN=6,t.ROUND_HALF_CEIL=7,t.ROUND_HALF_FLOOR=8,t.EUCLID=9,t.config=F,t.clone=G,t.abs=S,t.acos=z,t.acosh=B,t.add=k,t.asin=I,t.asinh=P,t.atan=R,t.atanh=U,t.atan2=q,t.cbrt=L,t.ceil=j,t.cos=D,t.cosh=$,t.div=H,t.exp=Z,t.floor=V,t.fromJSON=Y,t.hypot=W,t.ln=X,t.log=J,t.log10=K,t.log2=Q,t.max=ee,t.min=te,t.mod=re,t.mul=ne,t.pow=ie,t.random=oe,t.round=ae,t.sign=se,t.sin=ue,t.sinh=ce,t.sqrt=fe,t.sub=le,t.tan=pe,t.tanh=he,t.trunc=me,void 0===e&&(e={}),e)for(i=["precision","rounding","toExpNeg","toExpPos","maxE","minE","modulo","crypto"],r=0;r<i.length;)e.hasOwnProperty(n=i[r++])||(e[n]=this[n]);return t.config(e),t}function H(e,t){return new this(e).div(t)}function Z(e){return new this(e).exp()}function V(e){return f(e=new this(e),e.e+1,3)}function Y(e){var t,r,n,i;if("string"!=typeof e||!e)throw Error(Oe+e);if(n=e.length,i=xe.indexOf(e.charAt(0)),1===n)return new this(i>81?[-1/0,1/0,NaN][i-82]:i>40?-(i-41):i);if(64&i)r=16&i,t=r?(7&i)-3:(15&i)-7,n=1;else{if(2===n)return i=88*i+xe.indexOf(e.charAt(1)),new this(i>=2816?-(i-2816)-41:i+41);if(r=32&i,!(31&i))return e=u(e.slice(1),88,10).join(""),new this(r?"-"+e:e);t=15&i,n=t+1,t=1===t?xe.indexOf(e.charAt(1)):2===t?88*xe.indexOf(e.charAt(1))+xe.indexOf(e.charAt(2)):+u(e.slice(1,n),88,10).join(""),16&i&&(t=-t)}return e=u(e.slice(n),88,10).join(""),t=t-e.length+1,e=e+"e"+t,new this(r?"-"+e:e)}function W(){var e,t,r=new this(0);for(Me=!1,e=0;e<arguments.length;)if(t=new this(arguments[e++]),t.d)r.d&&(r=r.plus(t.times(t)));else{if(t.s)return Me=!0,new this(1/0);r=t}return Me=!0,r.sqrt()}function X(e){return new this(e).ln()}function J(e,t){return new this(e).log(t)}function Q(e){return new this(e).log(2)}function K(e){return new this(e).log(10)}function ee(){return x(this,arguments,"lt")}function te(){return x(this,arguments,"gt")}function re(e,t){return new this(e).mod(t)}function ne(e,t){return new this(e).mul(t)}function ie(e,t){return new this(e).pow(t)}function oe(e){var t,r,n,i,o=0,s=new this(1),u=[];if(void 0===e?e=this.precision:a(e,1,ye),n=Math.ceil(e/Pe),this.crypto===!1)for(;n>o;)u[o++]=1e7*Math.random()|0;else if(Ee&&Ee.getRandomValues)for(t=Ee.getRandomValues(new Uint32Array(n));n>o;)i=t[o],i>=429e7?t[o]=Ee.getRandomValues(new Uint32Array(1))[0]:u[o++]=i%1e7;else if(Ee&&Ee.randomBytes){for(t=Ee.randomBytes(n*=4);n>o;)i=t[o]+(t[o+1]<<8)+(t[o+2]<<16)+((127&t[o+3])<<24),i>=214e7?Ee.randomBytes(4).copy(t,o):(u.push(i%1e7),o+=4);o=n/4}else{if(this.crypto)throw Error(Ae+"crypto unavailable");for(;n>o;)u[o++]=1e7*Math.random()|0}for(n=u[--o],e%=Pe,n&&e&&(i=Ce(10,Pe-e),u[o]=(n/i|0)*i);0===u[o];o--)u.pop();if(0>o)r=0,u=[0];else{for(r=-1;0===u[0];r-=Pe)u.shift();for(n=1,i=u[0];i>=10;i/=10)n++;Pe>n&&(r-=Pe-n)}return s.e=r,s.d=u,s}function ae(e){return f(e=new this(e),e.e+1,this.rounding)}function se(e){return e=new this(e),e.d?e.d[0]?e.s:0*e.s:e.s||NaN}function ue(e){return new this(e).sin()}function ce(e){return new this(e).sinh()}function fe(e){return new this(e).sqrt()}function le(e,t){return new this(e).sub(t)}function pe(e){return new this(e).tan()}function he(e){return new this(e).tanh()}function me(e){return f(e=new this(e),e.e+1,1)}var de,ge,ve=9e15,ye=1e9,xe="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./:;=?@[]^_`{|}~",be="2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058",we="3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789",Ne={precision:20,rounding:4,modulo:1,toExpNeg:-7,toExpPos:21,minE:-ve,maxE:ve,crypto:void 0},Ee="undefined"!=typeof crypto?crypto:null,Me=!0,Ae="[DecimalError] ",Oe=Ae+"Invalid argument: ",_e=Ae+"Precision limit exceeded",Te=Math.floor,Ce=Math.pow,Se=/^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,ze=/^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,Be=/^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,ke=/^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,Ie=1e7,Pe=7,Re=9007199254740991,Ue=be.length-1,qe=we.length-1,Le={};Le.absoluteValue=Le.abs=function(){var e=new this.constructor(this);return e.s<0&&(e.s=1),f(e)},Le.ceil=function(){return f(new this.constructor(this),this.e+1,2)},Le.comparedTo=Le.cmp=function(e){var t,r,n,i,o=this,a=o.d,s=(e=new o.constructor(e)).d,u=o.s,c=e.s;if(!a||!s)return u&&c?u!==c?u:a===s?0:!a^0>u?1:-1:NaN;if(!a[0]||!s[0])return a[0]?u:s[0]?-c:0;if(u!==c)return u;if(o.e!==e.e)return o.e>e.e^0>u?1:-1;for(n=a.length,i=s.length,t=0,r=i>n?n:i;r>t;++t)if(a[t]!==s[t])return a[t]>s[t]^0>u?1:-1;return n===i?0:n>i^0>u?1:-1},Le.cosine=Le.cos=function(){var e,t,r=this,n=r.constructor;return r.d?r.d[0]?(e=n.precision,t=n.rounding,n.precision=e+Math.max(r.e,r.sd())+Pe,n.rounding=1,r=c(n,_(n,r)),n.precision=e,n.rounding=t,f(2==ge||3==ge?r.neg():r,e,t,!0)):new n(1):new n(NaN)},Le.cubeRoot=Le.cbrt=function(){var e,t,r,n,i,a,s,u,c,l,p=this,h=p.constructor;if(!p.isFinite()||p.isZero())return new h(p);for(Me=!1,a=p.s*Math.pow(p.s*p,1/3),a&&Math.abs(a)!=1/0?n=new h(a.toString()):(r=o(p.d),e=p.e,(a=(e-r.length+1)%3)&&(r+=1==a||-2==a?"0":"00"),a=Math.pow(r,1/3),e=Te((e+1)/3)-(e%3==(0>e?-1:2)),a==1/0?r="5e"+e:(r=a.toExponential(),r=r.slice(0,r.indexOf("e")+1)+e),n=new h(r),n.s=p.s),s=(e=h.precision)+3;;)if(u=n,c=u.times(u).times(u),l=c.plus(p),n=je(l.plus(p).times(u),l.plus(c),s+2,1),o(u.d).slice(0,s)===(r=o(n.d)).slice(0,s)){if(r=r.slice(s-3,s+1),"9999"!=r&&(i||"4999"!=r)){+r&&(+r.slice(1)||"5"!=r.charAt(0))||(f(n,e+1,1),t=!n.times(n).times(n).eq(p));break}if(!i&&(f(u,e+1,0),u.times(u).times(u).eq(p))){n=u;break}s+=4,i=1}return Me=!0,f(n,e,h.rounding,t)},Le.decimalPlaces=Le.dp=function(){var e,t=this.d,r=NaN;if(t){if(e=t.length-1,r=(e-Te(this.e/Pe))*Pe,e=t[e])for(;e%10==0;e/=10)r--;0>r&&(r=0)}return r},Le.dividedBy=Le.div=function(e){return je(this,new this.constructor(e))},Le.dividedToIntegerBy=Le.divToInt=function(e){var t=this,r=t.constructor;return f(je(t,new r(e),0,1,1),r.precision,r.rounding)},Le.equals=Le.eq=function(e){return 0===this.cmp(e)},Le.floor=function(){return f(new this.constructor(this),this.e+1,3)},Le.greaterThan=Le.gt=function(e){return this.cmp(e)>0},Le.greaterThanOrEqualTo=Le.gte=function(e){var t=this.cmp(e);return 1==t||0===t},Le.hyperbolicCosine=Le.cosh=function(){var e,t,r,n,i,o=this,a=o.constructor,s=new a(1);if(!o.isFinite())return new a(o.s?1/0:NaN);if(o.isZero())return s;r=a.precision,n=a.rounding,a.precision=r+Math.max(o.e,o.sd())+4,a.rounding=1,i=o.d.length,32>i?(e=Math.ceil(i/3),t=Math.pow(4,-e).toString()):(e=16,t="2.3283064365386962890625e-10"),o=O(a,1,o.times(t),new a(1),!0);for(var u,c=e,l=new a(8);c--;)u=o.times(o),o=s.minus(u.times(l.minus(u.times(l))));return f(o,a.precision=r,a.rounding=n,!0)},Le.hyperbolicSine=Le.sinh=function(){var e,t,r,n,i=this,o=i.constructor;if(!i.isFinite()||i.isZero())return new o(i);if(t=o.precision,r=o.rounding,o.precision=t+Math.max(i.e,i.sd())+4,o.rounding=1,n=i.d.length,3>n)i=O(o,2,i,i,!0);else{e=1.4*Math.sqrt(n),e=e>16?16:0|e,i=i.times(Math.pow(5,-e)),i=O(o,2,i,i,!0);for(var a,s=new o(5),u=new o(16),c=new o(20);e--;)a=i.times(i),i=i.times(s.plus(a.times(u.times(a).plus(c))))}return o.precision=t,o.rounding=r,f(i,t,r,!0)},Le.hyperbolicTangent=Le.tanh=function(){var e,t,r=this,n=r.constructor;return r.isFinite()?r.isZero()?new n(r):(e=n.precision,t=n.rounding,n.precision=e+7,n.rounding=1,je(r.sinh(),r.cosh(),n.precision=e,n.rounding=t)):new n(r.s)},Le.inverseCosine=Le.acos=function(){var e,t=this,r=t.constructor,n=t.abs().cmp(1),i=r.precision,o=r.rounding;return-1!==n?0===n?t.isNeg()?m(r,i,o):new r(0):new r(NaN):t.isZero()?m(r,i+4,o).times(.5):(r.precision=i+6,r.rounding=1,t=t.asin(),e=m(r,i+4,o).times(.5),r.precision=i,r.rounding=o,e.minus(t))},Le.inverseHyperbolicCosine=Le.acosh=function(){var e,t,r=this,n=r.constructor;return r.lte(1)?new n(r.eq(1)?0:NaN):r.isFinite()?(e=n.precision,t=n.rounding,n.precision=e+Math.max(Math.abs(r.e),r.sd())+4,n.rounding=1,Me=!1,r=r.times(r).minus(1).sqrt().plus(r),Me=!0,n.precision=e,n.rounding=t,r.ln()):new n(r)},Le.inverseHyperbolicSine=Le.asinh=function(){var e,t,r=this,n=r.constructor;return!r.isFinite()||r.isZero()?new n(r):(e=n.precision,t=n.rounding,n.precision=e+2*Math.max(Math.abs(r.e),r.sd())+6,n.rounding=1,Me=!1,r=r.times(r).plus(1).sqrt().plus(r),Me=!0,n.precision=e,n.rounding=t,r.ln())},Le.inverseHyperbolicTangent=Le.atanh=function(){var e,t,r,n,i=this,o=i.constructor;return i.isFinite()?i.e>=0?new o(i.abs().eq(1)?i.s/0:i.isZero()?i:NaN):(e=o.precision,t=o.rounding,n=i.sd(),Math.max(n,e)<2*-i.e-1?f(new o(i),e,t,!0):(o.precision=r=n-i.e,i=je(i.plus(1),new o(1).minus(i),r+e,1),o.precision=e+4,o.rounding=1,i=i.ln(),o.precision=e,o.rounding=t,i.times(.5))):new o(NaN)},Le.inverseSine=Le.asin=function(){var e,t,r,n,i=this,o=i.constructor;return i.isZero()?new o(i):(t=i.abs().cmp(1),r=o.precision,n=o.rounding,-1!==t?0===t?(e=m(o,r+4,n).times(.5),e.s=i.s,e):new o(NaN):(o.precision=r+6,o.rounding=1,i=i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(),o.precision=r,o.rounding=n,i.times(2)))},Le.inverseTangent=Le.atan=function(){var e,t,r,n,i,o,a,s,u,c=this,l=c.constructor,p=l.precision,h=l.rounding;if(c.isFinite()){if(c.isZero())return new l(c);if(c.abs().eq(1)&&qe>=p+4)return a=m(l,p+4,h).times(.25),a.s=c.s,a}else{if(!c.s)return new l(NaN);if(qe>=p+4)return a=m(l,p+4,h).times(.5),a.s=c.s,a}for(l.precision=s=p+10,l.rounding=1,r=Math.min(28,s/Pe+2|0),e=r;e;--e)c=c.div(c.times(c).plus(1).sqrt().plus(1));for(Me=!1,t=Math.ceil(s/Pe),n=1,u=c.times(c),a=new l(c),i=c;-1!==e;)if(i=i.times(u),o=a.minus(i.div(n+=2)),i=i.times(u),a=o.plus(i.div(n+=2)),void 0!==a.d[t])for(e=t;a.d[e]===o.d[e]&&e--;);return r&&(a=a.times(2<<r-1)),Me=!0,f(a,l.precision=p,l.rounding=h,!0)},Le.isFinite=function(){return!!this.d},Le.isInteger=Le.isInt=function(){return!!this.d&&Te(this.e/Pe)>this.d.length-2},Le.isNaN=function(){return!this.s},Le.isNegative=Le.isNeg=function(){return this.s<0},Le.isPositive=Le.isPos=function(){return this.s>0},Le.isZero=function(){return!!this.d&&0===this.d[0]},Le.lessThan=Le.lt=function(e){return this.cmp(e)<0},Le.lessThanOrEqualTo=Le.lte=function(e){return this.cmp(e)<1},Le.logarithm=Le.log=function(e){var t,r,n,i,a,u,c,l,p=this,m=p.constructor,d=m.precision,g=m.rounding,v=5;if(null==e)e=new m(10),t=!0;else{if(e=new m(e),r=e.d,e.s<0||!r||!r[0]||e.eq(1))return new m(NaN);t=e.eq(10)}if(r=p.d,p.s<0||!r||!r[0]||p.eq(1))return new m(r&&!r[0]?-1/0:1!=p.s?NaN:r?0:1/0);if(t)if(r.length>1)a=!0;else{for(i=r[0];i%10===0;)i/=10;a=1!==i}if(Me=!1,c=d+v,u=w(p,c),n=t?h(m,c+10):w(e,c),l=je(u,n,c,1),s(l.d,i=d,g))do if(c+=10,u=w(p,c),n=t?h(m,c+10):w(e,c),l=je(u,n,c,1),!a){+o(l.d).slice(i+1,i+15)+1==1e14&&(l=f(l,d+1,0));break}while(s(l.d,i+=10,g));return Me=!0,f(l,d,g)},Le.minus=Le.sub=function(e){var t,r,n,i,o,a,s,u,c,l,h,m,d=this,g=d.constructor;if(e=new g(e),!d.d||!e.d)return d.s&&e.s?d.d?e.s=-e.s:e=new g(e.d||d.s!==e.s?d:NaN):e=new g(NaN),e;if(d.s!=e.s)return e.s=-e.s,d.plus(e);if(c=d.d,m=e.d,s=g.precision,u=g.rounding,!c[0]||!m[0]){if(m[0])e.s=-e.s;else{if(!c[0])return new g(3===u?-0:0);e=new g(d)}return Me?f(e,s,u):e}if(r=Te(e.e/Pe),l=Te(d.e/Pe),c=c.slice(),o=l-r){for(h=0>o,h?(t=c,o=-o,a=m.length):(t=m,r=l,a=c.length),n=Math.max(Math.ceil(s/Pe),a)+2,o>n&&(o=n,t.length=1),t.reverse(),n=o;n--;)t.push(0);t.reverse()}else{for(n=c.length,a=m.length,h=a>n,h&&(a=n),n=0;a>n;n++)if(c[n]!=m[n]){h=c[n]<m[n];break}o=0}for(h&&(t=c,c=m,m=t,e.s=-e.s),a=c.length,n=m.length-a;n>0;--n)c[a++]=0;for(n=m.length;n>o;){if(c[--n]<m[n]){for(i=n;i&&0===c[--i];)c[i]=Ie-1;--c[i],c[n]+=Ie}c[n]-=m[n]}for(;0===c[--a];)c.pop();for(;0===c[0];c.shift())--r;return c[0]?(e.d=c,e.e=p(c,r),Me?f(e,s,u):e):new g(3===u?-0:0)},Le.modulo=Le.mod=function(e){var t,r=this,n=r.constructor;return e=new n(e),!r.d||!e.s||e.d&&!e.d[0]?new n(NaN):!e.d||r.d&&!r.d[0]?f(new n(r),n.precision,n.rounding):(Me=!1,9==n.modulo?(t=je(r,e.abs(),0,3,1),t.s*=e.s):t=je(r,e,0,n.modulo,1),t=t.times(e),Me=!0,r.minus(t))},Le.naturalExponential=Le.exp=function(){return b(this)},Le.naturalLogarithm=Le.ln=function(){return w(this)},Le.negated=Le.neg=function(){var e=new this.constructor(this);return e.s=-e.s,f(e)},Le.plus=Le.add=function(e){var t,r,n,i,o,a,s,u,c,l,h=this,m=h.constructor;if(e=new m(e),!h.d||!e.d)return h.s&&e.s?h.d||(e=new m(e.d||h.s===e.s?h:NaN)):e=new m(NaN),e;if(h.s!=e.s)return e.s=-e.s,h.minus(e);if(c=h.d,l=e.d,s=m.precision,u=m.rounding,!c[0]||!l[0])return l[0]||(e=new m(h)),Me?f(e,s,u):e;if(o=Te(h.e/Pe),n=Te(e.e/Pe),c=c.slice(),i=o-n){for(0>i?(r=c,i=-i,a=l.length):(r=l,n=o,a=c.length),o=Math.ceil(s/Pe),a=o>a?o+1:a+1,i>a&&(i=a,r.length=1),r.reverse();i--;)r.push(0);r.reverse()}for(a=c.length,i=l.length,0>a-i&&(i=a,r=l,l=c,c=r),t=0;i;)t=(c[--i]=c[i]+l[i]+t)/Ie|0,c[i]%=Ie;for(t&&(c.unshift(t),++n),a=c.length;0==c[--a];)c.pop();return e.d=c,e.e=p(c,n),Me?f(e,s,u):e},Le.precision=Le.sd=function(e){var t,r=this;if(void 0!==e&&e!==!!e&&1!==e&&0!==e)throw Error(Oe+e);return r.d?(t=d(r.d),e&&r.e+1>t&&(t=r.e+1)):t=NaN,t},Le.round=function(){var e=this,t=e.constructor;return f(new t(e),e.e+1,t.rounding)},Le.sine=Le.sin=function(){var e,t,r=this,n=r.constructor;return r.isFinite()?r.isZero()?new n(r):(e=n.precision,t=n.rounding,n.precision=e+Math.max(r.e,r.sd())+Pe,n.rounding=1,r=A(n,_(n,r)),n.precision=e,n.rounding=t,f(ge>2?r.neg():r,e,t,!0)):new n(NaN)},Le.squareRoot=Le.sqrt=function(){var e,t,r,n,i,a,s=this,u=s.d,c=s.e,l=s.s,p=s.constructor;if(1!==l||!u||!u[0])return new p(!l||0>l&&(!u||u[0])?NaN:u?s:1/0);for(Me=!1,l=Math.sqrt(+s),0==l||l==1/0?(t=o(u),(t.length+c)%2==0&&(t+="0"),l=Math.sqrt(t),c=Te((c+1)/2)-(0>c||c%2),l==1/0?t="1e"+c:(t=l.toExponential(),t=t.slice(0,t.indexOf("e")+1)+c),n=new p(t)):n=new p(l.toString()),r=(c=p.precision)+3;;)if(a=n,n=a.plus(je(s,a,r+2,1)).times(.5),o(a.d).slice(0,r)===(t=o(n.d)).slice(0,r)){if(t=t.slice(r-3,r+1),"9999"!=t&&(i||"4999"!=t)){+t&&(+t.slice(1)||"5"!=t.charAt(0))||(f(n,c+1,1),e=!n.times(n).eq(s));break}if(!i&&(f(a,c+1,0),a.times(a).eq(s))){n=a;break}r+=4,i=1}return Me=!0,f(n,c,p.rounding,e)},Le.tangent=Le.tan=function(){var e,t,r=this,n=r.constructor;return r.isFinite()?r.isZero()?new n(r):(e=n.precision,t=n.rounding,n.precision=e+10,n.rounding=1,r=r.sin(),r.s=1,r=je(r,new n(1).minus(r.times(r)).sqrt(),e+10,0),n.precision=e,n.rounding=t,f(2==ge||4==ge?r.neg():r,e,t,!0)):new n(NaN)},Le.times=Le.mul=function(e){var t,r,n,i,o,a,s,u,c,l=this,h=l.constructor,m=l.d,d=(e=new h(e)).d;if(e.s*=l.s,!(m&&m[0]&&d&&d[0]))return new h(!e.s||m&&!m[0]&&!d||d&&!d[0]&&!m?NaN:m&&d?0*e.s:e.s/0);for(r=Te(l.e/Pe)+Te(e.e/Pe),u=m.length,c=d.length,c>u&&(o=m,m=d,d=o,a=u,u=c,c=a),o=[],a=u+c,n=a;n--;)o.push(0);for(n=c;--n>=0;){for(t=0,i=u+n;i>n;)s=o[i]+d[n]*m[i-n-1]+t,o[i--]=s%Ie|0,t=s/Ie|0;o[i]=(o[i]+t)%Ie|0}for(;!o[--a];)o.pop();for(t?++r:o.shift(),n=o.length;!o[--n];)o.pop();return e.d=o,e.e=p(o,r),Me?f(e,h.precision,h.rounding):e},Le.toBinary=function(e,t){return T(this,2,e,t)},Le.toDecimalPlaces=Le.toDP=function(e,t){var r=this,n=r.constructor;return r=new n(r),void 0===e?r:(a(e,0,ye),void 0===t?t=n.rounding:a(t,0,8),f(r,e+r.e+1,t))},Le.toExponential=function(e,t){var r,n=this,i=n.constructor;return void 0===e?r=l(n,!0):(a(e,0,ye),void 0===t?t=i.rounding:a(t,0,8),n=f(new i(n),e+1,t),r=l(n,!0,e+1)),n.isNeg()&&!n.isZero()?"-"+r:r},Le.toFixed=function(e,t){var r,n,i=this,o=i.constructor;return void 0===e?r=l(i):(a(e,0,ye),void 0===t?t=o.rounding:a(t,0,8),n=f(new o(i),e+i.e+1,t),r=l(n,!1,e+n.e+1)),i.isNeg()&&!i.isZero()?"-"+r:r},Le.toFraction=function(e){var t,r,n,i,a,s,u,c,f,l,p,h,m=this,g=m.d,v=m.constructor;if(!g)return new v(m);if(f=r=new v(1),n=c=new v(0),t=new v(n),a=t.e=d(g)-m.e-1,s=a%Pe,t.d[0]=Ce(10,0>s?Pe+s:s),null==e)e=a>0?t:f;else{if(u=new v(e),!u.isInt()||u.lt(f))throw Error(Oe+u);e=u.gt(t)?a>0?t:f:u}for(Me=!1,u=new v(o(g)),l=v.precision,v.precision=a=g.length*Pe*2;p=je(u,t,0,1,1),i=r.plus(p.times(n)),1!=i.cmp(e);)r=n,n=i,i=f,f=c.plus(p.times(i)),c=i,i=t,t=u.minus(p.times(i)),u=i;return i=je(e.minus(r),n,0,1,1),c=c.plus(i.times(f)),r=r.plus(i.times(n)),c.s=f.s=m.s,h=je(f,n,a,1).minus(m).abs().cmp(je(c,r,a,1).minus(m).abs())<1?[f,n]:[c,r],v.precision=l,Me=!0,h},Le.toHexadecimal=Le.toHex=function(e,t){return T(this,16,e,t)},Le.toJSON=function(){var e,t,r,n,i,a,s,c,f=this,l=f.s<0;if(!f.d)return xe.charAt(f.s?l?82:83:84);if(t=f.e,1===f.d.length&&4>t&&t>=0&&(a=f.d[0],2857>a))return 41>a?xe.charAt(l?a+41:a):(a-=41,l&&(a+=2816),n=a/88|0,xe.charAt(n)+xe.charAt(a-88*n));if(c=o(f.d),s="",!l&&8>=t&&t>=-7)n=64+t+7;else if(l&&4>=t&&t>=-3)n=80+t+3;else if(c.length===t+1)n=32*l;else if(n=32*l+16*(0>t),t=Math.abs(t),88>t)n+=1,s=xe.charAt(t);else if(7744>t)n+=2,a=t/88|0,s=xe.charAt(a)+xe.charAt(t-88*a);else for(e=u(String(t),10,88),i=e.length,n+=i,r=0;i>r;r++)s+=xe.charAt(e[r]);for(s=xe.charAt(n)+s,e=u(c,10,88),i=e.length,r=0;i>r;r++)s+=xe.charAt(e[r]);return s},Le.toNearest=function(e,t){var r=this,n=r.constructor;if(r=new n(r),null==e){if(!r.d)return r;e=new n(1),t=n.rounding}else{if(e=new n(e),void 0!==t&&a(t,0,8),!r.d)return e.s?r:e;if(!e.d)return e.s&&(e.s=r.s),e}return e.d[0]?(Me=!1,4>t&&(t=[4,5,7,8][t]),r=je(r,e,0,t,1).times(e),Me=!0,f(r)):(e.s=r.s,r=e),r},Le.toNumber=function(){return+this},Le.toOctal=function(e,t){return T(this,8,e,t)},Le.toPower=Le.pow=function(e){var t,r,n,i,a,u,c,l=this,p=l.constructor,h=+(e=new p(e));if(!(l.d&&e.d&&l.d[0]&&e.d[0]))return new p(Ce(+l,h));if(l=new p(l),l.eq(1))return l;if(n=p.precision,a=p.rounding,e.eq(1))return f(l,n,a);if(t=Te(e.e/Pe),r=e.d.length-1,c=t>=r,u=l.s,c){if((r=0>h?-h:h)<=Re)return i=v(p,l,r,n),e.s<0?new p(1).div(i):f(i,n,a)}else if(0>u)return new p(NaN);return u=0>u&&1&e.d[Math.max(t,r)]?-1:1,r=Ce(+l,h),t=0!=r&&isFinite(r)?new p(r+"").e:Te(h*(Math.log("0."+o(l.d))/Math.LN10+l.e+1)),t>p.maxE+1||t<p.minE-1?new p(t>0?u/0:0):(Me=!1,p.rounding=l.s=1,r=Math.min(12,(t+"").length),i=b(e.times(w(l,n+r)),n),i=f(i,n+5,1),s(i.d,n,a)&&(t=n+10,i=f(b(e.times(w(l,t+r)),t),t+5,1),+o(i.d).slice(n+1,n+15)+1==1e14&&(i=f(i,n+1,0))),i.s=u,Me=!0,p.rounding=a,f(i,n,a))},Le.toPrecision=function(e,t){var r,n=this,i=n.constructor;return void 0===e?r=l(n,n.e<=i.toExpNeg||n.e>=i.toExpPos):(a(e,1,ye),void 0===t?t=i.rounding:a(t,0,8),n=f(new i(n),e,t),r=l(n,e<=n.e||n.e<=i.toExpNeg,e)),n.isNeg()&&!n.isZero()?"-"+r:r},Le.toSignificantDigits=Le.toSD=function(e,t){var r=this,n=r.constructor;return void 0===e?(e=n.precision,t=n.rounding):(a(e,1,ye),void 0===t?t=n.rounding:a(t,0,8)),f(new n(r),e,t)},Le.toString=function(){var e=this,t=e.constructor,r=l(e,e.e<=t.toExpNeg||e.e>=t.toExpPos);return e.isNeg()&&!e.isZero()?"-"+r:r},Le.truncated=Le.trunc=function(){return f(new this.constructor(this),this.e+1,1)},Le.valueOf=function(){var e=this,t=e.constructor,r=l(e,e.e<=t.toExpNeg||e.e>=t.toExpPos);return e.isNeg()?"-"+r:r};var je=function(){function e(e,t,r){var n,i=0,o=e.length;for(e=e.slice();o--;)n=e[o]*t+i,e[o]=n%r|0,i=n/r|0;return i&&e.unshift(i),e}function t(e,t,r,n){var i,o;if(r!=n)o=r>n?1:-1;else for(i=o=0;r>i;i++)if(e[i]!=t[i]){o=e[i]>t[i]?1:-1;break}return o}function r(e,t,r,n){for(var i=0;r--;)e[r]-=i,i=e[r]<t[r]?1:0,e[r]=i*n+e[r]-t[r];for(;!e[0]&&e.length>1;)e.shift()}return function(n,i,o,a,s,u){var c,l,p,h,m,d,g,v,y,x,b,w,N,E,M,A,O,_,T,C,S=n.constructor,z=n.s==i.s?1:-1,B=n.d,k=i.d;if(!(B&&B[0]&&k&&k[0]))return new S(n.s&&i.s&&(B?!k||B[0]!=k[0]:k)?B&&0==B[0]||!k?0*z:z/0:NaN);for(u?(m=1,l=n.e-i.e):(u=Ie,m=Pe,l=Te(n.e/m)-Te(i.e/m)),T=k.length,O=B.length,y=new S(z),x=y.d=[],p=0;k[p]==(B[p]||0);p++);if(k[p]>(B[p]||0)&&l--,null==o?(E=o=S.precision,a=S.rounding):E=s?o+(n.e-i.e)+1:o,0>E)x.push(1),d=!0;else{if(E=E/m+2|0,p=0,1==T){for(h=0,k=k[0],E++;(O>p||h)&&E--;p++)M=h*u+(B[p]||0),x[p]=M/k|0,h=M%k|0;d=h||O>p}else{for(h=u/(k[0]+1)|0,h>1&&(k=e(k,h,u),B=e(B,h,u),T=k.length,O=B.length),A=T,b=B.slice(0,T),w=b.length;T>w;)b[w++]=0;C=k.slice(),C.unshift(0),_=k[0],k[1]>=u/2&&++_;do h=0,c=t(k,b,T,w),0>c?(N=b[0],T!=w&&(N=N*u+(b[1]||0)),h=N/_|0,h>1?(h>=u&&(h=u-1),g=e(k,h,u),v=g.length,w=b.length,c=t(g,b,v,w),1==c&&(h--,r(g,v>T?C:k,v,u))):(0==h&&(c=h=1),g=k.slice()),v=g.length,w>v&&g.unshift(0),r(b,g,w,u),-1==c&&(w=b.length,c=t(k,b,T,w),1>c&&(h++,r(b,w>T?C:k,w,u))),w=b.length):0===c&&(h++,b=[0]),x[p++]=h,c&&b[0]?b[w++]=B[A]||0:(b=[B[A]],w=1);while((A++<O||void 0!==b[0])&&E--);d=void 0!==b[0]}x[0]||x.shift()}if(1==m)y.e=l,de=d;else{for(p=1,h=x[0];h>=10;h/=10)p++;y.e=p+l*m-1,f(y,s?o+y.e+1:o,a,d)}return y}}();Ne=G(Ne),be=new Ne(be),we=new Ne(we),n=function(){return Ne}.call(t,r,t,e),!(void 0!==n&&(e.exports=n))}(this)},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("bignumber",{"":function(){return new e.BigNumber(0)},number:function(t){return new e.BigNumber(t+"")},string:function(t){return new e.BigNumber(t)},BigNumber:function(e){return e},Fraction:function(t){return new e.BigNumber(t.n).div(t.d)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={0:"0",1:"\\left(${args[0]}\\right)"},o}var i=r(19);t.name="bignumber",t.factory=n},function(e,t){"use strict";e.exports=function r(e,t,n){return e&&"function"==typeof e.map?e.map(function(e){return r(e,t,n)}):t(e)}},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("bool",{"":function(){return!1},"boolean":function(e){return e},number:function(e){return!!e},BigNumber:function(e){return!e.isZero()},string:function(e){var t=e.toLowerCase();if("true"===t)return!0;if("false"===t)return!1;var r=Number(e);if(""!=e&&!isNaN(r))return!!r;throw new Error('Cannot convert "'+e+'" to a boolean')},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);t.name="boolean",t.factory=n},function(e,t,r){e.exports=[r(22),r(25)]},function(e,t,r){"use strict";function n(e,t,r,n,a){function s(e){if(!(this instanceof s))throw new SyntaxError("Constructor must be called with the new operator");e&&e.isChain?this.value=e.value:this.value=e}function u(e,t){"function"==typeof t&&(s.prototype[e]=f(t))}function c(e,t){o(s.prototype,e,function(){var e=t();return"function"==typeof e?f(e):void 0})}function f(e){return function(){for(var t=[this.value],r=0;r<arguments.length;r++)t[r+1]=arguments[r];return new s(e.apply(e,t))}}return s.prototype.type="Chain",s.prototype.isChain=!0,s.prototype.done=function(){return this.value},s.prototype.valueOf=function(){return this.value},s.prototype.toString=function(){return i(this.value)},s.createProxy=function(e,t){if("string"==typeof e)u(e,t);else for(var r in e)e.hasOwnProperty(r)&&u(r,e[r])},s.createProxy(a),a.on("import",function(e,t,r){void 0===r&&c(e,t)}),s}var i=r(23).format,o=r(3).lazy;t.name="Chain",t.path="type",t.factory=n,t.math=!0,t.lazy=!1},function(e,t,r){"use strict";function n(e,r){if(Array.isArray(e)){for(var i="[",o=e.length,a=0;o>a;a++)0!=a&&(i+=", "),i+=n(e[a],r);return i+="]"}return t.format(e,r)}var i=r(6).format,o=r(24).format;t.isString=function(e){return"string"==typeof e},t.endsWith=function(e,t){var r=e.length-t.length,n=e.length;return e.substring(r,n)===t},t.format=function(e,r){if("number"==typeof e)return i(e,r);if(e&&e.isBigNumber===!0)return o(e,r);if(e&&e.isFraction===!0)return r&&"decimal"===r.fraction?e.toString():e.s*e.n+"/"+e.d;if(Array.isArray(e))return n(e,r);if(t.isString(e))return'"'+e+'"';if("function"==typeof e)return e.syntax?String(e.syntax):"function";if(e&&"object"==typeof e){if("function"==typeof e.format)return e.format(r);if(e&&e.toString()!=={}.toString())return e.toString();var a=[];for(var s in e)e.hasOwnProperty(s)&&a.push('"'+s+'": '+t.format(e[s],r));return"{"+a.join(", ")+"}"}return String(e)}},function(e,t){t.format=function(e,r){if("function"==typeof r)return r(e);if(!e.isFinite())return e.isNaN()?"NaN":e.gt(0)?"Infinity":"-Infinity";var n="auto",i=void 0;switch(void 0!==r&&(r.notation&&(n=r.notation),"number"==typeof r?i=r:r.precision&&(i=r.precision)),n){case"fixed":return t.toFixed(e,i);case"exponential":return t.toExponential(e,i);case"auto":var o=.001,a=1e5;r&&r.exponential&&(void 0!==r.exponential.lower&&(o=r.exponential.lower),void 0!==r.exponential.upper&&(a=r.exponential.upper));({toExpNeg:e.constructor.toExpNeg,toExpPos:e.constructor.toExpPos});if(e.constructor.config({toExpNeg:Math.round(Math.log(o)/Math.LN10),toExpPos:Math.round(Math.log(a)/Math.LN10)}),e.isZero())return"0";var s,u=e.abs();return s=u.gte(o)&&u.lt(a)?e.toSignificantDigits(i).toFixed():t.toExponential(e,i),s.replace(/((\.\d*?)(0+))($|e)/,function(){var e=arguments[2],t=arguments[4];return"."!==e?e+t:t});default:throw new Error('Unknown notation "'+n+'". Choose "auto", "exponential", or "fixed".')}},t.toExponential=function(e,t){return void 0!==t?e.toExponential(t-1):e.toExponential()},t.toFixed=function(e,t){return e.toFixed(t||0)}},function(e,t){"use strict";function r(e,t,r,n){return n("chain",{"":function(){return new e.Chain},any:function(t){
return new e.Chain(t)}})}t.name="chain",t.factory=r},function(e,t,r){e.exports=[r(27),r(31)]},function(e,t,r){function n(e,t,r,n,s){return i.prototype.type="Complex",i.prototype.isComplex=!0,i.prototype.toJSON=function(){return{mathjs:"Complex",re:this.re,im:this.im}},i.prototype.toPolar=function(){return{r:this.abs(),phi:this.arg()}},i.prototype.format=function(e){var t="",r=this.im,n=this.re,i=o(this.re,e),s=o(this.im,e),u=a(e)?e:e?e.precision:null;if(null!==u){var c=Math.pow(10,-u);Math.abs(n/r)<c&&(n=0),Math.abs(r/n)<c&&(r=0)}return t=0==r?i:0==n?1==r?"i":-1==r?"-i":s+"i":r>0?1==r?i+" + i":i+" + "+s+"i":-1==r?i+" - i":i+" - "+s.substring(1)+"i"},i.fromPolar=function(e){switch(arguments.length){case 1:var t=arguments[0];if("object"==typeof t)return i(t);throw new TypeError("Input has to be an object with r and phi keys.");case 2:var r=arguments[0],n=arguments[1];if(a(r)){if(n&&n.isUnit&&n.hasBase("ANGLE")&&(n=n.toNumber("rad")),a(n))return new i({r:r,phi:n});throw new TypeError("Phi is not a number nor an angle unit.")}throw new TypeError("Radius r is not a number.");default:throw new SyntaxError("Wrong number of arguments in function fromPolar")}},i.prototype.valueOf=i.prototype.toString,i.fromJSON=function(e){return new i(e)},i.EPSILON=t.epsilon,s.on("config",function(e,t){e.epsilon!==t.epsilon&&(i.EPSILON=e.epsilon)}),i}var i=r(28),o=r(6).format,a=r(6).isNumber;t.name="Complex",t.path="type",t.factory=n,t.math=!0},function(e,t,r){var n,i;(function(e){/**
	 * @license Complex.js v2.0.1 11/02/2016
	 *
	 * Copyright (c) 2016, Robert Eisele (robert@xarg.org)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 **/
!function(o){"use strict";function a(e,t){var r=Math.abs(e),n=Math.abs(t);return 0===e?Math.log(n):0===t?Math.log(r):3e3>r&&3e3>n?.5*Math.log(e*e+t*t):Math.log(e/Math.cos(Math.atan2(t,e)))}function s(e,t){return this instanceof s?(f(e,t),this.re=u.re,void(this.im=u.im)):new s(e,t)}var u={re:0,im:0};Math.cosh=Math.cosh||function(e){return.5*(Math.exp(e)+Math.exp(-e))},Math.sinh=Math.sinh||function(e){return.5*(Math.exp(e)-Math.exp(-e))};var c=function(){throw SyntaxError("Invalid Param")},f=function(e,t){if(void 0===e||null===e)u.re=u.im=0;else if(void 0!==t)u.re=e,u.im=t;else switch(typeof e){case"object":"im"in e&&"re"in e?(u.re=e.re,u.im=e.im):"abs"in e&&"arg"in e?(u.re=e.abs*Math.cos(e.arg),u.im=e.abs*Math.sin(e.arg)):"r"in e&&"phi"in e?(u.re=e.r*Math.cos(e.phi),u.im=e.r*Math.sin(e.phi)):c();break;case"string":u.im=u.re=0;var r=e.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g),n=1,i=0;null===r&&c();for(var o=0;o<r.length;o++){var a=r[o];" "===a||"	"===a||"\n"===a||("+"===a?n++:"-"===a?i++:"i"===a||"I"===a?(n+i===0&&c()," "===r[o+1]||isNaN(r[o+1])?u.im+=parseFloat((i%2?"-":"")+"1"):(u.im+=parseFloat((i%2?"-":"")+r[o+1]),o++),n=i=0):((n+i===0||isNaN(a))&&c(),"i"===r[o+1]||"I"===r[o+1]?(u.im+=parseFloat((i%2?"-":"")+a),o++):u.re+=parseFloat((i%2?"-":"")+a),n=i=0))}n+i>0&&c();break;case"number":u.im=0,u.re=e;break;default:c()}isNaN(u.re)||isNaN(u.im)};s.prototype={re:0,im:0,sign:function(){var e=this.abs();return new s(this.re/e,this.im/e)},add:function(e,t){return f(e,t),new s(this.re+u.re,this.im+u.im)},sub:function(e,t){return f(e,t),new s(this.re-u.re,this.im-u.im)},mul:function(e,t){return f(e,t),0===u.im&&0===this.im?new s(this.re*u.re,0):new s(this.re*u.re-this.im*u.im,this.re*u.im+this.im*u.re)},div:function(e,t){f(e,t),e=this.re,t=this.im;var r,n,i=u.re,o=u.im;return 0===i&&0===o?new s(0!==e?e/0:0,0!==t?t/0:0):0===o?new s(e/i,t/i):Math.abs(i)<Math.abs(o)?(n=i/o,r=i*n+o,new s((e*n+t)/r,(t*n-e)/r)):(n=o/i,r=o*n+i,new s((e+t*n)/r,(t-e*n)/r))},pow:function(e,t){if(f(e,t),e=this.re,t=this.im,0===e&&0===t)return new s(0,0);var r=Math.atan2(t,e),n=a(e,t);if(0===u.im){if(0===t&&e>=0)return new s(Math.pow(e,u.re),0);if(0===e)switch(u.re%4){case 0:return new s(Math.pow(t,u.re),0);case 1:return new s(0,Math.pow(t,u.re));case 2:return new s(-Math.pow(t,u.re),0);case 3:return new s(0,-Math.pow(t,u.re))}}return e=Math.exp(u.re*n-u.im*r),t=u.im*n+u.re*r,new s(e*Math.cos(t),e*Math.sin(t))},sqrt:function(){var e,t,r=this.re,n=this.im,i=this.abs();return r>=0&&0===n?new s(Math.sqrt(r),0):(e=r>=0?.5*Math.sqrt(2*(i+r)):Math.abs(n)/Math.sqrt(2*(i-r)),t=0>=r?.5*Math.sqrt(2*(i-r)):Math.abs(n)/Math.sqrt(2*(i+r)),new s(e,n>=0?t:-t))},exp:function(){var e=Math.exp(this.re);return 0===this.im,new s(e*Math.cos(this.im),e*Math.sin(this.im))},log:function(){var e=this.re,t=this.im;return new s(a(e,t),Math.atan2(t,e))},abs:function(){var e=Math.abs(this.re),t=Math.abs(this.im);return 3e3>e&&3e3>t?Math.sqrt(e*e+t*t):(t>e?(e=t,t=this.re/this.im):t=this.im/this.re,e*Math.sqrt(1+t*t))},arg:function(){return Math.atan2(this.im,this.re)},sin:function(){var e=this.re,t=this.im;return new s(Math.sin(e)*Math.cosh(t),Math.cos(e)*Math.sinh(t))},cos:function(){var e=this.re,t=this.im;return new s(Math.cos(e)*Math.cosh(t),-Math.sin(e)*Math.sinh(t))},tan:function(){var e=2*this.re,t=2*this.im,r=Math.cos(e)+Math.cosh(t);return new s(Math.sin(e)/r,Math.sinh(t)/r)},cot:function(){var e=2*this.re,t=2*this.im,r=Math.cos(e)-Math.cosh(t);return new s(-Math.sin(e)/r,Math.sinh(t)/r)},sec:function(){var e=this.re,t=this.im,r=.5*Math.cosh(2*t)+.5*Math.cos(2*e);return new s(Math.cos(e)*Math.cosh(t)/r,Math.sin(e)*Math.sinh(t)/r)},csc:function(){var e=this.re,t=this.im,r=.5*Math.cosh(2*t)-.5*Math.cos(2*e);return new s(Math.sin(e)*Math.cosh(t)/r,-Math.cos(e)*Math.sinh(t)/r)},asin:function(){var e=this.re,t=this.im,r=new s(t*t-e*e+1,-2*e*t).sqrt(),n=new s(r.re-t,r.im+e).log();return new s(n.im,-n.re)},acos:function(){var e=this.re,t=this.im,r=new s(t*t-e*e+1,-2*e*t).sqrt(),n=new s(r.re-t,r.im+e).log();return new s(Math.PI/2-n.im,n.re)},atan:function(){var e=this.re,t=this.im;if(0===e){if(1===t)return new s(0,1/0);if(-1===t)return new s(0,-(1/0))}var r=e*e+(1-t)*(1-t),n=new s((1-t*t-e*e)/r,-2*e/r).log();return new s(-.5*n.im,.5*n.re)},acot:function(){var e=this.re,t=this.im;if(0===t)return new s(Math.atan2(1,e),0);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).atan():new s(0!==e?e/0:0,0!==t?-t/0:0).atan()},asec:function(){var e=this.re,t=this.im;if(0===e&&0===t)return new s(0,1/0);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).acos():new s(0!==e?e/0:0,0!==t?-t/0:0).acos()},acsc:function(){var e=this.re,t=this.im;if(0===e&&0===t)return new s(Math.PI/2,1/0);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).asin():new s(0!==e?e/0:0,0!==t?-t/0:0).asin()},sinh:function(){var e=this.re,t=this.im;return new s(Math.sinh(e)*Math.cos(t),Math.cosh(e)*Math.sin(t))},cosh:function(){var e=this.re,t=this.im;return new s(Math.cosh(e)*Math.cos(t),Math.sinh(e)*Math.sin(t))},tanh:function(){var e=2*this.re,t=2*this.im,r=Math.cosh(e)+Math.cos(t);return new s(Math.sinh(e)/r,Math.sin(t)/r)},coth:function(){var e=2*this.re,t=2*this.im,r=Math.cosh(e)-Math.cos(t);return new s(Math.sinh(e)/r,-Math.sin(t)/r)},csch:function(){var e=this.re,t=this.im,r=Math.cos(2*t)-Math.cosh(2*e);return new s(-2*Math.sinh(e)*Math.cos(t)/r,2*Math.cosh(e)*Math.sin(t)/r)},sech:function(){var e=this.re,t=this.im,r=Math.cos(2*t)+Math.cosh(2*e);return new s(2*Math.cosh(e)*Math.cos(t)/r,-2*Math.sinh(e)*Math.sin(t)/r)},asinh:function(){var e=this.im;this.im=-this.re,this.re=e;var t=this.asin();return this.re=-this.im,this.im=e,e=t.re,t.re=-t.im,t.im=e,t},acosh:function(){var e,t=this.acos();return t.im<=0?(e=t.re,t.re=-t.im,t.im=e):(e=t.im,t.im=-t.re,t.re=e),t},atanh:function(){var e=this.re,t=this.im,r=e>1&&0===t,n=1-e,i=1+e,o=n*n+t*t,u=0!==o?new s((i*n-t*t)/o,(t*n+i*t)/o):new s(-1!==e?e/0:0,0!==t?t/0:0),c=u.re;return u.re=a(u.re,u.im)/2,u.im=Math.atan2(u.im,c)/2,r&&(u.im=-u.im),u},acoth:function(){var e=this.re,t=this.im;if(0===e&&0===t)return new s(0,Math.PI/2);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).atanh():new s(0!==e?e/0:0,0!==t?-t/0:0).atanh()},acsch:function(){var e=this.re,t=this.im;if(0===t)return new s(0!==e?Math.log(e+Math.sqrt(e*e+1)):1/0,0);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).asinh():new s(0!==e?e/0:0,0!==t?-t/0:0).asinh()},asech:function(){var e=this.re,t=this.im;if(0===e&&0===t)return new s(1/0,0);var r=e*e+t*t;return 0!==r?new s(e/r,-t/r).acosh():new s(0!==e?e/0:0,0!==t?-t/0:0).acosh()},inverse:function(){var e=this.re,t=this.im,r=e*e+t*t;return new s(0!==e?e/r:0,0!==t?-t/r:0)},conjugate:function(){return new s(this.re,-this.im)},neg:function(){return new s(-this.re,-this.im)},ceil:function(e){return e=Math.pow(10,e||0),new s(Math.ceil(this.re*e)/e,Math.ceil(this.im*e)/e)},floor:function(e){return e=Math.pow(10,e||0),new s(Math.floor(this.re*e)/e,Math.floor(this.im*e)/e)},round:function(e){return e=Math.pow(10,e||0),new s(Math.round(this.re*e)/e,Math.round(this.im*e)/e)},equals:function(e,t){return f(e,t),Math.abs(u.re-this.re)<=s.EPSILON&&Math.abs(u.im-this.im)<=s.EPSILON},clone:function(){return new s(this.re,this.im)},toString:function(){var e=this.re,t=this.im,r="";return isNaN(e)||isNaN(t)?"NaN":(0!==e&&(r+=e),0!==t&&(0!==e?r+=0>t?" - ":" + ":0>t&&(r+="-"),t=Math.abs(t),1!==t&&(r+=t),r+="i"),r?r:"0")},toVector:function(){return[this.re,this.im]},valueOf:function(){return 0===this.im?this.re:null},isNaN:function(){return isNaN(this.re)||isNaN(this.im)}},s.ZERO=new s(0,0),s.ONE=new s(1,0),s.I=new s(0,1),s.PI=new s(Math.PI,0),s.E=new s(Math.E,0),s.EPSILON=1e-16,r(30).amd?(n=[],i=function(){return s}.apply(t,n),!(void 0!==i&&(e.exports=i))):e.exports=s}(this)}).call(t,r(29)(e))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t){e.exports=function(){throw new Error("define cannot be used indirect")}},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=o("complex",{"":function(){return e.Complex.ZERO},number:function(t){return new e.Complex(t,0)},"number, number":function(t,r){return new e.Complex(t,r)},"BigNumber, BigNumber":function(t,r){return new e.Complex(t.toNumber(),r.toNumber())},Complex:function(e){return e.clone()},string:function(t){return e.Complex(t)},Object:function(t){if("re"in t&&"im"in t)return new e.Complex(t.re,t.im);if("r"in t&&"phi"in t)return new e.Complex(t);throw new Error("Expected object with either properties re and im, or properties r and phi.")},"Array | Matrix":function(e){return i(e,s)}});return s.toTex={0:"0",1:"\\left(${args[0]}\\right)",2:"\\left(\\left(${args[0]}\\right)+"+a.symbols.i+"\\cdot\\left(${args[1]}\\right)\\right)"},s}var i=r(19);t.name="complex",t.factory=n},function(e,t){"use strict";t.symbols={Alpha:"A",alpha:"\\alpha",Beta:"B",beta:"\\beta",Gamma:"\\Gamma",gamma:"\\gamma",Delta:"\\Delta",delta:"\\delta",Epsilon:"E",epsilon:"\\epsilon",varepsilon:"\\varepsilon",Zeta:"Z",zeta:"\\zeta",Eta:"H",eta:"\\eta",Theta:"\\Theta",theta:"\\theta",vartheta:"\\vartheta",Iota:"I",iota:"\\iota",Kappa:"K",kappa:"\\kappa",varkappa:"\\varkappa",Lambda:"\\Lambda",lambda:"\\lambda",Mu:"M",mu:"\\mu",Nu:"N",nu:"\\nu",Xi:"\\Xi",xi:"\\xi",Omicron:"O",omicron:"o",Pi:"\\Pi",pi:"\\pi",varpi:"\\varpi",Rho:"P",rho:"\\rho",varrho:"\\varrho",Sigma:"\\Sigma",sigma:"\\sigma",varsigma:"\\varsigma",Tau:"T",tau:"\\tau",Upsilon:"\\Upsilon",upsilon:"\\upsilon",Phi:"\\Phi",phi:"\\phi",varphi:"\\varphi",Chi:"X",chi:"\\chi",Psi:"\\Psi",psi:"\\psi",Omega:"\\Omega",omega:"\\omega","true":"\\mathrm{True}","false":"\\mathrm{False}",i:"i",inf:"\\infty",Inf:"\\infty",infinity:"\\infty",Infinity:"\\infty",oo:"\\infty",lim:"\\lim",undefined:"\\mathbf{?}"},t.operators={transpose:"^\\top",factorial:"!",pow:"^",dotPow:".^\\wedge",unaryPlus:"+",unaryMinus:"-",bitNot:"~",not:"\\neg",multiply:"\\cdot",divide:"\\frac",dotMultiply:".\\cdot",dotDivide:".:",mod:"\\mod",add:"+",subtract:"-",to:"\\rightarrow",leftShift:"<<",rightArithShift:">>",rightLogShift:">>>",equal:"=",unequal:"\\neq",smaller:"<",larger:">",smallerEq:"\\leq",largerEq:"\\geq",bitAnd:"\\&",bitXor:"\\underline{|}",bitOr:"|",and:"\\wedge",xor:"\\veebar",or:"\\vee"},t.defaultTemplate="\\mathrm{${name}}\\left(${args}\\right)";var r={deg:"^\\circ"};t.toSymbol=function(e,n){if(n="undefined"==typeof n?!1:n)return r.hasOwnProperty(e)?r[e]:"\\mathrm{"+e+"}";if(t.symbols.hasOwnProperty(e))return t.symbols[e];if(-1!==e.indexOf("_")){var i=e.indexOf("_");return t.toSymbol(e.substring(0,i))+"_{"+t.toSymbol(e.substring(i+1))+"}"}return e}},function(e,t,r){e.exports=[r(34),r(36)]},function(e,t,r){function n(e,t,r,n){return i}var i=r(35);i.prototype.type="Fraction",i.prototype.isFraction=!0,i.prototype.toJSON=function(){return{mathjs:"Fraction",n:this.s*this.n,d:this.d}},i.fromJSON=function(e){return new i(e)},t.name="Fraction",t.path="type",t.factory=n},function(e,t,r){var n,i;(function(e){/**
	 * @license Fraction.js v3.3.1 09/09/2015
	 * http://www.xarg.org/2014/03/precise-calculations-in-javascript/
	 *
	 * Copyright (c) 2015, Robert Eisele (robert@xarg.org)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 **/
!function(o){"use strict";function a(e,t){return isNaN(e=parseInt(e,10))&&s(),e*t}function s(){throw"Invalid Param"}function u(e,t){return this instanceof u?(l(e,t),e=u.REDUCE?d(f.d,f.n):1,this.s=f.s,this.n=f.n/e,void(this.d=f.d/e)):new u(e,t)}var c=2e3,f={s:1,n:0,d:1},l=function(e,t){var r,n=0,i=1,o=1,u=0,c=0,l=0,p=1,h=1,m=0,d=1,g=1,v=1,y=1e7;if(void 0===e||null===e);else if(void 0!==t)n=e,i=t,o=n*i;else switch(typeof e){case"object":"d"in e&&"n"in e?(n=e.n,i=e.d,"s"in e&&(n*=e.s)):0 in e?(n=e[0],1 in e&&(i=e[1])):s(),o=n*i;break;case"number":if(0>e&&(o=e,e=-e),e%1===0)n=e;else if(e>0){for(e>=1&&(h=Math.pow(10,Math.floor(1+Math.log(e)/Math.LN10)),e/=h);y>=d&&y>=v;){if(r=(m+g)/(d+v),e===r){y>=d+v?(n=m+g,i=d+v):v>d?(n=g,i=v):(n=m,i=d);break}e>r?(m+=g,d+=v):(g+=m,v+=d),d>y?(n=g,i=v):(n=m,i=d)}n*=h}else(isNaN(e)||isNaN(t))&&(i=n=NaN);break;case"string":if(d=e.match(/\d+|./g),"-"===d[m]?(o=-1,m++):"+"===d[m]&&m++,d.length===m+1?c=a(d[m++],o):"."===d[m+1]||"."===d[m]?("."!==d[m]&&(u=a(d[m++],o)),m++,(m+1===d.length||"("===d[m+1]&&")"===d[m+3]||"'"===d[m+1]&&"'"===d[m+3])&&(c=a(d[m],o),p=Math.pow(10,d[m].length),m++),("("===d[m]&&")"===d[m+2]||"'"===d[m]&&"'"===d[m+2])&&(l=a(d[m+1],o),h=Math.pow(10,d[m+1].length)-1,m+=3)):"/"===d[m+1]||":"===d[m+1]?(c=a(d[m],o),p=a(d[m+2],1),m+=3):"/"===d[m+3]&&" "===d[m+1]&&(u=a(d[m],o),c=a(d[m+2],o),p=a(d[m+4],1),m+=5),d.length<=m){i=p*h,o=n=l+i*u+h*c;break}default:s()}if(0===i)throw"DIV/0";f.s=0>o?-1:1,f.n=Math.abs(n),f.d=Math.abs(i)},p=function(e,t,r){for(var n=1;t>0;e=e*e%r,t>>=1)1&t&&(n=n*e%r);return n},h=function(e,t){for(;t%2===0;t/=2);for(;t%5===0;t/=5);if(1===t)return 0;for(var r=10%t,n=1;1!==r;n++)if(r=10*r%t,n>c)return 0;return n},m=function(e,t,r){for(var n=1,i=p(10,r,t),o=0;300>o;o++){if(n===i)return o;n=10*n%t,i=10*i%t}return 0},d=function(e,t){if(!e)return t;if(!t)return e;for(;;){if(e%=t,!e)return t;if(t%=e,!t)return e}};u.REDUCE=1,u.prototype={s:1,n:0,d:1,abs:function(){return new u(this.n,this.d)},neg:function(){return new u(-this.s*this.n,this.d)},add:function(e,t){return l(e,t),new u(this.s*this.n*f.d+f.s*this.d*f.n,this.d*f.d)},sub:function(e,t){return l(e,t),new u(this.s*this.n*f.d-f.s*this.d*f.n,this.d*f.d)},mul:function(e,t){return l(e,t),new u(this.s*f.s*this.n*f.n,this.d*f.d)},div:function(e,t){return l(e,t),new u(this.s*f.s*this.n*f.d,this.d*f.n)},clone:function(){return new u(this)},mod:function(e,t){return isNaN(this.n)||isNaN(this.d)?new u(NaN):void 0===e?new u(this.s*this.n%this.d,1):(l(e,t),0===f.n&&0===this.d&&u(0,0),new u(this.s*f.d*this.n%(f.n*this.d),f.d*this.d))},gcd:function(e,t){return l(e,t),new u(d(f.n,this.n),f.d*this.d/d(f.d,this.d))},lcm:function(e,t){return l(e,t),0===f.n&&0===this.n?new u:new u(f.n*this.n/d(f.n,this.n),d(f.d,this.d))},ceil:function(e){return e=Math.pow(10,e||0),isNaN(this.n)||isNaN(this.d)?new u(NaN):new u(Math.ceil(e*this.s*this.n/this.d),e)},floor:function(e){return e=Math.pow(10,e||0),isNaN(this.n)||isNaN(this.d)?new u(NaN):new u(Math.floor(e*this.s*this.n/this.d),e)},round:function(e){return e=Math.pow(10,e||0),isNaN(this.n)||isNaN(this.d)?new u(NaN):new u(Math.round(e*this.s*this.n/this.d),e)},inverse:function(){return new u(this.s*this.d,this.n)},pow:function(e){return 0>e?new u(Math.pow(this.s*this.d,-e),Math.pow(this.n,-e)):new u(Math.pow(this.s*this.n,e),Math.pow(this.d,e))},equals:function(e,t){return l(e,t),this.s*this.n*f.d===f.s*f.n*this.d},compare:function(e,t){l(e,t);var r=this.s*this.n*f.d-f.s*f.n*this.d;return(r>0)-(0>r)},divisible:function(e,t){return l(e,t),!(!(f.n*this.d)||this.n*f.d%(f.n*this.d))},valueOf:function(){return this.s*this.n/this.d},toFraction:function(e){var t,r="",n=this.n,i=this.d;return this.s<0&&(r+="-"),1===i?r+=n:(e&&(t=Math.floor(n/i))>0&&(r+=t,r+=" ",n%=i),r+=n,r+="/",r+=i),r},toLatex:function(e){var t,r="",n=this.n,i=this.d;return this.s<0&&(r+="-"),1===i?r+=n:(e&&(t=Math.floor(n/i))>0&&(r+=t,n%=i),r+="\\frac{",r+=n,r+="}{",r+=i,r+="}"),r},toContinued:function(){var e,t=this.n,r=this.d,n=[];do n.push(Math.floor(t/r)),e=t%r,t=r,r=e;while(1!==t);return n},toString:function(){var e,t=this.n,r=this.d;if(isNaN(t)||isNaN(r))return"NaN";u.REDUCE||(e=d(t,r),t/=e,r/=e);for(var n=String(t).split(""),i=0,o=[~this.s?"":"-","",""],a="",s=h(t,r),c=m(t,r,s),f=-1,l=1,p=15+s+c+n.length,g=0;p>g;g++,i*=10){if(g<n.length?i+=Number(n[g]):(l=2,f++),s>0)if(f===c)o[l]+=a+"(",a="";else if(f===s+c){o[l]+=a+")";break}i>=r?(o[l]+=a+(i/r|0),a="",i%=r):l>1?a+="0":o[l]&&(o[l]+="0")}return o[0]+=o[1]||"0",o[2]?o[0]+"."+o[2]:o[0]}},r(30).amd?(n=[],i=function(){return u}.apply(t,n),!(void 0!==i&&(e.exports=i))):e.exports=u}(this)}).call(t,r(29)(e))},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("fraction",{number:function(t){if(!isFinite(t)||isNaN(t))throw new Error(t+" cannot be represented as a fraction");return new e.Fraction(t)},string:function(t){return new e.Fraction(t)},"number, number":function(t,r){return new e.Fraction(t,r)},BigNumber:function(t){return new e.Fraction(t.toString())},Fraction:function(e){return e},Object:function(t){return new e.Fraction(t)},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);t.name="fraction",t.factory=n},function(e,t,r){e.exports=[r(38),r(46),r(47),r(50),r(59),r(65),r(66),r(67),r(68),r(52),r(69)]},function(e,t,r){"use strict";function n(e,t,r,n){function i(){if(!(this instanceof i))throw new SyntaxError("Constructor must be called with the new operator")}return i.prototype.type="Matrix",i.prototype.isMatrix=!0,i.storage=function(e){if(!a(e))throw new TypeError("format must be a string value");var t=i._storage[e];if(!t)throw new SyntaxError("Unsupported matrix storage format: "+e);return t},i._storage={},i.prototype.storage=function(){throw new Error("Cannot invoke storage on a Matrix interface")},i.prototype.datatype=function(){throw new Error("Cannot invoke datatype on a Matrix interface")},i.prototype.create=function(e,t){throw new Error("Cannot invoke create on a Matrix interface")},i.prototype.subset=function(e,t,r){throw new Error("Cannot invoke subset on a Matrix interface")},i.prototype.get=function(e){throw new Error("Cannot invoke get on a Matrix interface")},i.prototype.set=function(e,t,r){throw new Error("Cannot invoke set on a Matrix interface")},i.prototype.resize=function(e,t){throw new Error("Cannot invoke resize on a Matrix interface")},i.prototype.clone=function(){throw new Error("Cannot invoke clone on a Matrix interface")},i.prototype.size=function(){throw new Error("Cannot invoke size on a Matrix interface")},i.prototype.map=function(e,t){throw new Error("Cannot invoke map on a Matrix interface")},i.prototype.forEach=function(e){throw new Error("Cannot invoke forEach on a Matrix interface")},i.prototype.toArray=function(){throw new Error("Cannot invoke toArray on a Matrix interface")},i.prototype.valueOf=function(){throw new Error("Cannot invoke valueOf on a Matrix interface")},i.prototype.format=function(e){throw new Error("Cannot invoke format on a Matrix interface")},i.prototype.toString=function(){throw new Error("Cannot invoke toString on a Matrix interface")},i}var i=r(39),o=i.string,a=o.isString;t.name="Matrix",t.path="type",t.factory=n},function(e,t,r){"use strict";t.array=r(40),t["boolean"]=r(44),t["function"]=r(45),t.number=r(6),t.object=r(3),t.string=r(23),t.types=r(41),t.emitter=r(8)},function(e,t,r){"use strict";function n(e,t,r){var i,o=e.length;if(o!=t[r])throw new c(o,t[r]);if(r<t.length-1){var a=r+1;for(i=0;o>i;i++){var s=e[i];if(!Array.isArray(s))throw new c(t.length-1,t.length,"<");n(e[i],t,a)}}else for(i=0;o>i;i++)if(Array.isArray(e[i]))throw new c(t.length+1,t.length,">")}function i(e,r,n,o){var a,s,u=e.length,c=r[n],f=Math.min(u,c);if(e.length=c,n<r.length-1){var l=n+1;for(a=0;f>a;a++)s=e[a],Array.isArray(s)||(s=[s],e[a]=s),i(s,r,l,o);for(a=f;c>a;a++)s=[],e[a]=s,i(s,r,l,o)}else{for(a=0;f>a;a++)for(;Array.isArray(e[a]);)e[a]=e[a][0];if(o!==t.UNINITIALIZED)for(a=f;c>a;a++)e[a]=o}}function o(e,t,r){var n,i;if(t>r){var a=r+1;for(n=0,i=e.length;i>n;n++)e[n]=o(e[n],t,a)}else for(;Array.isArray(e);)e=e[0];return e}function a(e,t,r){var n,i;if(Array.isArray(e)){var o=r+1;for(n=0,i=e.length;i>n;n++)e[n]=a(e[n],t,o)}else for(var s=r;t>s;s++)e=[e];return e}var s=r(6),u=r(23),c=(r(3),r(41),r(42)),f=r(43);t.size=function(e){for(var t=[];Array.isArray(e);)t.push(e.length),e=e[0];return t},t.validate=function(e,t){var r=0==t.length;if(r){if(Array.isArray(e))throw new c(e.length,0)}else n(e,t,0)},t.validateIndex=function(e,t){if(!s.isNumber(e)||!s.isInteger(e))throw new TypeError("Index must be an integer (value: "+e+")");if(0>e||"number"==typeof t&&e>=t)throw new f(e,t)},t.UNINITIALIZED={},t.resize=function(e,t,r){if(!Array.isArray(e)||!Array.isArray(t))throw new TypeError("Array expected");if(0===t.length)throw new Error("Resizing to scalar is not supported");t.forEach(function(e){if(!s.isNumber(e)||!s.isInteger(e)||0>e)throw new TypeError("Invalid size, must contain positive integers (size: "+u.format(t)+")")});var n=void 0!==r?r:0;return i(e,t,0,n),e},t.squeeze=function(e,r){for(var n=r||t.size(e);Array.isArray(e)&&1===e.length;)e=e[0],n.shift();for(var i=n.length;1===n[i-1];)i--;return i<n.length&&(e=o(e,i,0),n.length=i),e},t.unsqueeze=function(e,r,n,i){var o=i||t.size(e);if(n)for(var s=0;n>s;s++)e=[e],o.unshift(1);for(e=a(e,r,0);o.length<r;)o.push(1);return e},t.flatten=function(e){if(!Array.isArray(e))return e;var t=[];return e.forEach(function r(e){Array.isArray(e)?e.forEach(r):t.push(e)}),t},t.isArray=Array.isArray},function(e,t){"use strict";t.type=function(e){var t=typeof e;return"object"===t?null===e?"null":e instanceof Boolean?"boolean":e instanceof Number?"number":e instanceof String?"string":Array.isArray(e)?"Array":e instanceof Date?"Date":e instanceof RegExp?"RegExp":"Object":"function"===t?"Function":t},t.isScalar=function(e){return!(e&&e.isMatrix||Array.isArray(e))}},function(e,t){"use strict";function r(e,t,n){if(!(this instanceof r))throw new SyntaxError("Constructor must be called with the new operator");this.actual=e,this.expected=t,this.relation=n,this.message="Dimension mismatch ("+(Array.isArray(e)?"["+e.join(", ")+"]":e)+" "+(this.relation||"!=")+" "+(Array.isArray(t)?"["+t.join(", ")+"]":t)+")",this.stack=(new Error).stack}r.prototype=new RangeError,r.prototype.constructor=RangeError,r.prototype.name="DimensionError",r.prototype.isDimensionError=!0,e.exports=r},function(e,t){"use strict";function r(e,t,n){if(!(this instanceof r))throw new SyntaxError("Constructor must be called with the new operator");this.index=e,arguments.length<3?(this.min=0,this.max=t):(this.min=t,this.max=n),void 0!==this.min&&this.index<this.min?this.message="Index out of range ("+this.index+" < "+this.min+")":void 0!==this.max&&this.index>=this.max?this.message="Index out of range ("+this.index+" > "+(this.max-1)+")":this.message="Index out of range ("+this.index+")",this.stack=(new Error).stack}r.prototype=new RangeError,r.prototype.constructor=RangeError,r.prototype.name="IndexError",r.prototype.isIndexError=!0,e.exports=r},function(e,t){"use strict";t.isBoolean=function(e){return"boolean"==typeof e}},function(e,t){t.memoize=function(e,t){return function r(){"object"!=typeof r.cache&&(r.cache={});for(var n=[],i=0;i<arguments.length;i++)n[i]=arguments[i];var o=t?t(n):JSON.stringify(n);return o in r.cache?r.cache[o]:r.cache[o]=e.apply(e,n)}},t.maxArgumentCount=function(e){return Object.keys(e.signatures||{}).reduce(function(e,t){var r=(t.match(/,/g)||[]).length+1;return Math.max(e,r)},-1)}},function(e,t,r){"use strict";function n(e,t,n,c){function d(e,t){if(!(this instanceof d))throw new SyntaxError("Constructor must be called with the new operator");if(t&&!h(t))throw new Error("Invalid datatype: "+t);if(e&&e.isMatrix===!0)"DenseMatrix"===e.type?(this._data=u.clone(e._data),this._size=u.clone(e._size),this._datatype=t||e._datatype):(this._data=e.toArray(),this._size=e.size(),this._datatype=t||e._datatype);else if(e&&f(e.data)&&f(e.size))this._data=e.data,this._size=e.size,this._datatype=t||e.datatype;else if(f(e))this._data=w(e),this._size=s.size(this._data),s.validate(this._data,this._size),this._datatype=t;else{if(e)throw new TypeError("Unsupported type of data ("+i.types.type(e)+")");this._data=[],this._size=[0],this._datatype=t}}function g(e,t){if(!t||t.isIndex!==!0)throw new TypeError("Invalid index");var r=t.isScalar();if(r)return e.get(t.min());var n=t.size();if(n.length!=e._size.length)throw new o(n.length,e._size.length);for(var i=t.min(),a=t.max(),s=0,u=e._size.length;u>s;s++)m(i[s],e._size[s]),m(a[s],e._size[s]);return new d(v(e._data,t,n.length,0),e._datatype)}function v(e,t,r,n){var i=n==r-1,o=t.dimension(n);return i?o.map(function(t){return e[t]}).valueOf():o.map(function(i){var o=e[i];return v(o,t,r,n+1)}).valueOf()}function y(e,t,r,n){if(!t||t.isIndex!==!0)throw new TypeError("Invalid index");var i,a=t.size(),c=t.isScalar();if(r&&r.isMatrix===!0?(i=r.size(),r=r.valueOf()):i=s.size(r),c){if(0!==i.length)throw new TypeError("Scalar expected");e.set(t.min(),r,n)}else{if(a.length<e._size.length)throw new o(a.length,e._size.length,"<");if(i.length<a.length){for(var f=0,l=0;1===a[f]&&1===i[f];)f++;for(;1===a[f];)l++,f++;r=s.unsqueeze(r,a.length,l,i)}if(!u.deepEqual(a,i))throw new o(a,i,">");var p=t.max().map(function(e){return e+1});b(e,p,n);var h=a.length,m=0;x(e._data,t,r,h,m)}return e}function x(e,t,r,n,i){var o=i==n-1,a=t.dimension(i);o?a.forEach(function(t,n){m(t),e[t]=r[n[0]]}):a.forEach(function(o,a){m(o),x(e[o],t,r[a[0]],n,i+1)})}function b(e,t,r){for(var n=e._size.slice(0),i=!1;n.length<t.length;)n.push(0),i=!0;for(var o=0,a=t.length;a>o;o++)t[o]>n[o]&&(n[o]=t[o],i=!0);i&&E(e,n,r)}function w(e){for(var t=0,r=e.length;r>t;t++){var n=e[t];f(n)?e[t]=w(n):n&&n.isMatrix===!0&&(e[t]=w(n.valueOf()))}return e}var N=n(r(38));d.prototype=new N,d.prototype.type="DenseMatrix",d.prototype.isDenseMatrix=!0,d.prototype.storage=function(){return"dense"},d.prototype.datatype=function(){return this._datatype},d.prototype.create=function(e,t){return new d(e,t)},d.prototype.subset=function(e,t,r){switch(arguments.length){case 1:return g(this,e);case 2:case 3:return y(this,e,t,r);default:throw new SyntaxError("Wrong number of arguments")}},d.prototype.get=function(e){if(!f(e))throw new TypeError("Array expected");if(e.length!=this._size.length)throw new o(e.length,this._size.length);for(var t=0;t<e.length;t++)m(e[t],this._size[t]);for(var r=this._data,n=0,i=e.length;i>n;n++){var a=e[n];m(a,r.length),r=r[a]}return r},d.prototype.set=function(e,t,r){if(!f(e))throw new TypeError("Array expected");if(e.length<this._size.length)throw new o(e.length,this._size.length,"<");var n,i,a,s=e.map(function(e){return e+1});b(this,s,r);var u=this._data;for(n=0,i=e.length-1;i>n;n++)a=e[n],m(a,u.length),u=u[a];return a=e[e.length-1],m(a,u.length),u[a]=t,this},d.prototype.resize=function(e,t,r){if(!f(e))throw new TypeError("Array expected");var n=r?this.clone():this;return E(n,e,t)};var E=function(e,t,r){if(0===t.length){for(var n=e._data;f(n);)n=n[0];return n}return e._size=t.slice(0),e._data=s.resize(e._data,e._size,r),e};return d.prototype.clone=function(){var e=new d({data:u.clone(this._data),size:u.clone(this._size),datatype:this._datatype});return e},d.prototype.size=function(){return this._size.slice(0)},d.prototype.map=function(e){var t=this,r=function(n,i){return f(n)?n.map(function(e,t){return r(e,i.concat(t))}):e(n,i,t)};return new d({data:r(this._data,[]),size:u.clone(this._size),datatype:this._datatype})},d.prototype.forEach=function(e){var t=this,r=function(n,i){f(n)?n.forEach(function(e,t){r(e,i.concat(t))}):e(n,i,t)};r(this._data,[])},d.prototype.toArray=function(){return u.clone(this._data)},d.prototype.valueOf=function(){return this._data},d.prototype.format=function(e){return a.format(this._data,e)},d.prototype.toString=function(){return a.format(this._data)},d.prototype.toJSON=function(){return{mathjs:"DenseMatrix",data:this._data,size:this._size,datatype:this._datatype}},d.prototype.diagonal=function(e){if(e){if(e.isBigNumber===!0&&(e=e.toNumber()),!l(e)||!p(e))throw new TypeError("The parameter k must be an integer number")}else e=0;for(var t=e>0?e:0,r=0>e?-e:0,n=this._size[0],i=this._size[1],o=Math.min(n-r,i-t),a=[],s=0;o>s;s++)a[s]=this._data[s+r][s+t];return new d({data:a,size:[o],datatype:this._datatype})},d.diagonal=function(t,r,n,i,o){if(!f(t))throw new TypeError("Array expected, size parameter");if(2!==t.length)throw new Error("Only two dimensions matrix are supported");if(t=t.map(function(e){if(e&&e.isBigNumber===!0&&(e=e.toNumber()),!l(e)||!p(e)||1>e)throw new Error("Size values must be positive integers");return e}),n){if(n&&n.isBigNumber===!0&&(n=n.toNumber()),!l(n)||!p(n))throw new TypeError("The parameter k must be an integer number")}else n=0;i&&h(o)&&(i=c.convert(i,o));var a,u=n>0?n:0,m=0>n?-n:0,g=t[0],v=t[1],y=Math.min(g-m,v-u);if(f(r)){if(r.length!==y)throw new Error("Invalid value array length");a=function(e){return r[e]}}else if(r&&r.isMatrix===!0){var x=r.size();if(1!==x.length||x[0]!==y)throw new Error("Invalid matrix length");a=function(e){return r.get([e])}}else a=function(){return r};i||(i=a(0)&&a(0).isBigNumber===!0?new e.BigNumber(0):0);var b=[];if(t.length>0){b=s.resize(b,t,i);for(var w=0;y>w;w++)b[w+m][w+u]=a(w)}return new d({data:b,size:[g,v]})},d.fromJSON=function(e){return new d(e)},d.prototype.swapRows=function(e,t){if(!(l(e)&&p(e)&&l(t)&&p(t)))throw new Error("Row index must be positive integers");if(2!==this._size.length)throw new Error("Only two dimensional matrix is supported");return m(e,this._size[0]),m(t,this._size[0]),d._swapRows(e,t,this._data),this},d._swapRows=function(e,t,r){var n=r[e];r[e]=r[t],r[t]=n},e.Matrix._storage.dense=d,e.Matrix._storage["default"]=d,d}var i=r(39),o=r(42),a=i.string,s=i.array,u=i.object,c=i.number,f=Array.isArray,l=c.isNumber,p=c.isInteger,h=a.isString,m=s.validateIndex;t.name="DenseMatrix",t.path="type",t.factory=n,t.lazy=!1},function(e,t,r){"use strict";function n(e,t,n,d){function g(e,t){if(!(this instanceof g))throw new SyntaxError("Constructor must be called with the new operator");if(t&&!h(t))throw new Error("Invalid datatype: "+t);if(e&&e.isMatrix===!0)x(this,e,t);else if(e&&f(e.index)&&f(e.ptr)&&f(e.size))this._values=e.values,this._index=e.index,this._ptr=e.ptr,this._size=e.size,this._datatype=t||e.datatype;else if(f(e))b(this,e,t);else{if(e)throw new TypeError("Unsupported type of data ("+i.types.type(e)+")");this._values=[],this._index=[],this._ptr=[0],this._size=[0,0],this._datatype=t}}var v=n(r(38)),y=n(r(48)),x=function(e,t,r){"SparseMatrix"===t.type?(e._values=t._values?s.clone(t._values):void 0,e._index=s.clone(t._index),e._ptr=s.clone(t._ptr),e._size=s.clone(t._size),e._datatype=r||t._datatype):b(e,t.valueOf(),r||t._datatype)},b=function(e,t,r){e._values=[],e._index=[],e._ptr=[],e._datatype=r;var n=t.length,i=0,o=y,a=0;if(h(r)&&(o=d.find(y,[r,r])||y,a=d.convert(0,r)),n>0){var s=0;do{e._ptr.push(e._index.length);for(var u=0;n>u;u++){var c=t[u];if(f(c)){if(0===s&&i<c.length&&(i=c.length),s<c.length){var l=c[s];o(l,a)||(e._values.push(l),e._index.push(u))}}else 0===s&&1>i&&(i=1),o(c,a)||(e._values.push(c),e._index.push(u))}s++}while(i>s)}e._ptr.push(e._index.length),e._size=[n,i]};g.prototype=new v,g.prototype.type="SparseMatrix",g.prototype.isSparseMatrix=!0,g.prototype.storage=function(){return"sparse"},g.prototype.datatype=function(){return this._datatype},g.prototype.create=function(e,t){return new g(e,t)},g.prototype.density=function(){var e=this._size[0],t=this._size[1];return 0!==e&&0!==t?this._index.length/(e*t):0},g.prototype.subset=function(e,t,r){if(!this._values)throw new Error("Cannot invoke subset on a Pattern only matrix");switch(arguments.length){case 1:return w(this,e);case 2:case 3:return N(this,e,t,r);default:throw new SyntaxError("Wrong number of arguments")}};var w=function(e,t){if(!t||t.isIndex!==!0)throw new TypeError("Invalid index");var r=t.isScalar();if(r)return e.get(t.min());var n=t.size();if(n.length!=e._size.length)throw new o(n.length,e._size.length);var i,a,s,u,c=t.min(),f=t.max();for(i=0,a=e._size.length;a>i;i++)m(c[i],e._size[i]),m(f[i],e._size[i]);var l=e._values,p=e._index,h=e._ptr,d=t.dimension(0),v=t.dimension(1),y=[],x=[];d.forEach(function(e,t){x[e]=t[0],y[e]=!0});var b=l?[]:void 0,w=[],N=[];return v.forEach(function(e){for(N.push(w.length),s=h[e],u=h[e+1];u>s;s++)i=p[s],y[i]===!0&&(w.push(x[i]),b&&b.push(l[s]))}),N.push(w.length),new g({values:b,index:w,ptr:N,size:n,datatype:e._datatype})},N=function(e,t,r,n){if(!t||t.isIndex!==!0)throw new TypeError("Invalid index");var i,u=t.size(),c=t.isScalar();if(r&&r.isMatrix===!0?(i=r.size(),r=r.toArray()):i=a.size(r),c){if(0!==i.length)throw new TypeError("Scalar expected");e.set(t.min(),r,n)}else{if(1!==u.length&&2!==u.length)throw new o(u.length,e._size.length,"<");if(i.length<u.length){for(var f=0,l=0;1===u[f]&&1===i[f];)f++;for(;1===u[f];)l++,f++;r=a.unsqueeze(r,u.length,l,i)}if(!s.deepEqual(u,i))throw new o(u,i,">");for(var p=t.min()[0],h=t.min()[1],m=i[0],d=i[1],g=0;m>g;g++)for(var v=0;d>v;v++){var y=r[g][v];e.set([g+p,v+h],y,n)}}return e};g.prototype.get=function(e){if(!f(e))throw new TypeError("Array expected");if(e.length!=this._size.length)throw new o(e.length,this._size.length);if(!this._values)throw new Error("Cannot invoke get on a Pattern only matrix");var t=e[0],r=e[1];m(t,this._size[0]),m(r,this._size[1]);var n=E(t,this._ptr[r],this._ptr[r+1],this._index);return n<this._ptr[r+1]&&this._index[n]===t?this._values[n]:0},g.prototype.set=function(e,t,r){if(!f(e))throw new TypeError("Array expected");if(e.length!=this._size.length)throw new o(e.length,this._size.length);if(!this._values)throw new Error("Cannot invoke set on a Pattern only matrix");var n=e[0],i=e[1],a=this._size[0],s=this._size[1],u=y,c=0;h(this._datatype)&&(u=d.find(y,[this._datatype,this._datatype])||y,c=d.convert(0,this._datatype)),(n>a-1||i>s-1)&&(O(this,Math.max(n+1,a),Math.max(i+1,s),r),a=this._size[0],s=this._size[1]),m(n,a),m(i,s);var l=E(n,this._ptr[i],this._ptr[i+1],this._index);return l<this._ptr[i+1]&&this._index[l]===n?u(t,c)?M(l,i,this._values,this._index,this._ptr):this._values[l]=t:A(l,n,i,t,this._values,this._index,this._ptr),this};var E=function(e,t,r,n){if(r-t===0)return r;for(var i=t;r>i;i++)if(n[i]===e)return i;return t},M=function(e,t,r,n,i){r.splice(e,1),n.splice(e,1);for(var o=t+1;o<i.length;o++)i[o]--},A=function(e,t,r,n,i,o,a){i.splice(e,0,n),o.splice(e,0,t);for(var s=r+1;s<a.length;s++)a[s]++};g.prototype.resize=function(e,t,r){if(!f(e))throw new TypeError("Array expected");if(2!==e.length)throw new Error("Only two dimensions matrix are supported");e.forEach(function(t){if(!c.isNumber(t)||!c.isInteger(t)||0>t)throw new TypeError("Invalid size, must contain positive integers (size: "+u.format(e)+")")});var n=r?this.clone():this;return O(n,e[0],e[1],t)};var O=function(e,t,r,n){var i=n||0,o=y,a=0;h(e._datatype)&&(o=d.find(y,[e._datatype,e._datatype])||y,a=d.convert(0,e._datatype),i=d.convert(i,e._datatype));var s,u,c,f=!o(i,a),l=e._size[0],p=e._size[1];if(r>p){for(u=p;r>u;u++)if(e._ptr[u]=e._values.length,f)for(s=0;l>s;s++)e._values.push(i),e._index.push(s);e._ptr[r]=e._values.length}else p>r&&(e._ptr.splice(r+1,p-r),e._values.splice(e._ptr[r],e._values.length),e._index.splice(e._ptr[r],e._index.length));if(p=r,t>l){if(f){var m=0;for(u=0;p>u;u++){e._ptr[u]=e._ptr[u]+m,c=e._ptr[u+1]+m;var g=0;for(s=l;t>s;s++,g++)e._values.splice(c+g,0,i),e._index.splice(c+g,0,s),m++}e._ptr[p]=e._values.length}}else if(l>t){var v=0;for(u=0;p>u;u++){e._ptr[u]=e._ptr[u]-v;var x=e._ptr[u],b=e._ptr[u+1]-v;for(c=x;b>c;c++)s=e._index[c],s>t-1&&(e._values.splice(c,1),e._index.splice(c,1),v++)}e._ptr[u]=e._values.length}return e._size[0]=t,e._size[1]=r,e};g.prototype.clone=function(){var e=new g({values:this._values?s.clone(this._values):void 0,index:s.clone(this._index),ptr:s.clone(this._ptr),size:s.clone(this._size),datatype:this._datatype});return e},g.prototype.size=function(){return this._size.slice(0)},g.prototype.map=function(e,t){if(!this._values)throw new Error("Cannot invoke map on a Pattern only matrix");var r=this,n=this._size[0],i=this._size[1],o=function(t,n,i){return e(t,[n,i],r)};return _(this,0,n-1,0,i-1,o,t)};var _=function(e,t,r,n,i,o,a){var s=[],u=[],c=[],f=y,l=0;h(e._datatype)&&(f=d.find(y,[e._datatype,e._datatype])||y,l=d.convert(0,e._datatype));for(var p=function(e,t,r){e=o(e,t,r),f(e,l)||(s.push(e),u.push(t))},m=n;i>=m;m++){c.push(s.length);for(var v=e._ptr[m],x=e._ptr[m+1],b=t,w=v;x>w;w++){var N=e._index[w];if(N>=t&&r>=N){if(!a)for(var E=b;N>E;E++)p(0,E-t,m-n);p(e._values[w],N-t,m-n)}b=N+1}if(!a)for(var M=b;r>=M;M++)p(0,M-t,m-n)}return c.push(s.length),new g({values:s,index:u,ptr:c,size:[r-t+1,i-n+1]})};g.prototype.forEach=function(e,t){if(!this._values)throw new Error("Cannot invoke forEach on a Pattern only matrix");for(var r=this,n=this._size[0],i=this._size[1],o=0;i>o;o++){for(var a=this._ptr[o],s=this._ptr[o+1],u=0,c=a;s>c;c++){var f=this._index[c];if(!t)for(var l=u;f>l;l++)e(0,[l,o],r);e(this._values[c],[f,o],r),u=f+1}if(!t)for(var p=u;n>p;p++)e(0,[p,o],r)}},g.prototype.toArray=function(){return T(this._values,this._index,this._ptr,this._size,!0)},g.prototype.valueOf=function(){return T(this._values,this._index,this._ptr,this._size,!1)};var T=function(e,t,r,n,i){var o,a,u=n[0],c=n[1],f=[];for(o=0;u>o;o++)for(f[o]=[],a=0;c>a;a++)f[o][a]=0;for(a=0;c>a;a++)for(var l=r[a],p=r[a+1],h=l;p>h;h++)o=t[h],f[o][a]=e?i?s.clone(e[h]):e[h]:1;return f};return g.prototype.format=function(e){for(var t=this._size[0],r=this._size[1],n=this.density(),i="Sparse Matrix ["+u.format(t,e)+" x "+u.format(r,e)+"] density: "+u.format(n,e)+"\n",o=0;r>o;o++)for(var a=this._ptr[o],s=this._ptr[o+1],c=a;s>c;c++){var f=this._index[c];i+="\n    ("+u.format(f,e)+", "+u.format(o,e)+") ==> "+(this._values?u.format(this._values[c],e):"X")}return i},g.prototype.toString=function(){return u.format(this.toArray())},g.prototype.toJSON=function(){return{mathjs:"SparseMatrix",values:this._values,index:this._index,ptr:this._ptr,size:this._size,datatype:this._datatype}},g.prototype.diagonal=function(e){if(e){if(e.isBigNumber===!0&&(e=e.toNumber()),!l(e)||!p(e))throw new TypeError("The parameter k must be an integer number")}else e=0;var t=e>0?e:0,r=0>e?-e:0,n=this._size[0],i=this._size[1],o=Math.min(n-r,i-t),a=[],s=[],u=[];u[0]=0;for(var c=t;i>c&&a.length<o;c++)for(var f=this._ptr[c],h=this._ptr[c+1],m=f;h>m;m++){var d=this._index[m];if(d===c-t+r){a.push(this._values[m]),s[a.length-1]=d-r;break}}return u.push(a.length),new g({values:a,index:s,ptr:u,size:[o,1]})},g.fromJSON=function(e){return new g(e)},g.diagonal=function(e,t,r,n,i){if(!f(e))throw new TypeError("Array expected, size parameter");if(2!==e.length)throw new Error("Only two dimensions matrix are supported");if(e=e.map(function(e){if(e&&e.isBigNumber===!0&&(e=e.toNumber()),!l(e)||!p(e)||1>e)throw new Error("Size values must be positive integers");return e}),r){if(r.isBigNumber===!0&&(r=r.toNumber()),!l(r)||!p(r))throw new TypeError("The parameter k must be an integer number")}else r=0;var o=y,a=0;h(i)&&(o=d.find(y,[i,i])||y,a=d.convert(0,i));var s,u=r>0?r:0,c=0>r?-r:0,m=e[0],v=e[1],x=Math.min(m-c,v-u);if(f(t)){if(t.length!==x)throw new Error("Invalid value array length");s=function(e){return t[e]}}else if(t&&t.isMatrix===!0){var b=t.size();if(1!==b.length||b[0]!==x)throw new Error("Invalid matrix length");s=function(e){return t.get([e])}}else s=function(){return t};for(var w=[],N=[],E=[],M=0;v>M;M++){E.push(w.length);var A=M-u;if(A>=0&&x>A){var O=s(A);o(O,a)||(N.push(A+c),w.push(O))}}return E.push(w.length),new g({values:w,index:N,ptr:E,size:[m,v]})},g.prototype.swapRows=function(e,t){if(!(l(e)&&p(e)&&l(t)&&p(t)))throw new Error("Row index must be positive integers");if(2!==this._size.length)throw new Error("Only two dimensional matrix is supported");return m(e,this._size[0]),m(t,this._size[0]),g._swapRows(e,t,this._size[1],this._values,this._index,this._ptr),this},g._forEachRow=function(e,t,r,n,i){for(var o=n[e],a=n[e+1],s=o;a>s;s++)i(r[s],t[s])},g._swapRows=function(e,t,r,n,i,o){for(var a=0;r>a;a++){var s=o[a],u=o[a+1],c=E(e,s,u,i),f=E(t,s,u,i);if(u>c&&u>f&&i[c]===e&&i[f]===t){if(n){var l=n[c];n[c]=n[f],n[f]=l}}else if(u>c&&i[c]===e&&(f>=u||i[f]!==t)){var p=n?n[c]:void 0;i.splice(f,0,t),n&&n.splice(f,0,p),i.splice(c>=f?c+1:c,1),n&&n.splice(c>=f?c+1:c,1)}else if(u>f&&i[f]===t&&(c>=u||i[c]!==e)){var h=n?n[f]:void 0;i.splice(c,0,e),n&&n.splice(c,0,h),i.splice(f>=c?f+1:f,1),n&&n.splice(f>=c?f+1:f,1)}}},e.Matrix._storage.sparse=g,g}var i=r(39),o=r(42),a=i.array,s=i.object,u=i.string,c=i.number,f=Array.isArray,l=c.isNumber,p=c.isInteger,h=u.isString,m=a.validateIndex;t.name="SparseMatrix",t.path="type",t.factory=n,t.lazy=!1},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("equalScalar",{"boolean, boolean":function(e,t){return e===t},"number, number":function(e,r){return e===r||i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return e.eq(r)||o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return e.equals(t)},"Complex, Complex":function(e,t){return e.equals(t)},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return a(e.value,t.value)},"string, string":function(e,t){return e===t}});return a}var i=r(6).nearlyEqual,o=r(49);t.factory=n},function(e,t){"use strict";e.exports=function(e,t,r){if(null==r)return e.eq(t);if(e.eq(t))return!0;if(e.isNaN()||t.isNaN())return!1;if(e.isFinite()&&t.isFinite()){var n=e.minus(t).abs();if(n.isZero())return!0;var i=e.constructor.max(e.abs(),t.abs());return n.lte(i.times(r))}return!1}},function(e,t,r){"use strict";function n(e,t,n){function i(){if(!(this instanceof i))throw new SyntaxError("Constructor must be called with the new operator");this._values=[],this._heap=new e.FibonacciHeap}var o=n(r(51)),a=n(r(48));return i.prototype.type="Spa",i.prototype.isSpa=!0,i.prototype.set=function(e,t){if(this._values[e])this._values[e].value=t;else{var r=this._heap.insert(e,t);this._values[e]=r}},i.prototype.get=function(e){var t=this._values[e];return t?t.value:0},i.prototype.accumulate=function(e,t){var r=this._values[e];r?r.value=o(r.value,t):(r=this._heap.insert(e,t),this._values[e]=r)},i.prototype.forEach=function(e,t,r){var n=this._heap,i=this._values,o=[],s=n.extractMinimum();for(s&&o.push(s);s&&s.key<=t;)s.key>=e&&(a(s.value,0)||r(s.key,s.value,this)),s=n.extractMinimum(),s&&o.push(s);for(var u=0;u<o.length;u++){var c=o[u];s=n.insert(c.key,c.value),i[s.key]=s}},i.prototype.swap=function(e,t){var r=this._values[e],n=this._values[t];if(!r&&n)r=this._heap.insert(e,n.value),this._heap.remove(n),this._values[e]=r,this._values[t]=void 0;else if(r&&!n)n=this._heap.insert(t,r.value),this._heap.remove(r),this._values[t]=n,this._values[e]=void 0;else if(r&&n){var i=r.value;r.value=n.value,n.value=i}},i}t.name="Spa",t.path="type",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(52)),s=n(r(53)),u=r(32),c=n(r(54)),f=n(r(55)),l=n(r(56)),p=n(r(57)),h=n(r(58)),m=o("add",i({"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,s);break;default:r=c(t,e,s,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,s,!1);break;default:r=p(e,t,s)}}return r},"Array, Array":function(e,t){return m(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return m(a(e),t)},"Matrix, Array":function(e,t){return m(e,a(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,s,!1);break;default:r=h(e,t,s,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=l(t,e,s,!0);break;default:r=h(t,e,s,!0)}return r},"Array, any":function(e,t){return h(a(e),t,s,!1).valueOf()},"any, Array":function(e,t){return h(a(t),e,s,!0).valueOf()}},s.signatures));return m.toTex={2:"\\left(${args[0]}"+u.operators.add+"${args[1]}\\right)"},m}var i=r(3).extend;t.name="add",t.factory=n},function(e,t){"use strict";function r(e,t,r,n){function i(t,r,n){
var i=e.Matrix.storage(r||"default");return new i(t,n)}var o=n("matrix",{"":function(){return i([])},string:function(e){return i([],e)},"string, string":function(e,t){return i([],e,t)},Array:function(e){return i(e)},Matrix:function(e){return i(e,e.storage())},"Array | Matrix, string":i,"Array | Matrix, string, string":i});return o.toTex={0:"\\begin{bmatrix}\\end{bmatrix}",1:"\\left(${args[0]}\\right)",2:"\\left(${args[0]}\\right)"},o}t.name="matrix",t.factory=r},function(e,t){"use strict";function r(e,t,r,n){var i=n("add",{"number, number":function(e,t){return e+t},"Complex, Complex":function(e,t){return e.add(t)},"BigNumber, BigNumber":function(e,t){return e.plus(t)},"Fraction, Fraction":function(e,t){return e.add(t)},"Unit, Unit":function(e,t){if(null==e.value)throw new Error("Parameter x contains a unit with undefined value");if(null==t.value)throw new Error("Parameter y contains a unit with undefined value");if(!e.equalBase(t))throw new Error("Units do not match");var r=e.clone();return r.value=i(r.value,t.value),r.fixPrefix=!1,r}});return i}t.factory=r},function(e,t,r){"use strict";function n(e,t,r,n){var o=e.DenseMatrix,a=function(e,t,r,a){var s=e._data,u=e._size,c=e._datatype,f=t._values,l=t._index,p=t._ptr,h=t._size,m=t._datatype;if(u.length!==h.length)throw new i(u.length,h.length);if(u[0]!==h[0]||u[1]!==h[1])throw new RangeError("Dimension mismatch. Matrix A ("+u+") must match Matrix B ("+h+")");if(!f)throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");var d,g,v=u[0],y=u[1],x="string"==typeof c&&c===m?c:void 0,b=x?n.find(r,[x,x]):r,w=[];for(d=0;v>d;d++)w[d]=[];var N=[],E=[];for(g=0;y>g;g++){for(var M=g+1,A=p[g],O=p[g+1],_=A;O>_;_++)d=l[_],N[d]=a?b(f[_],s[d][g]):b(s[d][g],f[_]),E[d]=M;for(d=0;v>d;d++)E[d]===M?w[d][g]=N[d]:w[d][g]=s[d][g]}return new o({data:w,size:[v,y],datatype:x})};return a}var i=r(42);t.name="algorithm01",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(48)),s=e.SparseMatrix,u=function(e,t,r){var n=e._values,u=e._index,c=e._ptr,f=e._size,l=e._datatype,p=t._values,h=t._index,m=t._ptr,d=t._size,g=t._datatype;if(f.length!==d.length)throw new i(f.length,d.length);if(f[0]!==d[0]||f[1]!==d[1])throw new RangeError("Dimension mismatch. Matrix A ("+f+") must match Matrix B ("+d+")");var v,y=f[0],x=f[1],b=a,w=0,N=r;"string"==typeof l&&l===g&&(v=l,b=o.find(a,[v,v]),w=o.convert(0,v),N=o.find(r,[v,v]));var E,M,A,O,_,T=n&&p?[]:void 0,C=[],S=[],z=new s({values:T,index:C,ptr:S,size:[y,x],datatype:v}),B=n&&p?[]:void 0,k=n&&p?[]:void 0,I=[],P=[];for(M=0;x>M;M++){S[M]=C.length;var R=M+1;for(O=c[M],_=c[M+1],A=O;_>A;A++)E=u[A],C.push(E),I[E]=R,B&&(B[E]=n[A]);for(O=m[M],_=m[M+1],A=O;_>A;A++)if(E=h[A],I[E]===R){if(B){var U=N(B[E],p[A]);b(U,w)?I[E]=null:B[E]=U}}else C.push(E),P[E]=R,k&&(k[E]=p[A]);if(B&&k)for(A=S[M];A<C.length;)E=C[A],I[E]===R?(T[A]=B[E],A++):P[E]===R?(T[A]=k[E],A++):C.splice(A,1)}return S[x]=C.length,z};return u}var i=r(42);t.name="algorithm04",t.factory=n},function(e,t){"use strict";function r(e,t,r,n){var i=e.DenseMatrix,o=function(e,t,r,o){var a=e._values,s=e._index,u=e._ptr,c=e._size,f=e._datatype;if(!a)throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");var l,p=c[0],h=c[1],m=r;"string"==typeof f&&(l=f,t=n.convert(t,l),m=n.find(r,[l,l]));for(var d=[],g=new i({data:d,size:[p,h],datatype:l}),v=[],y=[],x=0;h>x;x++){for(var b=x+1,w=u[x],N=u[x+1],E=w;N>E;E++){var M=s[E];v[M]=a[E],y[M]=b}for(var A=0;p>A;A++)0===x&&(d[A]=[]),y[A]===b?d[A][x]=o?m(t,v[A]):m(v[A],t):d[A][x]=t}return g};return o}t.name="algorithm10",t.factory=r},function(e,t,r){"use strict";function n(e,t,r,n){var i=e.DenseMatrix,a=function(e,t,r){var a=e._data,u=e._size,c=e._datatype,f=t._data,l=t._size,p=t._datatype,h=[];if(u.length!==l.length)throw new o(u.length,l.length);for(var m=0;m<u.length;m++){if(u[m]!==l[m])throw new RangeError("Dimension mismatch. Matrix A ("+u+") must match Matrix B ("+l+")");h[m]=u[m]}var d,g=r;"string"==typeof c&&c===p&&(d=c,t=n.convert(t,d),g=n.find(r,[d,d]));var v=h.length>0?s(g,0,h,h[0],a,f):[];return new i({data:v,size:h,datatype:d})},s=function(e,t,r,n,i,o){var a=[];if(t===r.length-1)for(var u=0;n>u;u++)a[u]=e(i[u],o[u]);else for(var c=0;n>c;c++)a[c]=s(e,t+1,r,r[t+1],i[c],o[c]);return a};return a}var i=r(39),o=r(42),a=i.string;a.isString;t.name="algorithm13",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=e.DenseMatrix,a=function(e,t,r,a){var u,c=e._data,f=e._size,l=e._datatype,p=r;"string"==typeof l&&(u=l,t=n.convert(t,u),p=n.find(r,[u,u]));var h=f.length>0?s(p,0,f,f[0],c,t,a):[];return new o({data:h,size:i(f),datatype:u})},s=function(e,t,r,n,i,o,a){var u=[];if(t===r.length-1)for(var c=0;n>c;c++)u[c]=a?e(o,i[c]):e(i[c],o);else for(var f=0;n>f;f++)u[f]=s(e,t+1,r,r[t+1],i[f],o,a);return u};return a}var i=r(3).clone;t.name="algorithm14",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");this._minimum=null,this._size=0}var a=n(r(60)),s=n(r(64)),u=1/Math.log((1+Math.sqrt(5))/2);o.prototype.type="FibonacciHeap",o.prototype.isFibonacciHeap=!0,o.prototype.insert=function(e,t){var r={key:e,value:t,degree:0};if(this._minimum){var n=this._minimum;r.left=n,r.right=n.right,n.right=r,r.right.left=r,a(e,n.key)&&(this._minimum=r)}else r.left=r,r.right=r,this._minimum=r;return this._size++,r},o.prototype.size=function(){return this._size},o.prototype.clear=function(){this._minimum=null,this._size=0},o.prototype.isEmpty=function(){return!!this._minimum},o.prototype.extractMinimum=function(){var e=this._minimum;if(null===e)return e;for(var t=this._minimum,r=e.degree,n=e.child;r>0;){var i=n.right;n.left.right=n.right,n.right.left=n.left,n.left=t,n.right=t.right,t.right=n,n.right.left=n,n.parent=null,n=i,r--}return e.left.right=e.right,e.right.left=e.left,e==e.right?t=null:(t=e.right,t=h(t,this._size)),this._size--,this._minimum=t,e},o.prototype.remove=function(e){this._minimum=c(this._minimum,e,-1),this.extractMinimum()};var c=function(e,t,r){t.key=r;var n=t.parent;return n&&a(t.key,n.key)&&(f(e,t,n),l(e,n)),a(t.key,e.key)&&(e=t),e},f=function(e,t,r){t.left.right=t.right,t.right.left=t.left,r.degree--,r.child==t&&(r.child=t.right),0===r.degree&&(r.child=null),t.left=e,t.right=e.right,e.right=t,t.right.left=t,t.parent=null,t.mark=!1},l=function(e,t){var r=t.parent;r&&(t.mark?(f(e,t,r),l(r)):t.mark=!0)},p=function(e,t){e.left.right=e.right,e.right.left=e.left,e.parent=t,t.child?(e.left=t.child,e.right=t.child.right,t.child.right=e,e.right.left=e):(t.child=e,e.right=e,e.left=e),t.degree++,e.mark=!1},h=function(e,t){var r=Math.floor(Math.log(t)*u)+1,n=new Array(r),i=0,o=e;if(o)for(i++,o=o.right;o!==e;)i++,o=o.right;for(var c;i>0;){for(var f=o.degree,l=o.right;;){if(c=n[f],!c)break;if(s(o.key,c.key)){var h=c;c=o,o=h}p(c,o),n[f]=null,f++}n[f]=o,o=l,i--}e=null;for(var m=0;r>m;m++)c=n[m],c&&(e?(c.left.right=c.right,c.right.left=c.left,c.left=e,c.right=e.right,e.right=c,c.right.left=c,a(c.key,e.key)&&(e=c)):e=c);return e};return o}t.name="FibonacciHeap",t.path="type",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(62)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=r(32),m=a("smaller",{"boolean, boolean":function(e,t){return t>e},"number, number":function(e,r){return r>e&&!i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return e.lt(r)&&!o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return-1===e.compare(t)},"Complex, Complex":function(e,t){throw new TypeError("No ordering relation is defined for complex numbers")},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return m(e.value,t.value)},"string, string":function(e,t){return t>e},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,m);break;default:r=u(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,m,!1);break;default:r=l(e,t,m)}}return r},"Array, Array":function(e,t){return m(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return m(s(e),t)},"Matrix, Array":function(e,t){return m(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=p(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,m,!0);break;default:r=p(t,e,m,!0)}return r},"Array, any":function(e,t){return p(s(e),t,m,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+h.operators.smaller+"${args[1]}\\right)"},m}var i=r(6).nearlyEqual,o=r(49);t.name="smaller",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=e.DenseMatrix,a=function(e,t,r,a){var s=e._data,u=e._size,c=e._datatype,f=t._values,l=t._index,p=t._ptr,h=t._size,m=t._datatype;if(u.length!==h.length)throw new i(u.length,h.length);if(u[0]!==h[0]||u[1]!==h[1])throw new RangeError("Dimension mismatch. Matrix A ("+u+") must match Matrix B ("+h+")");if(!f)throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");var d,g=u[0],v=u[1],y=0,x=r;"string"==typeof c&&c===m&&(d=c,y=n.convert(0,d),x=n.find(r,[d,d]));for(var b=[],w=0;g>w;w++)b[w]=[];for(var N=[],E=[],M=0;v>M;M++){for(var A=M+1,O=p[M],_=p[M+1],T=O;_>T;T++){var C=l[T];N[C]=a?x(f[T],s[C][M]):x(s[C][M],f[T]),E[C]=A}for(var S=0;g>S;S++)E[S]===A?b[S][M]=N[S]:b[S][M]=a?x(y,s[S][M]):x(s[S][M],y)}return new o({data:b,size:[g,v],datatype:d})};return a}var i=r(42);t.name="algorithm03",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=e.DenseMatrix,a=function(e,t,r){var a=e._size,u=e._datatype,c=t._size,f=t._datatype;if(a.length!==c.length)throw new i(a.length,c.length);if(a[0]!==c[0]||a[1]!==c[1])throw new RangeError("Dimension mismatch. Matrix A ("+a+") must match Matrix B ("+c+")");var l,p=a[0],h=a[1],m=0,d=r;"string"==typeof u&&u===f&&(l=u,m=n.convert(0,l),d=n.find(r,[l,l]));var g,v,y=[];for(g=0;p>g;g++)y[g]=[];var x=new o({data:y,size:[p,h],datatype:l}),b=[],w=[],N=[],E=[];for(v=0;h>v;v++){var M=v+1;for(s(e,v,N,b,M),s(t,v,E,w,M),g=0;p>g;g++){var A=N[g]===M?b[g]:m,O=E[g]===M?w[g]:m;y[g][v]=d(A,O)}}return x},s=function(e,t,r,n,i){for(var o=e._values,a=e._index,s=e._ptr,u=s[t],c=s[t+1];c>u;u++){var f=a[u];r[f]=i,n[f]=o[u]}};return a}var i=r(42);t.name="algorithm07",t.factory=n},function(e,t){"use strict";function r(e,t,r,n){var i=e.DenseMatrix,o=function(e,t,r,o){var a=e._values,s=e._index,u=e._ptr,c=e._size,f=e._datatype;if(!a)throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");var l,p=c[0],h=c[1],m=r;"string"==typeof f&&(l=f,t=n.convert(t,l),m=n.find(r,[l,l]));for(var d=[],g=new i({data:d,size:[p,h],datatype:l}),v=[],y=[],x=0;h>x;x++){for(var b=x+1,w=u[x],N=u[x+1],E=w;N>E;E++){var M=s[E];v[M]=a[E],y[M]=b}for(var A=0;p>A;A++)0===x&&(d[A]=[]),y[A]===b?d[A][x]=o?m(t,v[A]):m(v[A],t):d[A][x]=o?m(t,0):m(0,t)}return g};return o}t.name="algorithm12",t.factory=r},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(62)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=r(32),m=a("larger",{"boolean, boolean":function(e,t){return e>t},"number, number":function(e,r){return e>r&&!i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return e.gt(r)&&!o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return 1===e.compare(t)},"Complex, Complex":function(){throw new TypeError("No ordering relation is defined for complex numbers")},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return m(e.value,t.value)},"string, string":function(e,t){return e>t},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,m);break;default:r=u(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,m,!1);break;default:r=l(e,t,m)}}return r},"Array, Array":function(e,t){return m(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return m(s(e),t)},"Matrix, Array":function(e,t){return m(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=p(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,m,!0);break;default:r=p(t,e,m,!0)}return r},"Array, any":function(e,t){return p(s(e),t,m,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+h.operators.larger+"${args[1]}\\right)"},m}var i=r(6).nearlyEqual,o=r(49);t.name="larger",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){function o(e,t){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(t&&!u(t))throw new Error("Invalid datatype: "+t);if(e&&e.isMatrix===!0||s(e)){var r=new c(e,t);this._data=r._data,this._size=r._size,this._datatype=r._datatype,this._min=null,this._max=null}else if(e&&s(e.data)&&s(e.size))this._data=e.data,this._size=e.size,this._datatype=e.datatype,this._min="undefined"!=typeof e.min?e.min:null,this._max="undefined"!=typeof e.max?e.max:null;else{if(e)throw new TypeError("Unsupported type of data ("+i.types.type(e)+")");this._data=[],this._size=[0],this._datatype=t,this._min=null,this._max=null}}var c=n(r(46)),f=n(r(60));return o.prototype=new c,o.prototype.type="ImmutableDenseMatrix",o.prototype.isImmutableDenseMatrix=!0,o.prototype.subset=function(e){switch(arguments.length){case 1:var t=c.prototype.subset.call(this,e);return t.isMatrix?new o({data:t._data,size:t._size,datatype:t._datatype}):t;case 2:case 3:throw new Error("Cannot invoke set subset on an Immutable Matrix instance");default:throw new SyntaxError("Wrong number of arguments")}},o.prototype.set=function(){throw new Error("Cannot invoke set on an Immutable Matrix instance")},o.prototype.resize=function(){throw new Error("Cannot invoke resize on an Immutable Matrix instance")},o.prototype.clone=function(){var e=new o({data:a.clone(this._data),size:a.clone(this._size),datatype:this._datatype});return e},o.prototype.toJSON=function(){return{mathjs:"ImmutableDenseMatrix",data:this._data,size:this._size,datatype:this._datatype}},o.fromJSON=function(e){return new o(e)},o.prototype.swapRows=function(){throw new Error("Cannot invoke swapRows on an Immutable Matrix instance")},o.prototype.min=function(){if(null===this._min){var e=null;this.forEach(function(t){(null===e||f(t,e))&&(e=t)}),this._min=null!==e?e:void 0}return this._min},o.prototype.max=function(){if(null===this._max){var e=null;this.forEach(function(t){(null===e||f(e,t))&&(e=t)}),this._max=null!==e?e:void 0}return this._max},o}var i=r(39),o=i.string,a=i.object,s=Array.isArray,u=o.isString;t.name="ImmutableDenseMatrix",t.path="type",t.factory=n},function(e,t,r){"use strict";function n(e){function t(e){if(!(this instanceof t))throw new SyntaxError("Constructor must be called with the new operator");this._dimensions=[],this._isScalar=!0;for(var n=0,i=arguments.length;i>n;n++){var o=arguments[n];if(o&&o.isRange===!0)this._dimensions.push(o),this._isScalar=!1;else if(o&&(Array.isArray(o)||o.isMatrix===!0)){var a=r(o.valueOf());this._dimensions.push(a);var s=a.size();1===s.length&&1===s[0]||(this._isScalar=!1)}else if("number"==typeof o)this._dimensions.push(r([o]));else{if("string"!=typeof o)throw new TypeError("Dimension must be an Array, Matrix, number, string, or Range");this._dimensions.push(o)}}}function r(t){for(var r=0,n=t.length;n>r;r++)if("number"!=typeof t[r]||!o(t[r]))throw new TypeError("Index parameters must be positive integer numbers");return new e.ImmutableDenseMatrix(t)}return t.prototype.type="Index",t.prototype.isIndex=!0,t.prototype.clone=function(){var e=new t;return e._dimensions=i(this._dimensions),e._isScalar=this._isScalar,e},t.create=function(e){var r=new t;return t.apply(r,e),r},t.prototype.size=function(){for(var e=[],t=0,r=this._dimensions.length;r>t;t++){var n=this._dimensions[t];e[t]="string"==typeof n?1:n.size()[0]}return e},t.prototype.max=function(){for(var e=[],t=0,r=this._dimensions.length;r>t;t++){var n=this._dimensions[t];e[t]="string"==typeof n?n:n.max()}return e},t.prototype.min=function(){for(var e=[],t=0,r=this._dimensions.length;r>t;t++){var n=this._dimensions[t];e[t]="string"==typeof n?n:n.min()}return e},t.prototype.forEach=function(e){for(var t=0,r=this._dimensions.length;r>t;t++)e(this._dimensions[t],t,this)},t.prototype.dimension=function(e){return this._dimensions[e]||null},t.prototype.isObjectProperty=function(){return 1===this._dimensions.length&&"string"==typeof this._dimensions[0]},t.prototype.getObjectProperty=function(){return this.isObjectProperty()?this._dimensions[0]:null},t.prototype.isScalar=function(){return this._isScalar},t.prototype.toArray=function(){for(var e=[],t=0,r=this._dimensions.length;r>t;t++){var n=this._dimensions[t];e.push("string"==typeof n?n:n.toArray())}return e},t.prototype.valueOf=t.prototype.toArray,t.prototype.toString=function(){for(var e=[],t=0,r=this._dimensions.length;r>t;t++){var n=this._dimensions[t];"string"==typeof n?e.push(JSON.stringify(n)):e.push(n.toString())}return"["+e.join(", ")+"]"},t.prototype.toJSON=function(){return{mathjs:"Index",dimensions:this._dimensions}},t.fromJSON=function(e){return t.create(e.dimensions)},t}var i=r(3).clone,o=r(6).isInteger;t.name="Index",t.path="type",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){function o(e,t,r){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(null!=e)if(e.isBigNumber===!0)e=e.toNumber();else if("number"!=typeof e)throw new TypeError("Parameter start must be a number");if(null!=t)if(t.isBigNumber===!0)t=t.toNumber();else if("number"!=typeof t)throw new TypeError("Parameter end must be a number");if(null!=r)if(r.isBigNumber===!0)r=r.toNumber();else if("number"!=typeof r)throw new TypeError("Parameter step must be a number");this.start=null!=e?parseFloat(e):0,this.end=null!=t?parseFloat(t):0,this.step=null!=r?parseFloat(r):1}return o.prototype.type="Range",o.prototype.isRange=!0,o.parse=function(e){if("string"!=typeof e)return null;var t=e.split(":"),r=t.map(function(e){return parseFloat(e)}),n=r.some(function(e){return isNaN(e)});if(n)return null;switch(r.length){case 2:return new o(r[0],r[1]);case 3:return new o(r[0],r[2],r[1]);default:return null}},o.prototype.clone=function(){return new o(this.start,this.end,this.step)},o.prototype.size=function(){var e=0,t=this.start,r=this.step,n=this.end,o=n-t;return i.sign(r)==i.sign(o)?e=Math.ceil(o/r):0==o&&(e=0),isNaN(e)&&(e=0),[e]},o.prototype.min=function(){var e=this.size()[0];return e>0?this.step>0?this.start:this.start+(e-1)*this.step:void 0},o.prototype.max=function(){var e=this.size()[0];return e>0?this.step>0?this.start+(e-1)*this.step:this.start:void 0},o.prototype.forEach=function(e){var t=this.start,r=this.step,n=this.end,i=0;if(r>0)for(;n>t;)e(t,[i],this),t+=r,i++;else if(0>r)for(;t>n;)e(t,[i],this),t+=r,i++},o.prototype.map=function(e){var t=[];return this.forEach(function(r,n,i){t[n[0]]=e(r,n,i)}),t},o.prototype.toArray=function(){var e=[];return this.forEach(function(t,r){e[r[0]]=t}),e},o.prototype.valueOf=function(){return this.toArray()},o.prototype.format=function(e){var t=i.format(this.start,e);return 1!=this.step&&(t+=":"+i.format(this.step,e)),t+=":"+i.format(this.end,e)},o.prototype.toString=function(){return this.format()},o.prototype.toJSON=function(){return{mathjs:"Range",start:this.start,end:this.end,step:this.step}},o.fromJSON=function(e){return new o(e.start,e.end,e.step)},o}var i=r(6);t.name="Range",t.path="type",t.factory=n},function(e,t){"use strict";function r(e,t,r,n){return n("index",{"...number | string | BigNumber | Range | Array | Matrix":function(t){var r=t.map(function(e){return e&&e.isBigNumber===!0?e.toNumber():e&&(Array.isArray(e)||e.isMatrix===!0)?e.map(function(e){return e&&e.isBigNumber===!0?e.toNumber():e}):e}),n=new e.Index;return e.Index.apply(n,r),n}})}t.name="index",t.factory=r},function(e,t){"use strict";function r(e,t,r,n){var i=e.SparseMatrix,o=n("sparse",{"":function(){return new i([])},string:function(e){return new i([],e)},"Array | Matrix":function(e){return new i(e)},"Array | Matrix, string":function(e,t){return new i(e,t)}});return o.toTex={0:"\\begin{bsparse}\\end{bsparse}",1:"\\left(${args[0]}\\right)"},o}t.name="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("number",{"":function(){return 0},number:function(e){return e},string:function(e){var t=Number(e);if(isNaN(t))throw new SyntaxError('String "'+e+'" is no valid number');return t},BigNumber:function(e){return e.toNumber()},Fraction:function(e){return e.valueOf()},Unit:function(e){throw new Error("Second argument with valueless unit expected")},"Unit, string | Unit":function(e,t){return e.toNumber(t)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={0:"0",1:"\\left(${args[0]}\\right)",2:"\\left(\\left(${args[0]}\\right)${args[1]}\\right)"},o}var i=r(19);t.name="number",t.factory=n},function(e,t,r){e.exports=[r(72)]},function(e,t){"use strict";function r(e,t,r,n){function i(e){if(!(this instanceof i))throw new SyntaxError("Constructor must be called with the new operator");this.entries=e||[]}return i.prototype.type="ResultSet",i.prototype.isResultSet=!0,i.prototype.valueOf=function(){return this.entries},i.prototype.toString=function(){return"["+this.entries.join(", ")+"]"},i.prototype.toJSON=function(){return{mathjs:"ResultSet",entries:this.entries}},i.fromJSON=function(e){return new i(e.entries)},i}t.name="ResultSet",t.path="type",t.factory=r},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("string",{"":function(){return""},number:o.format,"null":function(e){return"null"},"boolean":function(e){return e+""},string:function(e){return e},"Array | Matrix":function(e){return i(e,a)},any:function(e){return String(e)}});return a.toTex={0:'\\mathtt{""}',1:"\\mathrm{string}\\left(${args[0]}\\right)"},a}var i=r(19),o=r(6);t.name="string",t.factory=n},function(e,t,r){e.exports=[r(75),r(96),r(97),r(98),r(99)]},function(e,t,r){"use strict";function n(e,t,n,s,u){function c(e,t){if(!(this instanceof c))throw new Error("Constructor must be called with the new operator");if(void 0!==e&&!C(e)&&!e.isComplex)throw new TypeError("First parameter in Unit constructor must be number, BigNumber, Fraction, Complex, or undefined");if(void 0!=t&&("string"!=typeof t||""==t))throw new TypeError("Second parameter in Unit constructor must be a string");if(void 0!=t){var r=c.parse(t);this.units=r.units,this.dimensions=r.dimensions}else{this.units=[{unit:$,prefix:q.NONE,power:0}],this.dimensions=[];for(var n=0;n<j.length;n++)this.dimensions[n]=0}this.value=void 0!=e?this._normalize(e):null,this.fixPrefix=!1,this.isUnitListSimplified=!0}function f(){for(;" "==R||"	"==R;)h()}function l(e){return e>="0"&&"9">=e||"."==e}function p(e){return e>="0"&&"9">=e}function h(){P++,R=I.charAt(P)}function m(e){P=e,R=I.charAt(P)}function d(){var e,t="";if(e=P,"+"==R?h():"-"==R&&(t+=R,h()),!l(R))return m(e),null;if("."==R){if(t+=R,h(),!p(R))return m(e),null}else{for(;p(R);)t+=R,h();"."==R&&(t+=R,h())}for(;p(R);)t+=R,h();if("E"==R||"e"==R){var r="",n=P;if(r+=R,h(),"+"!=R&&"-"!=R||(r+=R,h()),!p(R))return m(n),t;for(t+=r;p(R);)t+=R,h()}return t}function g(){for(var e="",t=I.charCodeAt(P);t>=48&&57>=t||t>=65&&90>=t||t>=97&&122>=t;)e+=R,h(),t=I.charCodeAt(P);return t=e.charCodeAt(0),t>=65&&90>=t||t>=97&&122>=t?e||null:null}function v(e){return R===e?(h(),e):null}function y(e){if(G.hasOwnProperty(e)){var t=G[e],r=t.prefixes[""];return{unit:t,prefix:r}}for(var n in G)if(G.hasOwnProperty(n)&&i(e,n)){var t=G[n],o=e.length-n.length,a=e.substring(0,o),r=t.prefixes[a];if(void 0!==r)return{unit:t,prefix:r}}return null}function x(t){if("BigNumber"===t.number){var r=a.pi(e.BigNumber);G.rad.value=new e.BigNumber(1),G.deg.value=r.div(180),G.grad.value=r.div(200),G.cycle.value=r.times(2),G.arcsec.value=r.div(648e3),G.arcmin.value=r.div(10800)}else G.rad.value=1,G.deg.value=Math.PI/180,G.grad.value=Math.PI/200,G.cycle.value=2*Math.PI,G.arcsec.value=Math.PI/648e3,G.arcmin.value=Math.PI/10800}function b(e){for(var t=0;t<e.length;t++){var r=e.charAt(t),n=function(e){return/^[a-zA-Z]$/.test(e)},i=function(e){return e>="0"&&"9">=e};if(0===t&&!n(r))throw new Error('Invalid unit name (must begin with alpha character): "'+e+'"');if(t>0&&!n(r)&&!i(r))throw new Error('Invalid unit name (only alphanumeric characters are allowed): "'+e+'"')}}var w=n(r(53)),N=n(r(77)),E=n(r(80)),M=n(r(81)),A=n(r(82)),O=n(r(86)),_=n(r(87)),T=n(r(88)),C=n(r(89)),S=n(r(90)),z=n(r(91)),B=n(r(70)),k=n(r(27));c.prototype.type="Unit",c.prototype.isUnit=!0;var I,P,R;c.parse=function(r,n){if(n=n||{},I=r,P=-1,R="","string"!=typeof I)throw new TypeError("Invalid argument in Unit.parse, string expected");var i=new c;i.units=[],h(),f();var o=d(),a=null;o&&(a="BigNumber"===t.number?new e.BigNumber(o):"Fraction"===t.number?new e.Fraction(o):parseFloat(o)),f();for(var s=1,u=!1,l=[],p=1;;){for(f();"("===R;)l.push(s),p*=s,s=1,h(),f();if(!R)break;var m=R,x=g();if(null==x)throw new SyntaxError('Unexpected "'+m+'" in "'+I+'" at index '+P.toString());var b=y(x);if(null==b)throw new SyntaxError('Unit "'+x+'" not found.');var w=s*p;if(f(),v("^")){f();var N=d();if(null==N)throw new SyntaxError('In "'+r+'", "^" must be followed by a floating-point number');w*=N}i.units.push({unit:b.unit,prefix:b.prefix,power:w});for(var E=0;E<j.length;E++)i.dimensions[E]+=(b.unit.dimensions[E]||0)*w;for(f();")"===R;){if(0===l.length)throw new SyntaxError('Unmatched ")" in "'+I+'" at index '+P.toString());p/=l.pop(),h(),f()}if(u=!1,v("*")?(s=1,u=!0):v("/")?(s=-1,u=!0):s=1,b.unit.base){var M=b.unit.base.key;Z.auto[M]={unit:b.unit,prefix:b.prefix}}}if(f(),R)throw new SyntaxError('Could not parse: "'+r+'"');if(u)throw new SyntaxError('Trailing characters: "'+r+'"');if(0!==l.length)throw new SyntaxError('Unmatched "(" in "'+I+'"');if(0==i.units.length&&!n.allowNoUnits)throw new SyntaxError('"'+r+'" contains no units');return i.value=void 0!=a?i._normalize(a):null,i},c.prototype.clone=function(){var e=new c;e.fixPrefix=this.fixPrefix,e.isUnitListSimplified=this.isUnitListSimplified,e.value=o(this.value),e.dimensions=this.dimensions.slice(0),e.units=[];for(var t=0;t<this.units.length;t++){e.units[t]={};for(var r in this.units[t])this.units[t].hasOwnProperty(r)&&(e.units[t][r]=this.units[t][r])}return e},c.prototype._isDerived=function(){return 0===this.units.length?!1:this.units.length>1||Math.abs(this.units[0].power-1)>1e-15},c.prototype._normalize=function(e){var t,r,n,i,o;if(null==e||0===this.units.length)return e;if(this._isDerived()){var a=e;o=c._getNumberConverter(z(e));for(var s=0;s<this.units.length;s++)t=o(this.units[s].unit.value),i=o(this.units[s].prefix.value),n=o(this.units[s].power),a=E(a,A(E(t,i),n));return a}return o=c._getNumberConverter(z(e)),t=o(this.units[0].unit.value),r=o(this.units[0].unit.offset),i=o(this.units[0].prefix.value),E(w(e,r),E(t,i))},c.prototype._denormalize=function(e,t){var r,n,i,o,a;if(null==e||0===this.units.length)return e;if(this._isDerived()){var s=e;a=c._getNumberConverter(z(e));for(var u=0;u<this.units.length;u++)r=a(this.units[u].unit.value),o=a(this.units[u].prefix.value),i=a(this.units[u].power),s=M(s,A(E(r,o),i));return s}return a=c._getNumberConverter(z(e)),r=a(this.units[0].unit.value),o=a(this.units[0].prefix.value),n=a(this.units[0].unit.offset),void 0==t?N(M(M(e,r),o),n):N(M(M(e,r),t),n)},c.isValuelessUnit=function(e){return null!=y(e)},c.prototype.hasBase=function(e){if("string"==typeof e&&(e=F[e]),!e)return!1;for(var t=0;t<j.length;t++)if(Math.abs((this.dimensions[t]||0)-(e.dimensions[t]||0))>1e-12)return!1;return!0},c.prototype.equalBase=function(e){for(var t=0;t<j.length;t++)if(Math.abs((this.dimensions[t]||0)-(e.dimensions[t]||0))>1e-12)return!1;return!0},c.prototype.equals=function(e){return this.equalBase(e)&&T(this.value,e.value)},c.prototype.multiply=function(e){for(var t=this.clone(),r=0;r<j.length;r++)t.dimensions[r]=(this.dimensions[r]||0)+(e.dimensions[r]||0);for(var r=0;r<e.units.length;r++){var n={};for(var i in e.units[r])n[i]=e.units[r][i];t.units.push(n)}if(null!=this.value||null!=e.value){var o=null==this.value?this._normalize(1):this.value,a=null==e.value?e._normalize(1):e.value;t.value=E(o,a)}else t.value=null;return t.isUnitListSimplified=!1,U(t)},c.prototype.divide=function(e){for(var t=this.clone(),r=0;r<j.length;r++)t.dimensions[r]=(this.dimensions[r]||0)-(e.dimensions[r]||0);for(var r=0;r<e.units.length;r++){var n={};for(var i in e.units[r])n[i]=e.units[r][i];n.power=-n.power,t.units.push(n)}if(null!=this.value||null!=e.value){var o=null==this.value?this._normalize(1):this.value,a=null==e.value?e._normalize(1):e.value;t.value=M(o,a)}else t.value=null;return t.isUnitListSimplified=!1,U(t)},c.prototype.pow=function(e){for(var t=this.clone(),r=0;r<j.length;r++)t.dimensions[r]=(this.dimensions[r]||0)*e;for(var r=0;r<t.units.length;r++)t.units[r].power*=e;return null!=t.value?t.value=A(t.value,e):t.value=null,t.isUnitListSimplified=!1,U(t)};var U=function(e){return e.equalBase(F.NONE)&&null!==e.value&&!t.predictable?e.value:e};c.prototype.abs=function(){var e=this.clone();e.value=O(e.value);for(var t in e.units)"VA"!==e.units[t].unit.name&&"VAR"!==e.units[t].unit.name||(e.units[t].unit=G.W);return e},c.prototype.to=function(e){var t,r=null==this.value?this._normalize(1):this.value;if("string"==typeof e){if(t=c.parse(e),!this.equalBase(t))throw new Error("Units do not match");if(null!==t.value)throw new Error("Cannot convert to a unit with a value");return t.value=o(r),t.fixPrefix=!0,t.isUnitListSimplified=!0,t}if(e&&e.isUnit){if(!this.equalBase(e))throw new Error("Units do not match");if(null!==e.value)throw new Error("Cannot convert to a unit with a value");return t=e.clone(),t.value=o(r),t.fixPrefix=!0,t.isUnitListSimplified=!0,t}throw new Error("String or Unit expected as parameter")},c.prototype.toNumber=function(e){return B(this.toNumeric(e))},c.prototype.toNumeric=function(e){var t=this;return e&&(t=this.to(e)),t._isDerived()?t._denormalize(t.value):t._denormalize(t.value,t.units[0].prefix.value)},c.prototype.toString=function(){return this.format()},c.prototype.toJSON=function(){return{mathjs:"Unit",value:this._denormalize(this.value),unit:this.formatUnits(),fixPrefix:this.fixPrefix}},c.fromJSON=function(e){var t=new c(e.value,e.unit);return t.fixPrefix=e.fixPrefix||!1,t},c.prototype.valueOf=c.prototype.toString,c.prototype.simplifyUnitListLazy=function(){if(!this.isUnitListSimplified&&null!=this.value){var e,t=[];for(var n in V)if(this.hasBase(F[n])){e=n;break}if("NONE"===e)this.units=[];else{var i;e&&V.hasOwnProperty(e)&&(i=V[e]);if(i)this.units=[{unit:i.unit,prefix:i.prefix,power:1}];else{for(var o=!1,a=0;a<j.length;a++){var s=j[a];Math.abs(this.dimensions[a]||0)>1e-12&&(V.hasOwnProperty(s)?t.push({unit:V[s].unit,prefix:V[s].prefix,power:this.dimensions[a]||0}):o=!0)}r(92);t.length<this.units.length&&!o&&(this.units=t)}}this.isUnitListSimplified=!0}},c.prototype.formatUnits=function(){this.simplifyUnitListLazy();for(var e="",t="",r=0,n=0,i=0;i<this.units.length;i++)this.units[i].power>0?(r++,e+=" "+this.units[i].prefix.name+this.units[i].unit.name,Math.abs(this.units[i].power-1)>1e-15&&(e+="^"+this.units[i].power)):this.units[i].power<0&&n++;if(n>0)for(var i=0;i<this.units.length;i++)this.units[i].power<0&&(r>0?(t+=" "+this.units[i].prefix.name+this.units[i].unit.name,Math.abs(this.units[i].power+1)>1e-15&&(t+="^"+-this.units[i].power)):(t+=" "+this.units[i].prefix.name+this.units[i].unit.name,t+="^"+this.units[i].power));e=e.substr(1),t=t.substr(1),r>1&&n>0&&(e="("+e+")"),n>1&&r>0&&(t="("+t+")");var o=e;return r>0&&n>0&&(o+=" / "),o+=t},c.prototype.format=function(e){this.simplifyUnitListLazy();var t=!1,r=!0;"undefined"!=typeof this.value&&null!==this.value&&this.value.isComplex&&(t=Math.abs(this.value.re)<1e-14,r=Math.abs(this.value.im)<1e-14);for(var n in this.units)this.units[n].unit&&("VA"===this.units[n].unit.name&&t?this.units[n].unit=G.VAR:"VAR"!==this.units[n].unit.name||t||(this.units[n].unit=G.VA));
1!==this.units.length||this.fixPrefix||Math.abs(this.units[0].power-Math.round(this.units[0].power))<1e-14&&(this.units[0].prefix=this._bestPrefix());var i=this._denormalize(this.value),o=null!==this.value?S(i,e||{}):"",a=this.formatUnits();return this.value&&this.value.isComplex&&(o="("+o+")"),a.length>0&&o.length>0&&(o+=" "),o+=a},c.prototype._bestPrefix=function(){if(1!==this.units.length)throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");if(Math.abs(this.units[0].power-Math.round(this.units[0].power))>=1e-14)throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");var e=O(this.value),t=O(this.units[0].unit.value),r=this.units[0].prefix;if(0===e)return r;var n=this.units[0].power,i=Math.abs(Math.log(e/Math.pow(r.value*t,n))/Math.LN10-1.2),o=this.units[0].unit.prefixes;for(var a in o)if(o.hasOwnProperty(a)){var s=o[a];if(s.scientific){var u=Math.abs(Math.log(e/Math.pow(s.value*t,n))/Math.LN10-1.2);(i>u||u===i&&s.name.length<r.name.length)&&(r=s,i=u)}}return r},c.prototype.splitUnit=function(e){for(var t=this.clone(),r=[],n=0;n<e.length&&(t=t.to(e[n]),n!=e.length-1);n++){var i=_(t.toNumeric()),o=new c(i,e[n].toString());r.push(o),t=N(t,o)}return r.push(t),r};var q={NONE:{"":{name:"",value:1,scientific:!0}},SHORT:{"":{name:"",value:1,scientific:!0},da:{name:"da",value:10,scientific:!1},h:{name:"h",value:100,scientific:!1},k:{name:"k",value:1e3,scientific:!0},M:{name:"M",value:1e6,scientific:!0},G:{name:"G",value:1e9,scientific:!0},T:{name:"T",value:1e12,scientific:!0},P:{name:"P",value:1e15,scientific:!0},E:{name:"E",value:1e18,scientific:!0},Z:{name:"Z",value:1e21,scientific:!0},Y:{name:"Y",value:1e24,scientific:!0},d:{name:"d",value:.1,scientific:!1},c:{name:"c",value:.01,scientific:!1},m:{name:"m",value:.001,scientific:!0},u:{name:"u",value:1e-6,scientific:!0},n:{name:"n",value:1e-9,scientific:!0},p:{name:"p",value:1e-12,scientific:!0},f:{name:"f",value:1e-15,scientific:!0},a:{name:"a",value:1e-18,scientific:!0},z:{name:"z",value:1e-21,scientific:!0},y:{name:"y",value:1e-24,scientific:!0}},LONG:{"":{name:"",value:1,scientific:!0},deca:{name:"deca",value:10,scientific:!1},hecto:{name:"hecto",value:100,scientific:!1},kilo:{name:"kilo",value:1e3,scientific:!0},mega:{name:"mega",value:1e6,scientific:!0},giga:{name:"giga",value:1e9,scientific:!0},tera:{name:"tera",value:1e12,scientific:!0},peta:{name:"peta",value:1e15,scientific:!0},exa:{name:"exa",value:1e18,scientific:!0},zetta:{name:"zetta",value:1e21,scientific:!0},yotta:{name:"yotta",value:1e24,scientific:!0},deci:{name:"deci",value:.1,scientific:!1},centi:{name:"centi",value:.01,scientific:!1},milli:{name:"milli",value:.001,scientific:!0},micro:{name:"micro",value:1e-6,scientific:!0},nano:{name:"nano",value:1e-9,scientific:!0},pico:{name:"pico",value:1e-12,scientific:!0},femto:{name:"femto",value:1e-15,scientific:!0},atto:{name:"atto",value:1e-18,scientific:!0},zepto:{name:"zepto",value:1e-21,scientific:!0},yocto:{name:"yocto",value:1e-24,scientific:!0}},SQUARED:{"":{name:"",value:1,scientific:!0},da:{name:"da",value:100,scientific:!1},h:{name:"h",value:1e4,scientific:!1},k:{name:"k",value:1e6,scientific:!0},M:{name:"M",value:1e12,scientific:!0},G:{name:"G",value:1e18,scientific:!0},T:{name:"T",value:1e24,scientific:!0},P:{name:"P",value:1e30,scientific:!0},E:{name:"E",value:1e36,scientific:!0},Z:{name:"Z",value:1e42,scientific:!0},Y:{name:"Y",value:1e48,scientific:!0},d:{name:"d",value:.01,scientific:!1},c:{name:"c",value:1e-4,scientific:!1},m:{name:"m",value:1e-6,scientific:!0},u:{name:"u",value:1e-12,scientific:!0},n:{name:"n",value:1e-18,scientific:!0},p:{name:"p",value:1e-24,scientific:!0},f:{name:"f",value:1e-30,scientific:!0},a:{name:"a",value:1e-36,scientific:!0},z:{name:"z",value:1e-42,scientific:!0},y:{name:"y",value:1e-48,scientific:!0}},CUBIC:{"":{name:"",value:1,scientific:!0},da:{name:"da",value:1e3,scientific:!1},h:{name:"h",value:1e6,scientific:!1},k:{name:"k",value:1e9,scientific:!0},M:{name:"M",value:1e18,scientific:!0},G:{name:"G",value:1e27,scientific:!0},T:{name:"T",value:1e36,scientific:!0},P:{name:"P",value:1e45,scientific:!0},E:{name:"E",value:1e54,scientific:!0},Z:{name:"Z",value:1e63,scientific:!0},Y:{name:"Y",value:1e72,scientific:!0},d:{name:"d",value:.001,scientific:!1},c:{name:"c",value:1e-6,scientific:!1},m:{name:"m",value:1e-9,scientific:!0},u:{name:"u",value:1e-18,scientific:!0},n:{name:"n",value:1e-27,scientific:!0},p:{name:"p",value:1e-36,scientific:!0},f:{name:"f",value:1e-45,scientific:!0},a:{name:"a",value:1e-54,scientific:!0},z:{name:"z",value:1e-63,scientific:!0},y:{name:"y",value:1e-72,scientific:!0}},BINARY_SHORT:{"":{name:"",value:1,scientific:!0},k:{name:"k",value:1e3,scientific:!0},M:{name:"M",value:1e6,scientific:!0},G:{name:"G",value:1e9,scientific:!0},T:{name:"T",value:1e12,scientific:!0},P:{name:"P",value:1e15,scientific:!0},E:{name:"E",value:1e18,scientific:!0},Z:{name:"Z",value:1e21,scientific:!0},Y:{name:"Y",value:1e24,scientific:!0},Ki:{name:"Ki",value:1024,scientific:!0},Mi:{name:"Mi",value:Math.pow(1024,2),scientific:!0},Gi:{name:"Gi",value:Math.pow(1024,3),scientific:!0},Ti:{name:"Ti",value:Math.pow(1024,4),scientific:!0},Pi:{name:"Pi",value:Math.pow(1024,5),scientific:!0},Ei:{name:"Ei",value:Math.pow(1024,6),scientific:!0},Zi:{name:"Zi",value:Math.pow(1024,7),scientific:!0},Yi:{name:"Yi",value:Math.pow(1024,8),scientific:!0}},BINARY_LONG:{"":{name:"",value:1,scientific:!0},kilo:{name:"kilo",value:1e3,scientific:!0},mega:{name:"mega",value:1e6,scientific:!0},giga:{name:"giga",value:1e9,scientific:!0},tera:{name:"tera",value:1e12,scientific:!0},peta:{name:"peta",value:1e15,scientific:!0},exa:{name:"exa",value:1e18,scientific:!0},zetta:{name:"zetta",value:1e21,scientific:!0},yotta:{name:"yotta",value:1e24,scientific:!0},kibi:{name:"kibi",value:1024,scientific:!0},mebi:{name:"mebi",value:Math.pow(1024,2),scientific:!0},gibi:{name:"gibi",value:Math.pow(1024,3),scientific:!0},tebi:{name:"tebi",value:Math.pow(1024,4),scientific:!0},pebi:{name:"pebi",value:Math.pow(1024,5),scientific:!0},exi:{name:"exi",value:Math.pow(1024,6),scientific:!0},zebi:{name:"zebi",value:Math.pow(1024,7),scientific:!0},yobi:{name:"yobi",value:Math.pow(1024,8),scientific:!0}},BTU:{"":{name:"",value:1,scientific:!0},MM:{name:"MM",value:1e6,scientific:!0}}};q.SHORTLONG={};for(var L in q.SHORT)q.SHORT.hasOwnProperty(L)&&(q.SHORTLONG[L]=q.SHORT[L]);for(var L in q.LONG)q.LONG.hasOwnProperty(L)&&(q.SHORTLONG[L]=q.LONG[L]);var j=["MASS","LENGTH","TIME","CURRENT","TEMPERATURE","LUMINOUS_INTENSITY","AMOUNT_OF_SUBSTANCE","ANGLE","BIT"],F={NONE:{dimensions:[0,0,0,0,0,0,0,0,0]},MASS:{dimensions:[1,0,0,0,0,0,0,0,0]},LENGTH:{dimensions:[0,1,0,0,0,0,0,0,0]},TIME:{dimensions:[0,0,1,0,0,0,0,0,0]},CURRENT:{dimensions:[0,0,0,1,0,0,0,0,0]},TEMPERATURE:{dimensions:[0,0,0,0,1,0,0,0,0]},LUMINOUS_INTENSITY:{dimensions:[0,0,0,0,0,1,0,0,0]},AMOUNT_OF_SUBSTANCE:{dimensions:[0,0,0,0,0,0,1,0,0]},FORCE:{dimensions:[1,1,-2,0,0,0,0,0,0]},SURFACE:{dimensions:[0,2,0,0,0,0,0,0,0]},VOLUME:{dimensions:[0,3,0,0,0,0,0,0,0]},ENERGY:{dimensions:[1,2,-2,0,0,0,0,0,0]},POWER:{dimensions:[1,2,-3,0,0,0,0,0,0]},PRESSURE:{dimensions:[1,-1,-2,0,0,0,0,0,0]},ELECTRIC_CHARGE:{dimensions:[0,0,1,1,0,0,0,0,0]},ELECTRIC_CAPACITANCE:{dimensions:[-1,-2,4,2,0,0,0,0,0]},ELECTRIC_POTENTIAL:{dimensions:[1,2,-3,-1,0,0,0,0,0]},ELECTRIC_RESISTANCE:{dimensions:[1,2,-3,-2,0,0,0,0,0]},ELECTRIC_INDUCTANCE:{dimensions:[1,2,-2,-2,0,0,0,0,0]},ELECTRIC_CONDUCTANCE:{dimensions:[-1,-2,3,2,0,0,0,0,0]},MAGNETIC_FLUX:{dimensions:[1,2,-2,-1,0,0,0,0,0]},MAGNETIC_FLUX_DENSITY:{dimensions:[1,0,-2,-1,0,0,0,0,0]},FREQUENCY:{dimensions:[0,0,-1,0,0,0,0,0,0]},ANGLE:{dimensions:[0,0,0,0,0,0,0,1,0]},BIT:{dimensions:[0,0,0,0,0,0,0,0,1]}};for(var L in F)F[L].key=L;var D={},$={name:"",base:D,value:1,offset:0,dimensions:[0,0,0,0,0,0,0,0,0]},G={meter:{name:"meter",base:F.LENGTH,prefixes:q.LONG,value:1,offset:0},inch:{name:"inch",base:F.LENGTH,prefixes:q.NONE,value:.0254,offset:0},foot:{name:"foot",base:F.LENGTH,prefixes:q.NONE,value:.3048,offset:0},yard:{name:"yard",base:F.LENGTH,prefixes:q.NONE,value:.9144,offset:0},mile:{name:"mile",base:F.LENGTH,prefixes:q.NONE,value:1609.344,offset:0},link:{name:"link",base:F.LENGTH,prefixes:q.NONE,value:.201168,offset:0},rod:{name:"rod",base:F.LENGTH,prefixes:q.NONE,value:5.02921,offset:0},chain:{name:"chain",base:F.LENGTH,prefixes:q.NONE,value:20.1168,offset:0},angstrom:{name:"angstrom",base:F.LENGTH,prefixes:q.NONE,value:1e-10,offset:0},m:{name:"m",base:F.LENGTH,prefixes:q.SHORT,value:1,offset:0},"in":{name:"in",base:F.LENGTH,prefixes:q.NONE,value:.0254,offset:0},ft:{name:"ft",base:F.LENGTH,prefixes:q.NONE,value:.3048,offset:0},yd:{name:"yd",base:F.LENGTH,prefixes:q.NONE,value:.9144,offset:0},mi:{name:"mi",base:F.LENGTH,prefixes:q.NONE,value:1609.344,offset:0},li:{name:"li",base:F.LENGTH,prefixes:q.NONE,value:.201168,offset:0},rd:{name:"rd",base:F.LENGTH,prefixes:q.NONE,value:5.02921,offset:0},ch:{name:"ch",base:F.LENGTH,prefixes:q.NONE,value:20.1168,offset:0},mil:{name:"mil",base:F.LENGTH,prefixes:q.NONE,value:254e-7,offset:0},m2:{name:"m2",base:F.SURFACE,prefixes:q.SQUARED,value:1,offset:0},sqin:{name:"sqin",base:F.SURFACE,prefixes:q.NONE,value:64516e-8,offset:0},sqft:{name:"sqft",base:F.SURFACE,prefixes:q.NONE,value:.09290304,offset:0},sqyd:{name:"sqyd",base:F.SURFACE,prefixes:q.NONE,value:.83612736,offset:0},sqmi:{name:"sqmi",base:F.SURFACE,prefixes:q.NONE,value:2589988.110336,offset:0},sqrd:{name:"sqrd",base:F.SURFACE,prefixes:q.NONE,value:25.29295,offset:0},sqch:{name:"sqch",base:F.SURFACE,prefixes:q.NONE,value:404.6873,offset:0},sqmil:{name:"sqmil",base:F.SURFACE,prefixes:q.NONE,value:6.4516e-10,offset:0},acre:{name:"acre",base:F.SURFACE,prefixes:q.NONE,value:4046.86,offset:0},hectare:{name:"hectare",base:F.SURFACE,prefixes:q.NONE,value:1e4,offset:0},m3:{name:"m3",base:F.VOLUME,prefixes:q.CUBIC,value:1,offset:0},L:{name:"L",base:F.VOLUME,prefixes:q.SHORT,value:.001,offset:0},l:{name:"l",base:F.VOLUME,prefixes:q.SHORT,value:.001,offset:0},litre:{name:"litre",base:F.VOLUME,prefixes:q.LONG,value:.001,offset:0},cuin:{name:"cuin",base:F.VOLUME,prefixes:q.NONE,value:16387064e-12,offset:0},cuft:{name:"cuft",base:F.VOLUME,prefixes:q.NONE,value:.028316846592,offset:0},cuyd:{name:"cuyd",base:F.VOLUME,prefixes:q.NONE,value:.764554857984,offset:0},teaspoon:{name:"teaspoon",base:F.VOLUME,prefixes:q.NONE,value:5e-6,offset:0},tablespoon:{name:"tablespoon",base:F.VOLUME,prefixes:q.NONE,value:15e-6,offset:0},drop:{name:"drop",base:F.VOLUME,prefixes:q.NONE,value:5e-8,offset:0},gtt:{name:"gtt",base:F.VOLUME,prefixes:q.NONE,value:5e-8,offset:0},minim:{name:"minim",base:F.VOLUME,prefixes:q.NONE,value:6.161152e-8,offset:0},fluiddram:{name:"fluiddram",base:F.VOLUME,prefixes:q.NONE,value:36966911e-13,offset:0},fluidounce:{name:"fluidounce",base:F.VOLUME,prefixes:q.NONE,value:2957353e-11,offset:0},gill:{name:"gill",base:F.VOLUME,prefixes:q.NONE,value:.0001182941,offset:0},cc:{name:"cc",base:F.VOLUME,prefixes:q.NONE,value:1e-6,offset:0},cup:{name:"cup",base:F.VOLUME,prefixes:q.NONE,value:.0002365882,offset:0},pint:{name:"pint",base:F.VOLUME,prefixes:q.NONE,value:.0004731765,offset:0},quart:{name:"quart",base:F.VOLUME,prefixes:q.NONE,value:.0009463529,offset:0},gallon:{name:"gallon",base:F.VOLUME,prefixes:q.NONE,value:.003785412,offset:0},beerbarrel:{name:"beerbarrel",base:F.VOLUME,prefixes:q.NONE,value:.1173478,offset:0},oilbarrel:{name:"oilbarrel",base:F.VOLUME,prefixes:q.NONE,value:.1589873,offset:0},hogshead:{name:"hogshead",base:F.VOLUME,prefixes:q.NONE,value:.238481,offset:0},fldr:{name:"fldr",base:F.VOLUME,prefixes:q.NONE,value:36966911e-13,offset:0},floz:{name:"floz",base:F.VOLUME,prefixes:q.NONE,value:2957353e-11,offset:0},gi:{name:"gi",base:F.VOLUME,prefixes:q.NONE,value:.0001182941,offset:0},cp:{name:"cp",base:F.VOLUME,prefixes:q.NONE,value:.0002365882,offset:0},pt:{name:"pt",base:F.VOLUME,prefixes:q.NONE,value:.0004731765,offset:0},qt:{name:"qt",base:F.VOLUME,prefixes:q.NONE,value:.0009463529,offset:0},gal:{name:"gal",base:F.VOLUME,prefixes:q.NONE,value:.003785412,offset:0},bbl:{name:"bbl",base:F.VOLUME,prefixes:q.NONE,value:.1173478,offset:0},obl:{name:"obl",base:F.VOLUME,prefixes:q.NONE,value:.1589873,offset:0},g:{name:"g",base:F.MASS,prefixes:q.SHORT,value:.001,offset:0},gram:{name:"gram",base:F.MASS,prefixes:q.LONG,value:.001,offset:0},ton:{name:"ton",base:F.MASS,prefixes:q.SHORT,value:907.18474,offset:0},tonne:{name:"tonne",base:F.MASS,prefixes:q.SHORT,value:1e3,offset:0},grain:{name:"grain",base:F.MASS,prefixes:q.NONE,value:6479891e-11,offset:0},dram:{name:"dram",base:F.MASS,prefixes:q.NONE,value:.0017718451953125,offset:0},ounce:{name:"ounce",base:F.MASS,prefixes:q.NONE,value:.028349523125,offset:0},poundmass:{name:"poundmass",base:F.MASS,prefixes:q.NONE,value:.45359237,offset:0},hundredweight:{name:"hundredweight",base:F.MASS,prefixes:q.NONE,value:45.359237,offset:0},stick:{name:"stick",base:F.MASS,prefixes:q.NONE,value:.115,offset:0},stone:{name:"stone",base:F.MASS,prefixes:q.NONE,value:6.35029318,offset:0},gr:{name:"gr",base:F.MASS,prefixes:q.NONE,value:6479891e-11,offset:0},dr:{name:"dr",base:F.MASS,prefixes:q.NONE,value:.0017718451953125,offset:0},oz:{name:"oz",base:F.MASS,prefixes:q.NONE,value:.028349523125,offset:0},lbm:{name:"lbm",base:F.MASS,prefixes:q.NONE,value:.45359237,offset:0},cwt:{name:"cwt",base:F.MASS,prefixes:q.NONE,value:45.359237,offset:0},s:{name:"s",base:F.TIME,prefixes:q.SHORT,value:1,offset:0},min:{name:"min",base:F.TIME,prefixes:q.NONE,value:60,offset:0},h:{name:"h",base:F.TIME,prefixes:q.NONE,value:3600,offset:0},second:{name:"second",base:F.TIME,prefixes:q.LONG,value:1,offset:0},sec:{name:"sec",base:F.TIME,prefixes:q.LONG,value:1,offset:0},minute:{name:"minute",base:F.TIME,prefixes:q.NONE,value:60,offset:0},hour:{name:"hour",base:F.TIME,prefixes:q.NONE,value:3600,offset:0},day:{name:"day",base:F.TIME,prefixes:q.NONE,value:86400,offset:0},week:{name:"week",base:F.TIME,prefixes:q.NONE,value:604800,offset:0},month:{name:"month",base:F.TIME,prefixes:q.NONE,value:2629800,offset:0},year:{name:"year",base:F.TIME,prefixes:q.NONE,value:31557600,offset:0},decade:{name:"year",base:F.TIME,prefixes:q.NONE,value:315576e3,offset:0},century:{name:"century",base:F.TIME,prefixes:q.NONE,value:315576e4,offset:0},millennium:{name:"millennium",base:F.TIME,prefixes:q.NONE,value:315576e5,offset:0},hertz:{name:"Hertz",base:F.FREQUENCY,prefixes:q.LONG,value:1,offset:0,reciprocal:!0},Hz:{name:"Hz",base:F.FREQUENCY,prefixes:q.SHORT,value:1,offset:0,reciprocal:!0},rad:{name:"rad",base:F.ANGLE,prefixes:q.NONE,value:1,offset:0},deg:{name:"deg",base:F.ANGLE,prefixes:q.NONE,value:null,offset:0},grad:{name:"grad",base:F.ANGLE,prefixes:q.NONE,value:null,offset:0},cycle:{name:"cycle",base:F.ANGLE,prefixes:q.NONE,value:null,offset:0},arcsec:{name:"arcsec",base:F.ANGLE,prefixes:q.NONE,value:null,offset:0},arcmin:{name:"arcmin",base:F.ANGLE,prefixes:q.NONE,value:null,offset:0},A:{name:"A",base:F.CURRENT,prefixes:q.SHORT,value:1,offset:0},ampere:{name:"ampere",base:F.CURRENT,prefixes:q.LONG,value:1,offset:0},K:{name:"K",base:F.TEMPERATURE,prefixes:q.NONE,value:1,offset:0},degC:{name:"degC",base:F.TEMPERATURE,prefixes:q.NONE,value:1,offset:273.15},degF:{name:"degF",base:F.TEMPERATURE,prefixes:q.NONE,value:1/1.8,offset:459.67},degR:{name:"degR",base:F.TEMPERATURE,prefixes:q.NONE,value:1/1.8,offset:0},kelvin:{name:"kelvin",base:F.TEMPERATURE,prefixes:q.NONE,value:1,offset:0},celsius:{name:"celsius",base:F.TEMPERATURE,prefixes:q.NONE,value:1,offset:273.15},fahrenheit:{name:"fahrenheit",base:F.TEMPERATURE,prefixes:q.NONE,value:1/1.8,offset:459.67},rankine:{name:"rankine",base:F.TEMPERATURE,prefixes:q.NONE,value:1/1.8,offset:0},mol:{name:"mol",base:F.AMOUNT_OF_SUBSTANCE,prefixes:q.SHORT,value:1,offset:0},mole:{name:"mole",base:F.AMOUNT_OF_SUBSTANCE,prefixes:q.LONG,value:1,offset:0},cd:{name:"cd",base:F.LUMINOUS_INTENSITY,prefixes:q.NONE,value:1,offset:0},candela:{name:"candela",base:F.LUMINOUS_INTENSITY,prefixes:q.NONE,value:1,offset:0},N:{name:"N",base:F.FORCE,prefixes:q.SHORT,value:1,offset:0},newton:{name:"newton",base:F.FORCE,prefixes:q.LONG,value:1,offset:0},dyn:{name:"dyn",base:F.FORCE,prefixes:q.SHORT,value:1e-5,offset:0},dyne:{name:"dyne",base:F.FORCE,prefixes:q.LONG,value:1e-5,offset:0},lbf:{name:"lbf",base:F.FORCE,prefixes:q.NONE,value:4.4482216152605,offset:0},poundforce:{name:"poundforce",base:F.FORCE,prefixes:q.NONE,value:4.4482216152605,offset:0},kip:{name:"kip",base:F.FORCE,prefixes:q.LONG,value:4448.2216,offset:0},J:{name:"J",base:F.ENERGY,prefixes:q.SHORT,value:1,offset:0},joule:{name:"joule",base:F.ENERGY,prefixes:q.SHORT,value:1,offset:0},erg:{name:"erg",base:F.ENERGY,prefixes:q.NONE,value:1e-5,offset:0},Wh:{name:"Wh",base:F.ENERGY,prefixes:q.SHORT,value:3600,offset:0},BTU:{name:"BTU",base:F.ENERGY,prefixes:q.BTU,value:1055.05585262,offset:0},eV:{name:"eV",base:F.ENERGY,prefixes:q.SHORT,value:1.602176565e-19,offset:0},electronvolt:{name:"electronvolt",base:F.ENERGY,prefixes:q.LONG,value:1.602176565e-19,offset:0},W:{name:"W",base:F.POWER,prefixes:q.SHORT,value:1,offset:0},watt:{name:"W",base:F.POWER,prefixes:q.LONG,value:1,offset:0},hp:{name:"hp",base:F.POWER,prefixes:q.NONE,value:745.6998715386,offset:0},VAR:{name:"VAR",base:F.POWER,prefixes:q.SHORT,value:k.I,offset:0},VA:{name:"VA",base:F.POWER,prefixes:q.SHORT,value:1,offset:0},Pa:{name:"Pa",base:F.PRESSURE,prefixes:q.SHORT,value:1,offset:0},psi:{name:"psi",base:F.PRESSURE,prefixes:q.NONE,value:6894.75729276459,offset:0},atm:{name:"atm",base:F.PRESSURE,prefixes:q.NONE,value:101325,offset:0},bar:{name:"bar",base:F.PRESSURE,prefixes:q.NONE,value:1e5,offset:0},torr:{name:"torr",base:F.PRESSURE,prefixes:q.NONE,value:133.322,offset:0},mmHg:{name:"mmHg",base:F.PRESSURE,prefixes:q.NONE,value:133.322,offset:0},mmH2O:{name:"mmH2O",base:F.PRESSURE,prefixes:q.NONE,value:9.80665,offset:0},cmH2O:{name:"cmH2O",base:F.PRESSURE,prefixes:q.NONE,value:98.0665,offset:0},coulomb:{name:"coulomb",base:F.ELECTRIC_CHARGE,prefixes:q.LONG,value:1,offset:0},C:{name:"C",base:F.ELECTRIC_CHARGE,prefixes:q.SHORT,value:1,offset:0},farad:{name:"farad",base:F.ELECTRIC_CAPACITANCE,prefixes:q.LONG,value:1,offset:0},F:{name:"F",base:F.ELECTRIC_CAPACITANCE,prefixes:q.SHORT,value:1,offset:0},volt:{name:"volt",base:F.ELECTRIC_POTENTIAL,prefixes:q.LONG,value:1,offset:0},V:{name:"V",base:F.ELECTRIC_POTENTIAL,prefixes:q.SHORT,value:1,offset:0},ohm:{name:"ohm",base:F.ELECTRIC_RESISTANCE,prefixes:q.SHORTLONG,value:1,offset:0},henry:{name:"henry",base:F.ELECTRIC_INDUCTANCE,prefixes:q.LONG,value:1,offset:0},H:{name:"H",base:F.ELECTRIC_INDUCTANCE,prefixes:q.SHORT,value:1,offset:0},siemens:{name:"siemens",base:F.ELECTRIC_CONDUCTANCE,prefixes:q.LONG,value:1,offset:0},S:{name:"S",base:F.ELECTRIC_CONDUCTANCE,prefixes:q.SHORT,value:1,offset:0},weber:{name:"weber",base:F.MAGNETIC_FLUX,prefixes:q.LONG,value:1,offset:0},Wb:{name:"Wb",base:F.MAGNETIC_FLUX,prefixes:q.SHORT,value:1,offset:0},tesla:{name:"tesla",base:F.MAGNETIC_FLUX_DENSITY,prefixes:q.LONG,value:1,offset:0},T:{name:"T",base:F.MAGNETIC_FLUX_DENSITY,prefixes:q.SHORT,value:1,offset:0},b:{name:"b",base:F.BIT,prefixes:q.BINARY_SHORT,value:1,offset:0},bits:{name:"bits",base:F.BIT,prefixes:q.BINARY_LONG,value:1,offset:0},B:{name:"B",base:F.BIT,prefixes:q.BINARY_SHORT,value:8,offset:0},bytes:{name:"bytes",base:F.BIT,prefixes:q.BINARY_LONG,value:8,offset:0}},H={meters:"meter",inches:"inch",feet:"foot",yards:"yard",miles:"mile",links:"link",rods:"rod",chains:"chain",angstroms:"angstrom",lt:"l",litres:"litre",liter:"litre",liters:"litre",teaspoons:"teaspoon",tablespoons:"tablespoon",minims:"minim",fluiddrams:"fluiddram",fluidounces:"fluidounce",gills:"gill",cups:"cup",pints:"pint",quarts:"quart",gallons:"gallon",beerbarrels:"beerbarrel",oilbarrels:"oilbarrel",hogsheads:"hogshead",gtts:"gtt",grams:"gram",tons:"ton",tonnes:"tonne",grains:"grain",drams:"dram",ounces:"ounce",poundmasses:"poundmass",hundredweights:"hundredweight",sticks:"stick",lb:"lbm",lbs:"lbm",kips:"kip",acres:"acre",hectares:"hectare",sqfeet:"sqft",sqyard:"sqyd",sqmile:"sqmi",sqmiles:"sqmi",mmhg:"mmHg",mmh2o:"mmH2O",cmh2o:"cmH2O",seconds:"second",secs:"second",minutes:"minute",mins:"minute",hours:"hour",hr:"hour",hrs:"hour",days:"day",weeks:"week",months:"month",years:"year",hertz:"hertz",radians:"rad",degree:"deg",degrees:"deg",gradian:"grad",gradians:"grad",cycles:"cycle",arcsecond:"arcsec",arcseconds:"arcsec",arcminute:"arcmin",arcminutes:"arcmin",BTUs:"BTU",watts:"watt",joules:"joule",amperes:"ampere",coulombs:"coulomb",volts:"volt",ohms:"ohm",farads:"farad",webers:"weber",teslas:"tesla",electronvolts:"electronvolt",moles:"mole"};x(t),u.on("config",function(e,t){e.number!==t.number&&x(e)});var Z={si:{NONE:{unit:$,prefix:q.NONE[""]},LENGTH:{unit:G.m,prefix:q.SHORT[""]},MASS:{unit:G.g,prefix:q.SHORT.k},TIME:{unit:G.s,prefix:q.SHORT[""]},CURRENT:{unit:G.A,prefix:q.SHORT[""]},TEMPERATURE:{unit:G.K,prefix:q.SHORT[""]},LUMINOUS_INTENSITY:{unit:G.cd,prefix:q.SHORT[""]},AMOUNT_OF_SUBSTANCE:{unit:G.mol,prefix:q.SHORT[""]},ANGLE:{unit:G.rad,prefix:q.SHORT[""]},BIT:{unit:G.bit,prefix:q.SHORT[""]},FORCE:{unit:G.N,prefix:q.SHORT[""]},ENERGY:{unit:G.J,prefix:q.SHORT[""]},POWER:{unit:G.W,prefix:q.SHORT[""]},PRESSURE:{unit:G.Pa,prefix:q.SHORT[""]},ELECTRIC_CHARGE:{unit:G.C,prefix:q.SHORT[""]},ELECTRIC_CAPACITANCE:{unit:G.F,prefix:q.SHORT[""]},ELECTRIC_POTENTIAL:{unit:G.V,prefix:q.SHORT[""]},ELECTRIC_RESISTANCE:{unit:G.ohm,prefix:q.SHORT[""]},ELECTRIC_INDUCTANCE:{unit:G.H,prefix:q.SHORT[""]},ELECTRIC_CONDUCTANCE:{unit:G.S,prefix:q.SHORT[""]},MAGNETIC_FLUX:{unit:G.Wb,prefix:q.SHORT[""]},MAGNETIC_FLUX_DENSITY:{unit:G.T,prefix:q.SHORT[""]},FREQUENCY:{unit:G.Hz,prefix:q.SHORT[""]}}};Z.cgs=JSON.parse(JSON.stringify(Z.si)),Z.cgs.LENGTH={unit:G.m,prefix:q.SHORT.c},Z.cgs.MASS={unit:G.g,prefix:q.SHORT[""]},Z.cgs.FORCE={unit:G.dyn,prefix:q.SHORT[""]},Z.cgs.ENERGY={unit:G.erg,prefix:q.NONE[""]},Z.us=JSON.parse(JSON.stringify(Z.si)),Z.us.LENGTH={unit:G.ft,prefix:q.NONE[""]},Z.us.MASS={unit:G.lbm,prefix:q.NONE[""]},Z.us.TEMPERATURE={unit:G.degF,prefix:q.NONE[""]},Z.us.FORCE={unit:G.lbf,prefix:q.NONE[""]},Z.us.ENERGY={unit:G.BTU,prefix:q.BTU[""]},Z.us.POWER={unit:G.hp,prefix:q.NONE[""]},Z.us.PRESSURE={unit:G.psi,prefix:q.NONE[""]},Z.auto=JSON.parse(JSON.stringify(Z.si));var V=Z.auto;c.setUnitSystem=function(e){if(!Z.hasOwnProperty(e))throw new Error("Unit system "+e+" does not exist. Choices are: "+Object.keys(Z).join(", "));V=Z[e]},c.getUnitSystem=function(){for(var e in Z)if(Z[e]===V)return e},c.typeConverters={BigNumber:function(t){return new e.BigNumber(t+"")},Fraction:function(t){return new e.Fraction(t)},Complex:function(e){return e},number:function(e){return e}},c._getNumberConverter=function(e){if(!c.typeConverters[e])throw new TypeError('Unsupported type "'+e+'"');return c.typeConverters[e]};for(var L in G){var Y=G[L];Y.dimensions=Y.base.dimensions}for(var W in H)if(H.hasOwnProperty(W)){var Y=G[H[W]],X={};for(var L in Y)Y.hasOwnProperty(L)&&(X[L]=Y[L]);X.name=W,G[W]=X}return c.createUnit=function(e,t){if("object"!=typeof e)throw new TypeError("createUnit expects first parameter to be of type 'Object'");if(t&&t.override)for(var r in e)if(e.hasOwnProperty(r)&&c.deleteUnit(r),e[r].aliases){console.log(e[r].aliases);for(var n=0;n<e[r].aliases.length;n++)c.deleteUnit(e[r].aliases[n])}var i;for(var r in e)e.hasOwnProperty(r)&&(i=c.createUnitSingle(r,e[r]));return i},c.createUnitSingle=function(e,t,r){if("undefined"!=typeof t&&null!==t||(t={}),"string"!=typeof e)throw new TypeError("createUnitSingle expects first parameter to be of type 'string'");if(G.hasOwnProperty(e))throw new Error('Cannot create unit "'+e+'": a unit with that name already exists');b(e);var n,i,o=null,a=[],s=0;if(t&&"Unit"===t.type)o=t.clone();else if("string"==typeof t)""!==t&&(n=t);else{if("object"!=typeof t)throw new TypeError('Cannot create unit "'+e+'" from "'+t.toString()+'": expecting "string" or "Unit" or "Object"');n=t.definition,i=t.prefixes,s=t.offset,a=t.aliases}if(a)for(var u=0;u<a.length;u++)if(G.hasOwnProperty(a[u]))throw new Error('Cannot create alias "'+a[u]+'": a unit with that name already exists');if(n&&"string"==typeof n&&!o)try{o=c.parse(n,{allowNoUnits:!0})}catch(f){throw f.message='Could not create unit "'+e+'" from "'+n+'": '+f.message,f}else n&&"Unit"===n.type&&(o=n.clone());a=a||[],s=s||0,i=i&&i.toUpperCase?q[i.toUpperCase()]||q.NONE:q.NONE;var l={};if(o){l={name:e,value:o.value,dimensions:o.dimensions.slice(0),prefixes:i,offset:s};var p=!1;for(var u in F)if(F.hasOwnProperty(u)){for(var h=!0,m=0;m<j.length;m++)if(Math.abs((l.dimensions[m]||0)-(F[u].dimensions[m]||0))>1e-12){h=!1;break}if(h){p=!0;break}}if(!p){var d=e+"_STUFF",g={dimensions:o.dimensions.slice(0)};g.key=d,F[d]=g,V[d]={unit:l,prefix:q.NONE[""]},l.base=d}}else{var d=e+"_STUFF";if(j.indexOf(d)>=0)throw new Error('Cannot create new base unit "'+e+'": a base unit with that name already exists (and cannot be overridden)');j.push(d);for(var v in F)F.hasOwnProperty(v)&&(F[v].dimensions[j.length-1]=0);for(var g={dimensions:[]},u=0;u<j.length;u++)g.dimensions[u]=0;g.dimensions[j.length-1]=1,g.key=d,F[d]=g,l={name:e,value:1,dimensions:F[d].dimensions.slice(0),prefixes:i,offset:s,base:d},V[d]={unit:l,prefix:q.NONE[""]}}c.UNITS[e]=l;for(var u=0;u<a.length;u++){var y=a[u],x={};for(var w in l)l.hasOwnProperty(w)&&(x[w]=l[w]);x.name=y,c.UNITS[y]=x}return new c(null,e)},c.deleteUnit=function(e){delete c.UNITS[e]},c.PREFIXES=q,c.BASE_UNITS=F,c.UNITS=G,c.UNIT_SYSTEMS=Z,c}var i=r(23).endsWith,o=r(3).clone,a=r(76);t.name="Unit",t.path="type",t.factory=n,t.math=!0},function(e,t,r){function n(e){return e[0].precision}var i=r(45).memoize;t.e=i(function(e){return new e(1).exp()},n),t.phi=i(function(e){return new e(1).plus(new e(5).sqrt()).div(2)},n),t.pi=i(function(e){return pi=e.acos(-1)},n),t.tau=i(function(e){return t.pi(e).times(2)},n)},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=n(r(52)),u=n(r(53)),c=n(r(78)),f=n(r(54)),l=n(r(61)),p=n(r(79)),h=n(r(56)),m=n(r(57)),d=n(r(58)),g=o("subtract",{"number, number":function(e,t){return e-t},"Complex, Complex":function(e,t){return e.sub(t)},"BigNumber, BigNumber":function(e,t){return e.minus(t)},"Fraction, Fraction":function(e,t){return e.sub(t)},"Unit, Unit":function(e,t){if(null==e.value)throw new Error("Parameter x contains a unit with undefined value");if(null==t.value)throw new Error("Parameter y contains a unit with undefined value");if(!e.equalBase(t))throw new Error("Units do not match");var r=e.clone();return r.value=g(r.value,t.value),r.fixPrefix=!1,r},"Matrix, Matrix":function(e,t){var r=e.size(),n=t.size();if(r.length!==n.length)throw new i(r.length,n.length);var o;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":o=p(e,t,g);break;default:o=l(t,e,g,!0)}break;default:switch(t.storage()){case"sparse":o=f(e,t,g,!1);break;default:o=m(e,t,g)}}return o},"Array, Array":function(e,t){return g(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return g(s(e),t)},"Matrix, Array":function(e,t){return g(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=h(e,c(t),u);break;default:r=d(e,t,g)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=h(t,e,g,!0);break;default:r=d(t,e,g,!0)}return r},"Array, any":function(e,t){return d(s(e),t,g,!1).valueOf()},"any, Array":function(e,t){return d(s(t),e,g,!0).valueOf()}});return g.toTex={2:"\\left(${args[0]}"+a.operators.subtract+"${args[1]}\\right)"},g}var i=r(42);t.name="subtract",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=o("unaryMinus",{number:function(e){return-e},Complex:function(e){return e.neg()},BigNumber:function(e){return e.neg()},Fraction:function(e){return e.neg()},Unit:function(e){var t=e.clone();return t.value=s(e.value),t},"Array | Matrix":function(e){return i(e,s,!0)}});return s.toTex={1:a.operators.unaryMinus+"\\left(${args[0]}\\right)"},s}var i=r(19);t.name="unaryMinus",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(48)),s=e.SparseMatrix,u=function(e,t,r){var n=e._values,u=e._index,c=e._ptr,f=e._size,l=e._datatype,p=t._values,h=t._index,m=t._ptr,d=t._size,g=t._datatype;if(f.length!==d.length)throw new i(f.length,d.length);if(f[0]!==d[0]||f[1]!==d[1])throw new RangeError("Dimension mismatch. Matrix A ("+f+") must match Matrix B ("+d+")");var v,y=f[0],x=f[1],b=a,w=0,N=r;"string"==typeof l&&l===g&&(v=l,b=o.find(a,[v,v]),w=o.convert(0,v),N=o.find(r,[v,v]));var E,M,A,O,_=n&&p?[]:void 0,T=[],C=[],S=new s({values:_,index:T,ptr:C,size:[y,x],datatype:v}),z=_?[]:void 0,B=_?[]:void 0,k=[],I=[];for(M=0;x>M;M++){C[M]=T.length;var P=M+1;for(A=c[M],O=c[M+1];O>A;A++)E=u[A],T.push(E),k[E]=P,z&&(z[E]=n[A]);for(A=m[M],O=m[M+1];O>A;A++)E=h[A],k[E]!==P&&T.push(E),I[E]=P,B&&(B[E]=p[A]);if(_)for(A=C[M];A<T.length;){E=T[A];var R=k[E],U=I[E];if(R===P||U===P){var q=R===P?z[E]:w,L=U===P?B[E]:w,j=N(q,L);b(j,w)?T.splice(A,1):(_.push(j),A++)}}}return C[x]=T.length,S};return u}var i=r(42);t.name="algorithm05",t.factory=n},function(e,t){"use strict";function r(e,t,r,n){var i=n("multiplyScalar",{"number, number":function(e,t){return e*t},"Complex, Complex":function(e,t){return e.mul(t)},"BigNumber, BigNumber":function(e,t){return e.times(t)},"Fraction, Fraction":function(e,t){return e.mul(t)},"number | Fraction | BigNumber | Complex, Unit":function(e,t){var r=t.clone();return r.value=null===r.value?r._normalize(e):i(r.value,e),r},"Unit, number | Fraction | BigNumber | Complex":function(e,t){var r=e.clone();return r.value=null===r.value?r._normalize(t):i(r.value,t),r},"Unit, Unit":function(e,t){return e.multiply(t)}});return i}t.factory=r},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(80)),a=i("divide",{"number, number":function(e,t){return e/t},"Complex, Complex":function(e,t){return e.div(t)},"BigNumber, BigNumber":function(e,t){return e.div(t)},"Fraction, Fraction":function(e,t){return e.div(t)},"Unit, number | Fraction | BigNumber":function(e,t){var r=e.clone();return r.value=a(null===r.value?r._normalize(1):r.value,t),r},"number | Fraction | BigNumber, Unit":function(e,t){var r=t.pow(-1);return r.value=o(null===r.value?r._normalize(1):r.value,e),r},"Unit, Unit":function(e,t){return e.divide(t)}});return a}t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(r,n){if(t.predictable&&!i(n)&&0>r)try{var o=m(n),a=d(o);if((n===a||Math.abs((n-a)/n)<1e-14)&&o.d%2===1)return(o.n%2===0?1:-1)*Math.pow(-r,n)}catch(s){}return i(n)||r>=0||t.predictable?Math.pow(r,n):new e.Complex(r,0).pow(n,0)}function u(e,t){if(!i(t)||0>t)throw new TypeError("For A^b, b must be a positive integer (value is "+t+")");var r=o(e);if(2!=r.length)throw new Error("For A^b, A must be 2 dimensional (A has "+r.length+" dimensions)");if(r[0]!=r[1])throw new Error("For A^b, A must be square (size is "+r[0]+"x"+r[1]+")");for(var n=l(r[0]).valueOf(),a=e;t>=1;)1==(1&t)&&(n=p(a,n)),t>>=1,a=p(a,a);return n}function c(e,t){return h(u(e.valueOf(),t))}var f=r(32),l=n(r(83)),p=n(r(84)),h=n(r(52)),m=n(r(36)),d=n(r(70)),g=a("pow",{"number, number":s,"Complex, Complex":function(e,t){return e.pow(t)},"BigNumber, BigNumber":function(r,n){return n.isInteger()||r>=0||t.predictable?r.pow(n):new e.Complex(r.toNumber(),0).pow(n.toNumber(),0)},"Fraction, Fraction":function(e,r){if(1!==r.d){if(t.predictable)throw new Error("Function pow does not support non-integer exponents for fractions.");return s(e.valueOf(),r.valueOf())}return e.pow(r)},"Array, number":u,"Array, BigNumber":function(e,t){return u(e,t.toNumber())},"Matrix, number":c,"Matrix, BigNumber":function(e,t){return c(e,t.toNumber())},"Unit, number":function(e,t){return e.pow(t)}});return g.toTex={2:"\\left(${args[0]}\\right)"+f.operators.pow+"{${args[1]}}"},g}var i=r(6).isInteger,o=r(40).size;t.name="pow",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(e,t){switch(e.length){case 0:return t?c(t):[];case 1:return u(e[0],e[0],t);
case 2:return u(e[0],e[1],t);default:throw new Error("Vector containing two values expected")}}function u(t,r,n){var a=t&&t.isBigNumber===!0?e.BigNumber:r&&r.isBigNumber===!0?e.BigNumber:null;if(t&&t.isBigNumber===!0&&(t=t.toNumber()),r&&r.isBigNumber===!0&&(r=r.toNumber()),!o(t)||1>t)throw new Error("Parameters in function eye must be positive integers");if(!o(r)||1>r)throw new Error("Parameters in function eye must be positive integers");var s=a?new e.BigNumber(1):1,u=a?new a(0):0,c=[t,r];if(n){var f=e.Matrix.storage(n);return f.diagonal(c,s,0,u)}for(var l=i.resize([],c,u),p=r>t?t:r,h=0;p>h;h++)l[h][h]=s;return l}var c=n(r(52)),f=a("eye",{"":function(){return"Matrix"===t.matrix?c([]):[]},string:function(e){return c(e)},"number | BigNumber":function(e){return u(e,e,"Matrix"===t.matrix?"default":void 0)},"number | BigNumber, string":function(e,t){return u(e,e,t)},"number | BigNumber, number | BigNumber":function(e,r){return u(e,r,"Matrix"===t.matrix?"default":void 0)},"number | BigNumber, number | BigNumber, string":function(e,t,r){return u(e,t,r)},Array:function(e){return s(e)},"Array, string":function(e,t){return s(e,t)},Matrix:function(e){return s(e.valueOf(),e.storage())},"Matrix, string":function(e,t){return s(e.valueOf(),t)}});return f.toTex=void 0,f}var i=r(40),o=r(6).isInteger;t.name="eye",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(53)),f=n(r(80)),l=n(r(48)),p=n(r(85)),h=n(r(58)),m=e.DenseMatrix,d=e.SparseMatrix,g=a("multiply",i({"Array, Array":function(e,t){v(o.size(e),o.size(t));var r=g(u(e),u(t));return r&&r.isMatrix===!0?r.valueOf():r},"Matrix, Matrix":function(e,t){var r=e.size(),n=t.size();return v(r,n),1===r.length?1===n.length?y(e,t,r[0]):x(e,t):1===n.length?w(e,t):N(e,t)},"Matrix, Array":function(e,t){return g(e,u(t))},"Array, Matrix":function(e,t){return g(u(e,t.storage()),t)},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=p(e,t,f,!1);break;case"dense":r=h(e,t,f,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=p(t,e,f,!0);break;case"dense":r=h(t,e,f,!0)}return r},"Array, any":function(e,t){return h(u(e),t,f,!1).valueOf()},"any, Array":function(e,t){return h(u(t),e,f,!0).valueOf()}},f.signatures)),v=function(e,t){switch(e.length){case 1:switch(t.length){case 1:if(e[0]!==t[0])throw new RangeError("Dimension mismatch in multiplication. Vectors must have the same length");break;case 2:if(e[0]!==t[0])throw new RangeError("Dimension mismatch in multiplication. Vector length ("+e[0]+") must match Matrix rows ("+t[0]+")");break;default:throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has "+t.length+" dimensions)")}break;case 2:switch(t.length){case 1:if(e[1]!==t[0])throw new RangeError("Dimension mismatch in multiplication. Matrix columns ("+e[1]+") must match Vector length ("+t[0]+")");break;case 2:if(e[1]!==t[0])throw new RangeError("Dimension mismatch in multiplication. Matrix A columns ("+e[1]+") must match Matrix B rows ("+t[0]+")");break;default:throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has "+t.length+" dimensions)")}break;default:throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix A has "+e.length+" dimensions)")}},y=function(e,t,r){if(0===r)throw new Error("Cannot multiply two empty vectors");var n,i=e._data,o=e._datatype,s=t._data,u=t._datatype,l=c,p=f;o&&u&&o===u&&"string"==typeof o&&(n=o,l=a.find(c,[n,n]),p=a.find(f,[n,n]));for(var h=p(i[0],s[0]),m=1;r>m;m++)h=l(h,p(i[m],s[m]));return h},x=function(e,t){switch(t.storage()){case"dense":return b(e,t)}throw new Error("Not implemented")},b=function(e,t){var r,n=e._data,i=e._size,o=e._datatype,s=t._data,u=t._size,l=t._datatype,p=i[0],h=u[1],d=c,g=f;o&&l&&o===l&&"string"==typeof o&&(r=o,d=a.find(c,[r,r]),g=a.find(f,[r,r]));for(var v=[],y=0;h>y;y++){for(var x=g(n[0],s[0][y]),b=1;p>b;b++)x=d(x,g(n[b],s[b][y]));v[y]=x}return new m({data:v,size:[h],datatype:r})},w=function(e,t){switch(e.storage()){case"dense":return E(e,t);case"sparse":return O(e,t)}},N=function(e,t){switch(e.storage()){case"dense":switch(t.storage()){case"dense":return M(e,t);case"sparse":return A(e,t)}break;case"sparse":switch(t.storage()){case"dense":return _(e,t);case"sparse":return T(e,t)}}},E=function(e,t){var r,n=e._data,i=e._size,o=e._datatype,s=t._data,u=t._datatype,l=i[0],p=i[1],h=c,d=f;o&&u&&o===u&&"string"==typeof o&&(r=o,h=a.find(c,[r,r]),d=a.find(f,[r,r]));for(var g=[],v=0;l>v;v++){for(var y=n[v],x=d(y[0],s[0]),b=1;p>b;b++)x=h(x,d(y[b],s[b]));g[v]=x}return new m({data:g,size:[l],datatype:r})},M=function(e,t){var r,n=e._data,i=e._size,o=e._datatype,s=t._data,u=t._size,l=t._datatype,p=i[0],h=i[1],d=u[1],g=c,v=f;o&&l&&o===l&&"string"==typeof o&&(r=o,g=a.find(c,[r,r]),v=a.find(f,[r,r]));for(var y=[],x=0;p>x;x++){var b=n[x];y[x]=[];for(var w=0;d>w;w++){for(var N=v(b[0],s[0][w]),E=1;h>E;E++)N=g(N,v(b[E],s[E][w]));y[x][w]=N}}return new m({data:y,size:[p,d],datatype:r})},A=function(e,t){var r=e._data,n=e._size,i=e._datatype,o=t._values,s=t._index,u=t._ptr,p=t._size,h=t._datatype;if(!o)throw new Error("Cannot multiply Dense Matrix times Pattern only Matrix");var m,g=n[0],v=p[1],y=c,x=f,b=l,w=0;i&&h&&i===h&&"string"==typeof i&&(m=i,y=a.find(c,[m,m]),x=a.find(f,[m,m]),b=a.find(l,[m,m]),w=a.convert(0,m));for(var N=[],E=[],M=[],A=new d({values:N,index:E,ptr:M,size:[g,v],datatype:m}),O=0;v>O;O++){M[O]=E.length;var _=u[O],T=u[O+1];if(T>_)for(var C=0,S=0;g>S;S++){for(var z,B=S+1,k=_;T>k;k++){var I=s[k];C!==B?(z=x(r[S][I],o[k]),C=B):z=y(z,x(r[S][I],o[k]))}C!==B||b(z,w)||(E.push(S),N.push(z))}}return M[v]=E.length,A},O=function(e,t){var r=e._values,n=e._index,i=e._ptr,o=e._datatype;if(!r)throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");var s,u=t._data,p=t._datatype,h=e._size[0],m=t._size[0],g=[],v=[],y=[],x=c,b=f,w=l,N=0;o&&p&&o===p&&"string"==typeof o&&(s=o,x=a.find(c,[s,s]),b=a.find(f,[s,s]),w=a.find(l,[s,s]),N=a.convert(0,s));var E=[],M=[];y[0]=0;for(var A=0;m>A;A++){var O=u[A];if(!w(O,N))for(var _=i[A],T=i[A+1],C=_;T>C;C++){var S=n[C];M[S]?E[S]=x(E[S],b(O,r[C])):(M[S]=!0,v.push(S),E[S]=b(O,r[C]))}}for(var z=v.length,B=0;z>B;B++){var k=v[B];g[B]=E[k]}return y[1]=v.length,new d({values:g,index:v,ptr:y,size:[h,1],datatype:s})},_=function(e,t){var r=e._values,n=e._index,i=e._ptr,o=e._datatype;if(!r)throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");var s,u=t._data,p=t._datatype,h=e._size[0],m=t._size[0],g=t._size[1],v=c,y=f,x=l,b=0;o&&p&&o===p&&"string"==typeof o&&(s=o,v=a.find(c,[s,s]),y=a.find(f,[s,s]),x=a.find(l,[s,s]),b=a.convert(0,s));for(var w=[],N=[],E=[],M=new d({values:w,index:N,ptr:E,size:[h,g],datatype:s}),A=[],O=[],_=0;g>_;_++){E[_]=N.length;for(var T=_+1,C=0;m>C;C++){var S=u[C][_];if(!x(S,b))for(var z=i[C],B=i[C+1],k=z;B>k;k++){var I=n[k];O[I]!==T?(O[I]=T,N.push(I),A[I]=y(S,r[k])):A[I]=v(A[I],y(S,r[k]))}}for(var P=E[_],R=N.length,U=P;R>U;U++){var q=N[U];w[U]=A[q]}}return E[g]=N.length,M},T=function(e,t){var r,n=e._values,i=e._index,o=e._ptr,s=e._datatype,u=t._values,l=t._index,p=t._ptr,h=t._datatype,m=e._size[0],g=t._size[1],v=n&&u,y=c,x=f;s&&h&&s===h&&"string"==typeof s&&(r=s,y=a.find(c,[r,r]),x=a.find(f,[r,r]));for(var b,w,N,E,M,A,O,_,T=v?[]:void 0,C=[],S=[],z=new d({values:T,index:C,ptr:S,size:[m,g],datatype:r}),B=v?[]:void 0,k=[],I=0;g>I;I++){S[I]=C.length;var P=I+1;for(M=p[I],A=p[I+1],E=M;A>E;E++)if(_=l[E],v)for(w=o[_],N=o[_+1],b=w;N>b;b++)O=i[b],k[O]!==P?(k[O]=P,C.push(O),B[O]=x(u[E],n[b])):B[O]=y(B[O],x(u[E],n[b]));else for(w=o[_],N=o[_+1],b=w;N>b;b++)O=i[b],k[O]!==P&&(k[O]=P,C.push(O));if(v)for(var R=S[I],U=C.length,q=R;U>q;q++){var L=C[q];T[q]=B[L]}}return S[g]=C.length,z};return g.toTex={2:"\\left(${args[0]}"+s.operators.multiply+"${args[1]}\\right)"},g}var i=r(3).extend,o=r(40);t.name="multiply",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(48)),a=e.SparseMatrix,s=function(e,t,r,n){var s=e._values,u=e._index,c=e._ptr,f=e._size,l=e._datatype;if(!s)throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");var p,h=f[0],m=f[1],d=o,g=0,v=r;"string"==typeof l&&(p=l,d=i.find(o,[p,p]),g=i.convert(0,p),t=i.convert(t,p),v=i.find(r,[p,p]));for(var y=[],x=[],b=[],w=new a({values:y,index:x,ptr:b,size:[h,m],datatype:p}),N=0;m>N;N++){b[N]=x.length;for(var E=c[N],M=c[N+1],A=E;M>A;A++){var O=u[A],_=n?v(t,s[A]):v(s[A],t);d(_,g)||(x.push(O),y.push(_))}}return b[m]=x.length,w};return s}t.name="algorithm11",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("abs",{number:Math.abs,Complex:function(e){return e.abs()},BigNumber:function(e){return e.abs()},Fraction:function(e){return e.abs()},"Array | Matrix":function(e){return i(e,o,!0)},Unit:function(e){return e.abs()}});return o.toTex={1:"\\left|${args[0]}\\right|"},o}var i=r(19);t.name="abs",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("fix",{number:function(e){return e>0?Math.floor(e):Math.ceil(e)},Complex:function(t){return new e.Complex(t.re>0?Math.floor(t.re):Math.ceil(t.re),t.im>0?Math.floor(t.im):Math.ceil(t.im))},BigNumber:function(e){return e.isNegative()?e.ceil():e.floor()},Fraction:function(e){return e.s<0?e.ceil():e.floor()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\mathrm{${name}}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="fix",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(48)),s=n(r(61)),u=n(r(62)),c=n(r(63)),f=n(r(57)),l=n(r(58)),p=r(32),h=i("equal",{"any, any":function(e,t){return null===e?null===t:null===t?null===e:void 0===e?void 0===t:void 0===t?void 0===e:a(e,t)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=u(e,t,a);break;default:r=s(t,e,a,!0)}break;default:switch(t.storage()){case"sparse":r=s(e,t,a,!1);break;default:r=f(e,t,a)}}return r},"Array, Array":function(e,t){return h(o(e),o(t)).valueOf()},"Array, Matrix":function(e,t){return h(o(e),t)},"Matrix, Array":function(e,t){return h(e,o(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=c(e,t,a,!1);break;default:r=l(e,t,a,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=c(t,e,a,!0);break;default:r=l(t,e,a,!0)}return r},"Array, any":function(e,t){return l(o(e),t,a,!1).valueOf()},"any, Array":function(e,t){return l(o(t),e,a,!0).valueOf()}});return h.toTex={2:"\\left(${args[0]}"+p.operators.equal+"${args[1]}\\right)"},h}t.name="equal",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isNumeric",{"number | BigNumber | Fraction | boolean":function(){return!0},"Complex | Unit | string":function(){return!1},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);r(6);t.name="isNumeric",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("format",{any:i.format,"any, Object | function | number":i.format});return o.toTex=void 0,o}var i=r(23);t.name="format",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("_typeof",{any:function(e){var t=i.type(e);if("Object"===t){if(e.isBigNumber===!0)return"BigNumber";if(e.isComplex===!0)return"Complex";if(e.isFraction===!0)return"Fraction";if(e.isMatrix===!0)return"Matrix";if(e.isUnit===!0)return"Unit";if(e.isIndex===!0)return"Index";if(e.isRange===!0)return"Range";if(e.isChain===!0)return"Chain";if(e.isHelp===!0)return"Help"}return t}});return o.toTex=void 0,o}var i=r(41);t.name="typeof",t.factory=n},function(e,t,r){(function(e,n){function i(e,r){var n={seen:[],stylize:a};return arguments.length>=3&&(n.depth=arguments[2]),arguments.length>=4&&(n.colors=arguments[3]),d(r)?n.showHidden=r:r&&t._extend(n,r),w(n.showHidden)&&(n.showHidden=!1),w(n.depth)&&(n.depth=2),w(n.colors)&&(n.colors=!1),w(n.customInspect)&&(n.customInspect=!0),n.colors&&(n.stylize=o),u(n,e,n.depth)}function o(e,t){var r=i.styles[t];return r?"["+i.colors[r][0]+"m"+e+"["+i.colors[r][1]+"m":e}function a(e,t){return e}function s(e){var t={};return e.forEach(function(e,r){t[e]=!0}),t}function u(e,r,n){if(e.customInspect&&r&&O(r.inspect)&&r.inspect!==t.inspect&&(!r.constructor||r.constructor.prototype!==r)){var i=r.inspect(n,e);return x(i)||(i=u(e,i,n)),i}var o=c(e,r);if(o)return o;var a=Object.keys(r),d=s(a);if(e.showHidden&&(a=Object.getOwnPropertyNames(r)),A(r)&&(a.indexOf("message")>=0||a.indexOf("description")>=0))return f(r);if(0===a.length){if(O(r)){var g=r.name?": "+r.name:"";return e.stylize("[Function"+g+"]","special")}if(N(r))return e.stylize(RegExp.prototype.toString.call(r),"regexp");if(M(r))return e.stylize(Date.prototype.toString.call(r),"date");if(A(r))return f(r)}var v="",y=!1,b=["{","}"];if(m(r)&&(y=!0,b=["[","]"]),O(r)){var w=r.name?": "+r.name:"";v=" [Function"+w+"]"}if(N(r)&&(v=" "+RegExp.prototype.toString.call(r)),M(r)&&(v=" "+Date.prototype.toUTCString.call(r)),A(r)&&(v=" "+f(r)),0===a.length&&(!y||0==r.length))return b[0]+v+b[1];if(0>n)return N(r)?e.stylize(RegExp.prototype.toString.call(r),"regexp"):e.stylize("[Object]","special");e.seen.push(r);var E;return E=y?l(e,r,n,d,a):a.map(function(t){return p(e,r,n,d,t,y)}),e.seen.pop(),h(E,v,b)}function c(e,t){if(w(t))return e.stylize("undefined","undefined");if(x(t)){var r="'"+JSON.stringify(t).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(r,"string")}return y(t)?e.stylize(""+t,"number"):d(t)?e.stylize(""+t,"boolean"):g(t)?e.stylize("null","null"):void 0}function f(e){return"["+Error.prototype.toString.call(e)+"]"}function l(e,t,r,n,i){for(var o=[],a=0,s=t.length;s>a;++a)z(t,String(a))?o.push(p(e,t,r,n,String(a),!0)):o.push("");return i.forEach(function(i){i.match(/^\d+$/)||o.push(p(e,t,r,n,i,!0))}),o}function p(e,t,r,n,i,o){var a,s,c;if(c=Object.getOwnPropertyDescriptor(t,i)||{value:t[i]},c.get?s=c.set?e.stylize("[Getter/Setter]","special"):e.stylize("[Getter]","special"):c.set&&(s=e.stylize("[Setter]","special")),z(n,i)||(a="["+i+"]"),s||(e.seen.indexOf(c.value)<0?(s=g(r)?u(e,c.value,null):u(e,c.value,r-1),s.indexOf("\n")>-1&&(s=o?s.split("\n").map(function(e){return"  "+e}).join("\n").substr(2):"\n"+s.split("\n").map(function(e){return"   "+e}).join("\n"))):s=e.stylize("[Circular]","special")),w(a)){if(o&&i.match(/^\d+$/))return s;a=JSON.stringify(""+i),a.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(a=a.substr(1,a.length-2),a=e.stylize(a,"name")):(a=a.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),a=e.stylize(a,"string"))}return a+": "+s}function h(e,t,r){var n=0,i=e.reduce(function(e,t){return n++,t.indexOf("\n")>=0&&n++,e+t.replace(/\u001b\[\d\d?m/g,"").length+1},0);return i>60?r[0]+(""===t?"":t+"\n ")+" "+e.join(",\n  ")+" "+r[1]:r[0]+t+" "+e.join(", ")+" "+r[1]}function m(e){return Array.isArray(e)}function d(e){return"boolean"==typeof e}function g(e){return null===e}function v(e){return null==e}function y(e){return"number"==typeof e}function x(e){return"string"==typeof e}function b(e){return"symbol"==typeof e}function w(e){return void 0===e}function N(e){return E(e)&&"[object RegExp]"===T(e)}function E(e){return"object"==typeof e&&null!==e}function M(e){return E(e)&&"[object Date]"===T(e)}function A(e){return E(e)&&("[object Error]"===T(e)||e instanceof Error)}function O(e){return"function"==typeof e}function _(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||"undefined"==typeof e}function T(e){return Object.prototype.toString.call(e)}function C(e){return 10>e?"0"+e.toString(10):e.toString(10)}function S(){var e=new Date,t=[C(e.getHours()),C(e.getMinutes()),C(e.getSeconds())].join(":");return[e.getDate(),P[e.getMonth()],t].join(" ")}function z(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var B=/%[sdj%]/g;t.format=function(e){if(!x(e)){for(var t=[],r=0;r<arguments.length;r++)t.push(i(arguments[r]));return t.join(" ")}for(var r=1,n=arguments,o=n.length,a=String(e).replace(B,function(e){if("%%"===e)return"%";if(r>=o)return e;switch(e){case"%s":return String(n[r++]);case"%d":return Number(n[r++]);case"%j":try{return JSON.stringify(n[r++])}catch(t){return"[Circular]"}default:return e}}),s=n[r];o>r;s=n[++r])a+=g(s)||!E(s)?" "+s:" "+i(s);return a},t.deprecate=function(r,i){function o(){if(!a){if(n.throwDeprecation)throw new Error(i);n.traceDeprecation?console.trace(i):console.error(i),a=!0}return r.apply(this,arguments)}if(w(e.process))return function(){return t.deprecate(r,i).apply(this,arguments)};if(n.noDeprecation===!0)return r;var a=!1;return o};var k,I={};t.debuglog=function(e){if(w(k)&&(k=n.env.NODE_DEBUG||""),e=e.toUpperCase(),!I[e])if(new RegExp("\\b"+e+"\\b","i").test(k)){var r=n.pid;I[e]=function(){var n=t.format.apply(t,arguments);console.error("%s %d: %s",e,r,n)}}else I[e]=function(){};return I[e]},t.inspect=i,i.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},i.styles={special:"cyan",number:"yellow","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"},t.isArray=m,t.isBoolean=d,t.isNull=g,t.isNullOrUndefined=v,t.isNumber=y,t.isString=x,t.isSymbol=b,t.isUndefined=w,t.isRegExp=N,t.isObject=E,t.isDate=M,t.isError=A,t.isFunction=O,t.isPrimitive=_,t.isBuffer=r(94);var P=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];t.log=function(){console.log("%s - %s",S(),t.format.apply(t,arguments))},t.inherits=r(95),t._extend=function(e,t){if(!t||!E(t))return e;for(var r=Object.keys(t),n=r.length;n--;)e[r[n]]=t[r[n]];return e}}).call(t,function(){return this}(),r(93))},function(e,t){function r(){c=!1,a.length?u=a.concat(u):f=-1,u.length&&n()}function n(){if(!c){var e=setTimeout(r);c=!0;for(var t=u.length;t;){for(a=u,u=[];++f<t;)a&&a[f].run();f=-1,t=u.length}a=null,c=!1,clearTimeout(e)}}function i(e,t){this.fun=e,this.array=t}function o(){}var a,s=e.exports={},u=[],c=!1,f=-1;s.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];u.push(new i(e,t)),1!==u.length||c||setTimeout(n,0)},i.prototype.run=function(){this.fun.apply(null,this.array)},s.title="browser",s.browser=!0,s.env={},s.argv=[],s.version="",s.versions={},s.on=o,s.addListener=o,s.once=o,s.off=o,s.removeListener=o,s.removeAllListeners=o,s.emit=o,s.binding=function(e){throw new Error("process.binding is not supported")},s.cwd=function(){return"/"},s.chdir=function(e){throw new Error("process.chdir is not supported")},s.umask=function(){return 0}},function(e,t){e.exports=function(e){return e&&"object"==typeof e&&"function"==typeof e.copy&&"function"==typeof e.fill&&"function"==typeof e.readUInt8}},function(e,t){"function"==typeof Object.create?e.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(e,t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e}},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("unit",{Unit:function(e){return e.clone()},string:function(t){return e.Unit.isValuelessUnit(t)?new e.Unit(null,t):e.Unit.parse(t)},"number | BigNumber | Fraction | Complex, string":function(t,r){return new e.Unit(t,r)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\left(${args[0]}\\right)",2:"\\left(\\left(${args[0]}\\right)${args[1]}\\right)"},o}var i=r(19);t.name="unit",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var i=n("createUnit",{"Object, Object":function(t,r){return e.Unit.createUnit(t,r)},Object:function(t){return e.Unit.createUnit(t,{})},"string, Unit | string | Object, Object":function(t,r,n){var i={};return i[t]=r,e.Unit.createUnit(i,n)},"string, Unit | string | Object":function(t,r){var n={};return n[t]=r,e.Unit.createUnit(n,{})},string:function(t){var r={};return r[t]={},e.Unit.createUnit(r,{})}});return i}r(19);t.name="createUnit",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var i=n("splitUnit",{"Unit, Array":function(e,t){return e.splitUnit(t)}});return i}r(19);t.name="splitUnit",t.factory=n},function(e,t,r){function n(e,t,r,n,o){function a(t){var r=e.Unit.parse(t);return r.fixPrefix=!0,r}i(o,"speedOfLight",function(){return a("299792458 m s^-1")}),i(o,"gravitationConstant",function(){return a("6.6738480e-11 m^3 kg^-1 s^-2")}),i(o,"planckConstant",function(){return a("6.626069311e-34 J s")}),i(o,"reducedPlanckConstant",function(){return a("1.05457172647e-34 J s")}),i(o,"magneticConstant",function(){return a("1.2566370614e-6 N A^-2")}),i(o,"electricConstant",function(){return a("8.854187817e-12 F m^-1")}),i(o,"vacuumImpedance",function(){return a("376.730313461 ohm")}),i(o,"coulomb",function(){return a("8.9875517873681764e9 N m^2 C^-2")}),i(o,"elementaryCharge",function(){return a("1.60217656535e-19 C")}),i(o,"bohrMagneton",function(){return a("9.2740096820e-24 J T^-1")}),i(o,"conductanceQuantum",function(){return a("7.748091734625e-5 S")}),i(o,"inverseConductanceQuantum",function(){return a("12906.403721742 ohm")}),i(o,"magneticFluxQuantum",function(){return a("2.06783375846e-15 Wb")}),i(o,"nuclearMagneton",function(){return a("5.0507835311e-27 J T^-1")}),i(o,"klitzing",function(){return a("25812.807443484 ohm")}),i(o,"bohrRadius",function(){return a("5.291772109217e-11 m")}),i(o,"classicalElectronRadius",function(){return a("2.817940326727e-15 m")}),i(o,"electronMass",function(){return a("9.1093829140e-31 kg")}),i(o,"fermiCoupling",function(){return a("1.1663645e-5 GeV^-2")}),i(o,"fineStructure",function(){return.007297352569824}),i(o,"hartreeEnergy",function(){return a("4.3597443419e-18 J")}),i(o,"protonMass",function(){return a("1.67262177774e-27 kg")}),i(o,"deuteronMass",function(){return a("3.3435830926e-27 kg")}),i(o,"neutronMass",function(){return a("1.6749271613e-27 kg")}),i(o,"quantumOfCirculation",function(){return a("3.636947552024e-4 m^2 s^-1")}),i(o,"rydberg",function(){return a("10973731.56853955 m^-1")}),i(o,"thomsonCrossSection",function(){return a("6.65245873413e-29 m^2")}),i(o,"weakMixingAngle",function(){return.222321}),i(o,"efimovFactor",function(){return 22.7}),i(o,"atomicMass",function(){return a("1.66053892173e-27 kg")}),i(o,"avogadro",function(){return a("6.0221412927e23 mol^-1")}),i(o,"boltzmann",function(){return a("1.380648813e-23 J K^-1")}),i(o,"faraday",function(){return a("96485.336521 C mol^-1")}),i(o,"firstRadiation",function(){return a("3.7417715317e-16 W m^2")}),i(o,"loschmidt",function(){return a("2.686780524e25 m^-3")}),i(o,"gasConstant",function(){return a("8.314462175 J K^-1 mol^-1")}),i(o,"molarPlanckConstant",function(){return a("3.990312717628e-10 J s mol^-1")}),i(o,"molarVolume",function(){return a("2.241396820e-10 m^3 mol^-1")}),i(o,"sackurTetrode",function(){return-1.164870823}),i(o,"secondRadiation",function(){return a("1.438777013e-2 m K")}),i(o,"stefanBoltzmann",function(){return a("5.67037321e-8 W m^-2 K^-4")}),i(o,"wienDisplacement",function(){return a("2.897772126e-3 m K")}),i(o,"molarMass",function(){return a("1e-3 kg mol^-1")}),i(o,"molarMassC12",function(){return a("1.2e-2 kg mol^-1")}),i(o,"gravity",function(){return a("9.80665 m s^-2")}),i(o,"planckLength",function(){return a("1.61619997e-35 m")}),i(o,"planckMass",function(){return a("2.1765113e-8 kg")}),i(o,"planckTime",function(){return a("5.3910632e-44 s")}),i(o,"planckCharge",function(){return a("1.87554595641e-18 C")}),i(o,"planckTemperature",function(){return a("1.41683385e+32 K")})}var i=r(3).lazy;t.factory=n,t.lazy=!1,t.math=!0},function(e,t,r){"use strict";function n(e,t,a,s,u){u.on("config",function(r,i){r.number!==i.number&&n(e,t,a,s,u)}),u["true"]=!0,u["false"]=!1,u["null"]=null,u.uninitialized=r(40).UNINITIALIZED,"BigNumber"===t.number?(u.Infinity=new e.BigNumber(1/0),u.NaN=new e.BigNumber(NaN),i.lazy(u,"pi",function(){return o.pi(e.BigNumber)}),i.lazy(u,"tau",function(){return o.tau(e.BigNumber)}),i.lazy(u,"e",function(){return o.e(e.BigNumber)}),i.lazy(u,"phi",function(){return o.phi(e.BigNumber)}),i.lazy(u,"E",function(){return u.e}),i.lazy(u,"LN2",function(){return new e.BigNumber(2).ln()}),i.lazy(u,"LN10",function(){return new e.BigNumber(10).ln()}),i.lazy(u,"LOG2E",function(){return new e.BigNumber(1).div(new e.BigNumber(2).ln())}),i.lazy(u,"LOG10E",function(){return new e.BigNumber(1).div(new e.BigNumber(10).ln())}),i.lazy(u,"PI",function(){return u.pi}),i.lazy(u,"SQRT1_2",function(){return new e.BigNumber("0.5").sqrt()}),i.lazy(u,"SQRT2",function(){return new e.BigNumber(2).sqrt()})):(u.Infinity=1/0,u.NaN=NaN,u.pi=Math.PI,u.tau=2*Math.PI,u.e=Math.E,u.phi=1.618033988749895,u.E=u.e,u.LN2=Math.LN2,u.LN10=Math.LN10,u.LOG2E=Math.LOG2E,u.LOG10E=Math.LOG10E,u.PI=u.pi,u.SQRT1_2=Math.SQRT1_2,u.SQRT2=Math.SQRT2),u.i=e.Complex.I,u.version=r(101)}var i=r(3),o=r(76);t.factory=n,t.lazy=!1,t.math=!0},function(e,t){e.exports="3.4.1"},function(e,t,r){e.exports=[r(103),r(277),r(306),r(308),r(334),r(279),r(305)]},function(e,t,r){function n(e,t,n,i){var o={};return o.bignumber=r(104),o["boolean"]=r(105),o.complex=r(106),o.fraction=r(107),o.index=r(108),o.matrix=r(109),o.number=r(110),o.sparse=r(111),o.string=r(112),o.unit=r(113),o.e=r(114),o.E=r(114),o["false"]=r(115),o.i=r(116),o.Infinity=r(117),o.LN2=r(118),o.LN10=r(119),o.LOG2E=r(120),o.LOG10E=r(121),o.NaN=r(122),o["null"]=r(123),o.pi=r(124),o.PI=r(124),o.phi=r(125),o.SQRT1_2=r(126),o.SQRT2=r(127),o.tau=r(128),o["true"]=r(129),o.version=r(130),o.speedOfLight={description:"Speed of light in vacuum",examples:["speedOfLight"]},o.gravitationConstant={description:"Newtonian constant of gravitation",examples:["gravitationConstant"]},o.planckConstant={description:"Planck constant",examples:["planckConstant"]},o.reducedPlanckConstant={description:"Reduced Planck constant",examples:["reducedPlanckConstant"]},o.magneticConstant={description:"Magnetic constant (vacuum permeability)",examples:["magneticConstant"]},o.electricConstant={description:"Electric constant (vacuum permeability)",examples:["electricConstant"]},o.vacuumImpedance={description:"Characteristic impedance of vacuum",examples:["vacuumImpedance"]},o.coulomb={description:"Coulomb's constant",examples:["coulomb"]},o.elementaryCharge={description:"Elementary charge",examples:["elementaryCharge"]},o.bohrMagneton={description:"Borh magneton",examples:["bohrMagneton"]},o.conductanceQuantum={description:"Conductance quantum",examples:["conductanceQuantum"]},o.inverseConductanceQuantum={description:"Inverse conductance quantum",examples:["inverseConductanceQuantum"]},o.magneticFluxQuantum={description:"Magnetic flux quantum",examples:["magneticFluxQuantum"]},o.nuclearMagneton={description:"Nuclear magneton",examples:["nuclearMagneton"]},o.klitzing={description:"Von Klitzing constant",examples:["klitzing"]},o.bohrRadius={description:"Borh radius",examples:["bohrRadius"]},o.classicalElectronRadius={description:"Classical electron radius",examples:["classicalElectronRadius"]},o.electronMass={description:"Electron mass",examples:["electronMass"]},o.fermiCoupling={description:"Fermi coupling constant",examples:["fermiCoupling"]},o.fineStructure={description:"Fine-structure constant",examples:["fineStructure"]},o.hartreeEnergy={description:"Hartree energy",examples:["hartreeEnergy"]},o.protonMass={description:"Proton mass",examples:["protonMass"]},o.deuteronMass={description:"Deuteron Mass",examples:["deuteronMass"]},o.neutronMass={description:"Neutron mass",examples:["neutronMass"]},o.quantumOfCirculation={description:"Quantum of circulation",examples:["quantumOfCirculation"]},o.rydberg={description:"Rydberg constant",examples:["rydberg"]},o.thomsonCrossSection={description:"Thomson cross section",examples:["thomsonCrossSection"]},o.weakMixingAngle={description:"Weak mixing angle",examples:["weakMixingAngle"]},o.efimovFactor={description:"Efimov factor",examples:["efimovFactor"]},o.atomicMass={description:"Atomic mass constant",examples:["atomicMass"]},o.avogadro={description:"Avogadro's number",examples:["avogadro"]},o.boltzmann={description:"Boltzmann constant",examples:["boltzmann"]},o.faraday={description:"Faraday constant",examples:["faraday"]},o.firstRadiation={description:"First radiation constant",examples:["firstRadiation"]},o.loschmidt={description:"Loschmidt constant at T=273.15 K and p=101.325 kPa",examples:["loschmidt"]},o.gasConstant={description:"Gas constant",examples:["gasConstant"]},o.molarPlanckConstant={description:"Molar Planck constant",examples:["molarPlanckConstant"]},o.molarVolume={description:"Molar volume of an ideal gas at T=273.15 K and p=101.325 kPa",examples:["molarVolume"]},o.sackurTetrode={description:"Sackur-Tetrode constant at T=1 K and p=101.325 kPa",examples:["sackurTetrode"]},o.secondRadiation={description:"Second radiation constant",examples:["secondRadiation"]},o.stefanBoltzmann={description:"Stefan-Boltzmann constant",examples:["stefanBoltzmann"]},o.wienDisplacement={description:"Wien displacement law constant",examples:["wienDisplacement"]},o.molarMass={description:"Molar mass constant",examples:["molarMass"]},o.molarMassC12={description:"Molar mass constant of carbon-12",examples:["molarMassC12"]},o.gravity={description:"Standard acceleration of gravity (standard acceleration of free-fall on Earth)",examples:["gravity"]},o.planckLength={description:"Planck length",examples:["planckLength"]},o.planckMass={description:"Planck mass",examples:["planckMass"]},o.planckTime={description:"Planck time",examples:["planckTime"]},o.planckCharge={description:"Planck charge",examples:["planckCharge"]},o.planckTemperature={description:"Planck temperature",examples:["planckTemperature"]},o.lsolve=r(131),o.lup=r(132),o.lusolve=r(133),o.slu=r(134),o.usolve=r(135),o.abs=r(136),o.add=r(137),o.cbrt=r(138),o.ceil=r(139),o.cube=r(140),o.divide=r(141),o.dotDivide=r(142),o.dotMultiply=r(143),o.dotPow=r(144),o.exp=r(145),o.fix=r(146),o.floor=r(147),o.gcd=r(148),o.hypot=r(149),o.lcm=r(150),o.log=r(151),o.log10=r(152),o.mod=r(153),o.multiply=r(154),o.norm=r(155),o.nthRoot=r(156),o.pow=r(157),o.round=r(158),o.sign=r(159),o.sqrt=r(160),o.square=r(161),o.subtract=r(162),o.unaryMinus=r(163),o.unaryPlus=r(164),o.xgcd=r(165),o.bitAnd=r(166),o.bitNot=r(167),o.bitOr=r(168),o.bitXor=r(169),o.leftShift=r(170),o.rightArithShift=r(171),o.rightLogShift=r(172),o.bellNumbers=r(173),o.catalan=r(174),o.composition=r(175),o.stirlingS2=r(176),o.config=r(177),o["import"]=r(178),o.typed=r(179),o.arg=r(180),o.conj=r(181),o.re=r(182),o.im=r(183),o.eval=r(184),o.help=r(185),o.distance=r(186),o.intersect=r(187),o.and=r(188),o.not=r(189),o.or=r(190),o.xor=r(191),o.concat=r(192),o.cross=r(193),o.det=r(194),o.diag=r(195),o.dot=r(196),o.eye=r(197),o.filter=r(198),o.flatten=r(199),o.forEach=r(200),o.inv=r(201),o.map=r(202),o.ones=r(203),o.partitionSelect=r(204),o.range=r(205),o.resize=r(206),o.size=r(207),o.sort=r(208),o.squeeze=r(209),o.subset=r(210),o.trace=r(211),o.transpose=r(212),o.zeros=r(213),o.combinations=r(214),o.factorial=r(215),o.gamma=r(216),o.kldivergence=r(217),o.multinomial=r(218),o.permutations=r(219),o.pickRandom=r(220),o.random=r(221),o.randomInt=r(222),o.compare=r(223),o.deepEqual=r(224),o.equal=r(225),o.larger=r(226),o.largerEq=r(227),o.smaller=r(228),o.smallerEq=r(229),o.unequal=r(230),o.max=r(231),o.mean=r(232),o.median=r(233),o.min=r(234),o.mode=r(235),o.prod=r(236),o.quantileSeq=r(237),o.std=r(238),o.sum=r(239),o["var"]=r(240),o.acos=r(241),o.acosh=r(242),o.acot=r(243),o.acoth=r(244),o.acsc=r(245),o.acsch=r(246),o.asec=r(247),o.asech=r(248),o.asin=r(249),o.asinh=r(250),o.atan=r(251),o.atanh=r(252),o.atan2=r(253),o.cos=r(254),o.cosh=r(255),o.cot=r(256),o.coth=r(257),o.csc=r(258),o.csch=r(259),o.sec=r(260),o.sech=r(261),o.sin=r(262),o.sinh=r(263),o.tan=r(264),o.tanh=r(265),o.to=r(266),o.clone=r(267),o.format=r(268),o.isNaN=r(269),o.isInteger=r(270),o.isNegative=r(271),o.isNumeric=r(272),o.isPositive=r(273),o.isPrime=r(274),o.isZero=r(275),o["typeof"]=r(276),o}t.name="docs",t.path="expression",t.factory=n},function(e,t){e.exports={
name:"bignumber",category:"Construction",syntax:["bignumber(x)"],description:"Create a big number from a number or string.",examples:["0.1 + 0.2","bignumber(0.1) + bignumber(0.2)",'bignumber("7.2")','bignumber("7.2e500")',"bignumber([0.1, 0.2, 0.3])"],seealso:["boolean","complex","fraction","index","matrix","string","unit"]}},function(e,t){e.exports={name:"boolean",category:"Construction",syntax:["x","boolean(x)"],description:"Convert a string or number into a boolean.",examples:["boolean(0)","boolean(1)","boolean(3)",'boolean("true")','boolean("false")',"boolean([1, 0, 1, 1])"],seealso:["bignumber","complex","index","matrix","number","string","unit"]}},function(e,t){e.exports={name:"complex",category:"Construction",syntax:["complex()","complex(re, im)","complex(string)"],description:"Create a complex number.",examples:["complex()","complex(2, 3)",'complex("7 - 2i")'],seealso:["bignumber","boolean","index","matrix","number","string","unit"]}},function(e,t){e.exports={name:"fraction",category:"Construction",syntax:["fraction(num)","fraction(num,den)"],description:"Create a fraction from a number or from a numerator and denominator.",examples:["fraction(0.125)","fraction(1, 3) + fraction(2, 5)"],seealso:["bignumber","boolean","complex","index","matrix","string","unit"]}},function(e,t){e.exports={name:"index",category:"Construction",syntax:["[start]","[start:end]","[start:step:end]","[start1, start 2, ...]","[start1:end1, start2:end2, ...]","[start1:step1:end1, start2:step2:end2, ...]"],description:"Create an index to get or replace a subset of a matrix",examples:["[]","[1, 2, 3]","A = [1, 2, 3; 4, 5, 6]","A[1, :]","A[1, 2] = 50","A[0:2, 0:2] = ones(2, 2)"],seealso:["bignumber","boolean","complex","matrix,","number","range","string","unit"]}},function(e,t){e.exports={name:"matrix",category:"Construction",syntax:["[]","[a1, b1, ...; a2, b2, ...]","matrix()",'matrix("dense")',"matrix([...])"],description:"Create a matrix.",examples:["[]","[1, 2, 3]","[1, 2, 3; 4, 5, 6]","matrix()","matrix([3, 4])",'matrix([3, 4; 5, 6], "sparse")','matrix([3, 4; 5, 6], "sparse", "number")'],seealso:["bignumber","boolean","complex","index","number","string","unit","sparse"]}},function(e,t){e.exports={name:"number",category:"Construction",syntax:["x","number(x)"],description:"Create a number or convert a string or boolean into a number.",examples:["2","2e3","4.05","number(2)",'number("7.2")',"number(true)","number([true, false, true, true])",'number("52cm", "m")'],seealso:["bignumber","boolean","complex","fraction","index","matrix","string","unit"]}},function(e,t){e.exports={name:"sparse",category:"Construction",syntax:["sparse()","sparse([a1, b1, ...; a1, b2, ...])",'sparse([a1, b1, ...; a1, b2, ...], "number")'],description:"Create a sparse matrix.",examples:["sparse()","sparse([3, 4; 5, 6])",'sparse([3, 0; 5, 0], "number")'],seealso:["bignumber","boolean","complex","index","number","string","unit","matrix"]}},function(e,t){e.exports={name:"string",category:"Construction",syntax:['"text"',"string(x)"],description:"Create a string or convert a value to a string",examples:['"Hello World!"',"string(4.2)","string(3 + 2i)"],seealso:["bignumber","boolean","complex","index","matrix","number","unit"]}},function(e,t){e.exports={name:"unit",category:"Construction",syntax:["value unit","unit(value, unit)","unit(string)"],description:"Create a unit.",examples:["5.5 mm","3 inch",'unit(7.1, "kilogram")','unit("23 deg")'],seealso:["bignumber","boolean","complex","index","matrix","number","string"]}},function(e,t){e.exports={name:"e",category:"Constants",syntax:["e"],description:"Euler's number, the base of the natural logarithm. Approximately equal to 2.71828",examples:["e","e ^ 2","exp(2)","log(e)"],seealso:["exp"]}},function(e,t){e.exports={name:"false",category:"Constants",syntax:["false"],description:"Boolean value false",examples:["false"],seealso:["true"]}},function(e,t){e.exports={name:"i",category:"Constants",syntax:["i"],description:"Imaginary unit, defined as i*i=-1. A complex number is described as a + b*i, where a is the real part, and b is the imaginary part.",examples:["i","i * i","sqrt(-1)"],seealso:[]}},function(e,t){e.exports={name:"Infinity",category:"Constants",syntax:["Infinity"],description:"Infinity, a number which is larger than the maximum number that can be handled by a floating point number.",examples:["Infinity","1 / 0"],seealso:[]}},function(e,t){e.exports={name:"LN2",category:"Constants",syntax:["LN2"],description:"Returns the natural logarithm of 2, approximately equal to 0.693",examples:["LN2","log(2)"],seealso:[]}},function(e,t){e.exports={name:"LN10",category:"Constants",syntax:["LN10"],description:"Returns the natural logarithm of 10, approximately equal to 2.302",examples:["LN10","log(10)"],seealso:[]}},function(e,t){e.exports={name:"LOG2E",category:"Constants",syntax:["LOG2E"],description:"Returns the base-2 logarithm of E, approximately equal to 1.442",examples:["LOG2E","log(e, 2)"],seealso:[]}},function(e,t){e.exports={name:"LOG10E",category:"Constants",syntax:["LOG10E"],description:"Returns the base-10 logarithm of E, approximately equal to 0.434",examples:["LOG10E","log(e, 10)"],seealso:[]}},function(e,t){e.exports={name:"NaN",category:"Constants",syntax:["NaN"],description:"Not a number",examples:["NaN","0 / 0"],seealso:[]}},function(e,t){e.exports={name:"null",category:"Constants",syntax:["null"],description:"Value null",examples:["null"],seealso:["true","false"]}},function(e,t){e.exports={name:"pi",category:"Constants",syntax:["pi"],description:"The number pi is a mathematical constant that is the ratio of a circle's circumference to its diameter, and is approximately equal to 3.14159",examples:["pi","sin(pi/2)"],seealso:["tau"]}},function(e,t){e.exports={name:"phi",category:"Constants",syntax:["phi"],description:"Phi is the golden ratio. Two quantities are in the golden ratio if their ratio is the same as the ratio of their sum to the larger of the two quantities. Phi is defined as `(1 + sqrt(5)) / 2` and is approximately 1.618034...",examples:["tau"],seealso:[]}},function(e,t){e.exports={name:"SQRT1_2",category:"Constants",syntax:["SQRT1_2"],description:"Returns the square root of 1/2, approximately equal to 0.707",examples:["SQRT1_2","sqrt(1/2)"],seealso:[]}},function(e,t){e.exports={name:"SQRT2",category:"Constants",syntax:["SQRT2"],description:"Returns the square root of 2, approximately equal to 1.414",examples:["SQRT2","sqrt(2)"],seealso:[]}},function(e,t){e.exports={name:"tau",category:"Constants",syntax:["tau"],description:"Tau is the ratio constant of a circle's circumference to radius, equal to 2 * pi, approximately 6.2832.",examples:["tau","2 * pi"],seealso:["pi"]}},function(e,t){e.exports={name:"true",category:"Constants",syntax:["true"],description:"Boolean value true",examples:["true"],seealso:["false"]}},function(e,t){e.exports={name:"version",category:"Constants",syntax:["version"],description:"A string with the version number of math.js",examples:["version"],seealso:[]}},function(e,t){e.exports={name:"lsolve",category:"Algebra",syntax:["x=lsolve(L, b)"],description:"Solves the linear system L * x = b where L is an [n x n] lower triangular matrix and b is a [n] column vector.",examples:["a = [-2, 3; 2, 1]","b = [11, 9]","x = lsolve(a, b)"],seealso:["lup","lusolve","usolve","matrix","sparse"]}},function(e,t){e.exports={name:"lup",category:"Algebra",syntax:["lup(m)"],description:"Calculate the Matrix LU decomposition with partial pivoting. Matrix A is decomposed in three matrices (L, U, P) where P * A = L * U",examples:["lup([[2, 1], [1, 4]])","lup(matrix([[2, 1], [1, 4]]))","lup(sparse([[2, 1], [1, 4]]))"],seealso:["lusolve","lsolve","usolve","matrix","sparse","slu"]}},function(e,t){e.exports={name:"lusolve",category:"Algebra",syntax:["x=lusolve(A, b)","x=lusolve(lu, b)"],description:"Solves the linear system A * x = b where A is an [n x n] matrix and b is a [n] column vector.",examples:["a = [-2, 3; 2, 1]","b = [11, 9]","x = lusolve(a, b)"],seealso:["lup","slu","lsolve","usolve","matrix","sparse"]}},function(e,t){e.exports={name:"slu",category:"Algebra",syntax:["slu(A, order, threshold)"],description:"Calculate the Matrix LU decomposition with full pivoting. Matrix A is decomposed in two matrices (L, U) and two permutation vectors (pinv, q) where P * A * Q = L * U",examples:["slu(sparse([4.5, 0, 3.2, 0; 3.1, 2.9, 0, 0.9; 0, 1.7, 3, 0; 3.5, 0.4, 0, 1]), 1, 0.001)"],seealso:["lusolve","lsolve","usolve","matrix","sparse","lup"]}},function(e,t){e.exports={name:"usolve",category:"Algebra",syntax:["x=usolve(U, b)"],description:"Solves the linear system U * x = b where U is an [n x n] upper triangular matrix and b is a [n] column vector.",examples:["x=usolve(sparse([1, 1, 1, 1; 0, 1, 1, 1; 0, 0, 1, 1; 0, 0, 0, 1]), [1; 2; 3; 4])"],seealso:["lup","lusolve","lsolve","matrix","sparse"]}},function(e,t){e.exports={name:"abs",category:"Arithmetic",syntax:["abs(x)"],description:"Compute the absolute value.",examples:["abs(3.5)","abs(-4.2)"],seealso:["sign"]}},function(e,t){e.exports={name:"add",category:"Operators",syntax:["x + y","add(x, y)"],description:"Add two values.",examples:["a = 2.1 + 3.6","a - 3.6","3 + 2i","3 cm + 2 inch",'"2.3" + "4"'],seealso:["subtract"]}},function(e,t){e.exports={name:"cbrt",category:"Arithmetic",syntax:["cbrt(x)","cbrt(x, allRoots)"],description:"Compute the cubic root value. If x = y * y * y, then y is the cubic root of x. When `x` is a number or complex number, an optional second argument `allRoots` can be provided to return all three cubic roots. If not provided, the principal root is returned",examples:["cbrt(64)","cube(4)","cbrt(-8)","cbrt(2 + 3i)","cbrt(8i)","cbrt(8i, true)","cbrt(27 m^3)"],seealso:["square","sqrt","cube","multiply"]}},function(e,t){e.exports={name:"ceil",category:"Arithmetic",syntax:["ceil(x)"],description:"Round a value towards plus infinity. If x is complex, both real and imaginary part are rounded towards plus infinity.",examples:["ceil(3.2)","ceil(3.8)","ceil(-4.2)"],seealso:["floor","fix","round"]}},function(e,t){e.exports={name:"cube",category:"Arithmetic",syntax:["cube(x)"],description:"Compute the cube of a value. The cube of x is x * x * x.",examples:["cube(2)","2^3","2 * 2 * 2"],seealso:["multiply","square","pow"]}},function(e,t){e.exports={name:"divide",category:"Operators",syntax:["x / y","divide(x, y)"],description:"Divide two values.",examples:["a = 2 / 3","a * 3","4.5 / 2","3 + 4 / 2","(3 + 4) / 2","18 km / 4.5"],seealso:["multiply"]}},function(e,t){e.exports={name:"dotDivide",category:"Operators",syntax:["x ./ y","dotDivide(x, y)"],description:"Divide two values element wise.",examples:["a = [1, 2, 3; 4, 5, 6]","b = [2, 1, 1; 3, 2, 5]","a ./ b"],seealso:["multiply","dotMultiply","divide"]}},function(e,t){e.exports={name:"dotMultiply",category:"Operators",syntax:["x .* y","dotMultiply(x, y)"],description:"Multiply two values element wise.",examples:["a = [1, 2, 3; 4, 5, 6]","b = [2, 1, 1; 3, 2, 5]","a .* b"],seealso:["multiply","divide","dotDivide"]}},function(e,t){e.exports={name:"dotpow",category:"Operators",syntax:["x .^ y","dotpow(x, y)"],description:"Calculates the power of x to y element wise.",examples:["a = [1, 2, 3; 4, 5, 6]","a .^ 2"],seealso:["pow"]}},function(e,t){e.exports={name:"exp",category:"Arithmetic",syntax:["exp(x)"],description:"Calculate the exponent of a value.",examples:["exp(1.3)","e ^ 1.3","log(exp(1.3))","x = 2.4","(exp(i*x) == cos(x) + i*sin(x))   # Euler's formula"],seealso:["pow","log"]}},function(e,t){e.exports={name:"fix",category:"Arithmetic",syntax:["fix(x)"],description:"Round a value towards zero. If x is complex, both real and imaginary part are rounded towards zero.",examples:["fix(3.2)","fix(3.8)","fix(-4.2)","fix(-4.8)"],seealso:["ceil","floor","round"]}},function(e,t){e.exports={name:"floor",category:"Arithmetic",syntax:["floor(x)"],description:"Round a value towards minus infinity.If x is complex, both real and imaginary part are rounded towards minus infinity.",examples:["floor(3.2)","floor(3.8)","floor(-4.2)"],seealso:["ceil","fix","round"]}},function(e,t){e.exports={name:"gcd",category:"Arithmetic",syntax:["gcd(a, b)","gcd(a, b, c, ...)"],description:"Compute the greatest common divisor.",examples:["gcd(8, 12)","gcd(-4, 6)","gcd(25, 15, -10)"],seealso:["lcm","xgcd"]}},function(e,t){e.exports={name:"hypot",category:"Arithmetic",syntax:["hypot(a, b, c, ...)","hypot([a, b, c, ...])"],description:"Calculate the hypotenusa of a list with values. ",examples:["hypot(3, 4)","sqrt(3^2 + 4^2)","hypot(-2)","hypot([3, 4, 5])"],seealso:["abs","norm"]}},function(e,t){e.exports={name:"lcm",category:"Arithmetic",syntax:["lcm(x, y)"],description:"Compute the least common multiple.",examples:["lcm(4, 6)","lcm(6, 21)","lcm(6, 21, 5)"],seealso:["gcd"]}},function(e,t){e.exports={name:"log",category:"Arithmetic",syntax:["log(x)","log(x, base)"],description:"Compute the logarithm of a value. If no base is provided, the natural logarithm of x is calculated. If base if provided, the logarithm is calculated for the specified base. log(x, base) is defined as log(x) / log(base).",examples:["log(3.5)","a = log(2.4)","exp(a)","10 ^ 4","log(10000, 10)","log(10000) / log(10)","b = log(1024, 2)","2 ^ b"],seealso:["exp","log10"]}},function(e,t){e.exports={name:"log10",category:"Arithmetic",syntax:["log10(x)"],description:"Compute the 10-base logarithm of a value.",examples:["log10(0.00001)","log10(10000)","10 ^ 4","log(10000) / log(10)","log(10000, 10)"],seealso:["exp","log"]}},function(e,t){e.exports={name:"mod",category:"Operators",syntax:["x % y","x mod y","mod(x, y)"],description:"Calculates the modulus, the remainder of an integer division.",examples:["7 % 3","11 % 2","10 mod 4","function isOdd(x) = x % 2","isOdd(2)","isOdd(3)"],seealso:["divide"]}},function(e,t){e.exports={name:"multiply",category:"Operators",syntax:["x * y","multiply(x, y)"],description:"multiply two values.",examples:["a = 2.1 * 3.4","a / 3.4","2 * 3 + 4","2 * (3 + 4)","3 * 2.1 km"],seealso:["divide"]}},function(e,t){e.exports={name:"norm",category:"Arithmetic",syntax:["norm(x)","norm(x, p)"],description:"Calculate the norm of a number, vector or matrix.",examples:["abs(-3.5)","norm(-3.5)","norm(3 - 4i))","norm([1, 2, -3], Infinity)","norm([1, 2, -3], -Infinity)","norm([3, 4], 2)","norm([[1, 2], [3, 4]], 1)","norm([[1, 2], [3, 4]], 'inf')","norm([[1, 2], [3, 4]], 'fro')"]}},function(e,t){e.exports={name:"nthRoot",category:"Arithmetic",syntax:["nthRoot(a)","nthRoot(a, root)"],description:'Calculate the nth root of a value. The principal nth root of a positive real number A, is the positive real solution of the equation "x^root = A".',examples:["4 ^ 3","nthRoot(64, 3)","nthRoot(9, 2)","sqrt(9)"],seealso:["sqrt","pow"]}},function(e,t){e.exports={name:"pow",category:"Operators",syntax:["x ^ y","pow(x, y)"],description:"Calculates the power of x to y, x^y.",examples:["2^3 = 8","2*2*2","1 + e ^ (pi * i)"],seealso:["multiply"]}},function(e,t){e.exports={name:"round",category:"Arithmetic",syntax:["round(x)","round(x, n)"],description:"round a value towards the nearest integer.If x is complex, both real and imaginary part are rounded towards the nearest integer. When n is specified, the value is rounded to n decimals.",examples:["round(3.2)","round(3.8)","round(-4.2)","round(-4.8)","round(pi, 3)","round(123.45678, 2)"],seealso:["ceil","floor","fix"]}},function(e,t){e.exports={name:"sign",category:"Arithmetic",syntax:["sign(x)"],description:"Compute the sign of a value. The sign of a value x is 1 when x>1, -1 when x<0, and 0 when x=0.",examples:["sign(3.5)","sign(-4.2)","sign(0)"],seealso:["abs"]}},function(e,t){e.exports={name:"sqrt",category:"Arithmetic",syntax:["sqrt(x)"],description:"Compute the square root value. If x = y * y, then y is the square root of x.",examples:["sqrt(25)","5 * 5","sqrt(-1)"],seealso:["square","multiply"]}},function(e,t){e.exports={name:"square",category:"Arithmetic",syntax:["square(x)"],description:"Compute the square of a value. The square of x is x * x.",examples:["square(3)","sqrt(9)","3^2","3 * 3"],seealso:["multiply","pow","sqrt","cube"]}},function(e,t){e.exports={name:"subtract",category:"Operators",syntax:["x - y","subtract(x, y)"],description:"subtract two values.",examples:["a = 5.3 - 2","a + 2","2/3 - 1/6","2 * 3 - 3","2.1 km - 500m"],seealso:["add"]}},function(e,t){e.exports={name:"unaryMinus",category:"Operators",syntax:["-x","unaryMinus(x)"],description:"Inverse the sign of a value. Converts booleans and strings to numbers.",examples:["-4.5","-(-5.6)",'-"22"'],seealso:["add","subtract","unaryPlus"]}},function(e,t){e.exports={name:"unaryPlus",category:"Operators",syntax:["+x","unaryPlus(x)"],description:"Converts booleans and strings to numbers.",examples:["+true",'+"2"'],seealso:["add","subtract","unaryMinus"]}},function(e,t){e.exports={name:"xgcd",category:"Arithmetic",syntax:["xgcd(a, b)"],description:"Calculate the extended greatest common divisor for two values",examples:["xgcd(8, 12)","gcd(8, 12)","xgcd(36163, 21199)"],seealso:["gcd","lcm"]}},function(e,t){e.exports={name:"bitAnd",category:"Bitwise",syntax:["x & y","bitAnd(x, y)"],description:"Bitwise AND operation. Performs the logical AND operation on each pair of the corresponding bits of the two given values by multiplying them. If both bits in the compared position are 1, the bit in the resulting binary representation is 1, otherwise, the result is 0",examples:["5 & 3","bitAnd(53, 131)","[1, 12, 31] & 42"],seealso:["bitNot","bitOr","bitXor","leftShift","rightArithShift","rightLogShift"]}},function(e,t){e.exports={name:"bitNot",category:"Bitwise",syntax:["~x","bitNot(x)"],description:"Bitwise NOT operation. Performs a logical negation on each bit of the given value. Bits that are 0 become 1, and those that are 1 become 0.",examples:["~1","~2","bitNot([2, -3, 4])"],seealso:["bitAnd","bitOr","bitXor","leftShift","rightArithShift","rightLogShift"]}},function(e,t){e.exports={name:"bitOr",category:"Bitwise",syntax:["x | y","bitOr(x, y)"],description:"Bitwise OR operation. Performs the logical inclusive OR operation on each pair of corresponding bits of the two given values. The result in each position is 1 if the first bit is 1 or the second bit is 1 or both bits are 1, otherwise, the result is 0.",examples:["5 | 3","bitOr([1, 2, 3], 4)"],seealso:["bitAnd","bitNot","bitXor","leftShift","rightArithShift","rightLogShift"]}},function(e,t){e.exports={name:"bitXor",category:"Bitwise",syntax:["bitXor(x, y)"],description:"Bitwise XOR operation, exclusive OR. Performs the logical exclusive OR operation on each pair of corresponding bits of the two given values. The result in each position is 1 if only the first bit is 1 or only the second bit is 1, but will be 0 if both are 0 or both are 1.",examples:["bitOr(1, 2)","bitXor([2, 3, 4], 4)"],seealso:["bitAnd","bitNot","bitOr","leftShift","rightArithShift","rightLogShift"]}},function(e,t){e.exports={name:"leftShift",category:"Bitwise",syntax:["x << y","leftShift(x, y)"],description:"Bitwise left logical shift of a value x by y number of bits.",examples:["4 << 1","8 >> 1"],seealso:["bitAnd","bitNot","bitOr","bitXor","rightArithShift","rightLogShift"]}},function(e,t){e.exports={name:"rightArithShift",category:"Bitwise",syntax:["x >> y","leftShift(x, y)"],description:"Bitwise right arithmetic shift of a value x by y number of bits.",examples:["8 >> 1","4 << 1","-12 >> 2"],seealso:["bitAnd","bitNot","bitOr","bitXor","leftShift","rightLogShift"]}},function(e,t){e.exports={name:"rightLogShift",category:"Bitwise",syntax:["x >> y","leftShift(x, y)"],description:"Bitwise right logical shift of a value x by y number of bits.",examples:["8 >>> 1","4 << 1","-12 >>> 2"],seealso:["bitAnd","bitNot","bitOr","bitXor","leftShift","rightArithShift"]}},function(e,t){e.exports={name:"bellNumbers",category:"Combinatorics",syntax:["bellNumbers(n)"],description:"The Bell Numbers count the number of partitions of a set. A partition is a pairwise disjoint subset of S whose union is S. `bellNumbers` only takes integer arguments. The following condition must be enforced: n >= 0.",examples:["bellNumbers(3)","bellNumbers(8)"],seealso:["stirlingS2"]}},function(e,t){e.exports={name:"catalan",category:"Combinatorics",syntax:["catalan(n)"],description:"The Catalan Numbers enumerate combinatorial structures of many different types. catalan only takes integer arguments. The following condition must be enforced: n >= 0.",examples:["catalan(3)","catalan(8)"],seealso:["bellNumbers"]}},function(e,t){e.exports={name:"composition",category:"Combinatorics",syntax:["composition(n, k)"],description:"The composition counts of n into k parts. composition only takes integer arguments. The following condition must be enforced: k <= n.",examples:["composition(5, 3)"],seealso:["combinations"]}},function(e,t){e.exports={name:"stirlingS2",category:"Combinatorics",syntax:["stirlingS2(n, k)"],description:"he Stirling numbers of the second kind, counts the number of ways to partition a set of n labelled objects into k nonempty unlabelled subsets. `stirlingS2` only takes integer arguments. The following condition must be enforced: k <= n. If n = k or k = 1, then s(n,k) = 1.",examples:["stirlingS2(5, 3)"],seealso:["bellNumbers"]}},function(e,t){e.exports={name:"config",category:"Core",syntax:["config()","config(options)"],description:"Get configuration or change configuration.",examples:["config()","1/3 + 1/4",'config({number: "Fraction"})',"1/3 + 1/4"],seealso:[]}},function(e,t){e.exports={name:"import",category:"Core",syntax:["import(functions)","import(functions, options)"],description:"Import functions or constants from an object.",examples:["import({myFn: f(x)=x^2, myConstant: 32 })","myFn(2)","myConstant"],seealso:[]}},function(e,t){e.exports={name:"typed",category:"Core",syntax:["typed(signatures)","typed(name, signatures)"],description:"Create a typed function.",examples:['double = typed({ "number, number": f(x)=x+x })',"double(2)",'double("hello")'],seealso:[]}},function(e,t){e.exports={name:"arg",category:"Complex",syntax:["arg(x)"],description:"Compute the argument of a complex value. If x = a+bi, the argument is computed as atan2(b, a).",examples:["arg(2 + 2i)","atan2(3, 2)","arg(2 + 3i)"],seealso:["re","im","conj","abs"]}},function(e,t){e.exports={name:"conj",category:"Complex",syntax:["conj(x)"],description:"Compute the complex conjugate of a complex value. If x = a+bi, the complex conjugate is a-bi.",examples:["conj(2 + 3i)","conj(2 - 3i)","conj(-5.2i)"],seealso:["re","im","abs","arg"]}},function(e,t){e.exports={name:"re",category:"Complex",syntax:["re(x)"],description:"Get the real part of a complex number.",examples:["re(2 + 3i)","im(2 + 3i)","re(-5.2i)","re(2.4)"],seealso:["im","conj","abs","arg"]}},function(e,t){e.exports={name:"im",category:"Complex",syntax:["im(x)"],description:"Get the imaginary part of a complex number.",examples:["im(2 + 3i)","re(2 + 3i)","im(-5.2i)","im(2.4)"],seealso:["re","conj","abs","arg"]}},function(e,t){e.exports={name:"eval",category:"Expression",syntax:["eval(expression)","eval([expr1, expr2, expr3, ...])"],description:"Evaluate an expression or an array with expressions.",examples:['eval("2 + 3")','eval("sqrt(" + 4 + ")")'],seealso:[]}},function(e,t){e.exports={name:"help",category:"Expression",syntax:["help(object)","help(string)"],description:"Display documentation on a function or data type.",examples:["help(sqrt)",'help("complex")'],seealso:[]}},function(e,t){e.exports={name:"distance",category:"Geometry",syntax:["distance([x1, y1], [x2, y2])","distance([[x1, y1], [x2, y2])"],description:"Calculates the Euclidean distance between two points.",examples:["distance([0,0], [4,4])","distance([[0,0], [4,4]])"],seealso:[]}},function(e,t){e.exports={name:"intersect",category:"Geometry",syntax:["intersect(expr1, expr2, expr3, expr4)","intersect(expr1, expr2, expr3)"],description:"Computes the intersection point of lines and/or planes.",examples:["intersect([0, 0], [10, 10], [10, 0], [0, 10])","intersect([1, 0, 1],  [4, -2, 2], [1, 1, 1, 6])"],seealso:[]}},function(e,t){e.exports={name:"and",category:"Logical",syntax:["x and y","and(x, y)"],description:"Logical and. Test whether two values are both defined with a nonzero/nonempty value.",examples:["true and false","true and true","2 and 4"],seealso:["not","or","xor"]}},function(e,t){e.exports={name:"not",category:"Logical",syntax:["not x","not(x)"],description:"Logical not. Flips the boolean value of given argument.",examples:["not true","not false","not 2","not 0"],seealso:["and","or","xor"]}},function(e,t){e.exports={name:"or",category:"Logical",syntax:["x or y","or(x, y)"],description:"Logical or. Test if at least one value is defined with a nonzero/nonempty value.",examples:["true or false","false or false","0 or 4"],seealso:["not","and","xor"]}},function(e,t){e.exports={name:"xor",category:"Logical",syntax:["x or y","or(x, y)"],description:"Logical exclusive or, xor. Test whether one and only one value is defined with a nonzero/nonempty value.",examples:["true xor false","false xor false","true xor true","0 or 4"],seealso:["not","and","or"]}},function(e,t){e.exports={name:"concat",category:"Matrix",syntax:["concat(A, B, C, ...)","concat(A, B, C, ..., dim)"],description:"Concatenate matrices. By default, the matrices are concatenated by the last dimension. The dimension on which to concatenate can be provided as last argument.",examples:["A = [1, 2; 5, 6]","B = [3, 4; 7, 8]","concat(A, B)","concat(A, B, 1)","concat(A, B, 2)"],seealso:["det","diag","eye","inv","ones","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"cross",category:"Matrix",syntax:["cross(A, B)"],description:"Calculate the cross product for two vectors in three dimensional space.",examples:["cross([1, 1, 0],  [0, 1, 1])","cross([3, -3, 1], [4, 9, 2])","cross([2, 3, 4],  [5, 6, 7])"],seealso:["multiply","dot"]}},function(e,t){e.exports={name:"det",category:"Matrix",syntax:["det(x)"],description:"Calculate the determinant of a matrix",examples:["det([1, 2; 3, 4])","det([-2, 2, 3; -1, 1, 3; 2, 0, -1])"],seealso:["concat","diag","eye","inv","ones","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"diag",category:"Matrix",syntax:["diag(x)","diag(x, k)"],description:"Create a diagonal matrix or retrieve the diagonal of a matrix. When x is a vector, a matrix with the vector values on the diagonal will be returned. When x is a matrix, a vector with the diagonal values of the matrix is returned. When k is provided, the k-th diagonal will be filled in or retrieved, if k is positive, the values are placed on the super diagonal. When k is negative, the values are placed on the sub diagonal.",examples:["diag(1:3)","diag(1:3, 1)","a = [1, 2, 3; 4, 5, 6; 7, 8, 9]","diag(a)"],seealso:["concat","det","eye","inv","ones","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"dot",category:"Matrix",syntax:["dot(A, B)"],description:"Calculate the dot product of two vectors. The dot product of A = [a1, a2, a3, ..., an] and B = [b1, b2, b3, ..., bn] is defined as dot(A, B) = a1 * b1 + a2 * b2 + a3 * b3 + ... + an * bn",examples:["dot([2, 4, 1], [2, 2, 3])","[2, 4, 1] * [2, 2, 3]"],seealso:["multiply","cross"]}},function(e,t){e.exports={name:"eye",category:"Matrix",syntax:["eye(n)","eye(m, n)","eye([m, n])","eye"],description:"Returns the identity matrix with size m-by-n. The matrix has ones on the diagonal and zeros elsewhere.",examples:["eye(3)","eye(3, 5)","a = [1, 2, 3; 4, 5, 6]","eye(size(a))"],seealso:["concat","det","diag","inv","ones","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"filter",category:"Matrix",syntax:["filter(x, test)"],description:"Filter items in a matrix.",examples:["isPositive(x) = x > 0","filter([6, -2, -1, 4, 3], isPositive)","filter([6, -2, 0, 1, 0], x != 0)"],seealso:["sort","map","forEach"]}},function(e,t){e.exports={name:"flatten",category:"Matrix",syntax:["flatten(x)"],description:"Flatten a multi dimensional matrix into a single dimensional matrix.",examples:["a = [1, 2, 3; 4, 5, 6]","size(a)","b = flatten(a)","size(b)"],seealso:["concat","resize","size","squeeze"]}},function(e,t){e.exports={name:"forEach",category:"Matrix",syntax:["forEach(x, callback)"],description:"Iterates over all elements of a matrix/array, and executes the given callback function.",examples:["forEach([1, 2, 3], function(val) { console.log(val) })"],seealso:["map","sort","filter"]}},function(e,t){e.exports={name:"inv",category:"Matrix",syntax:["inv(x)"],description:"Calculate the inverse of a matrix",examples:["inv([1, 2; 3, 4])","inv(4)","1 / 4"],seealso:["concat","det","diag","eye","ones","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"map",category:"Matrix",syntax:["map(x, callback)"],description:"Create a new matrix or array with the results of the callback function executed on each entry of the matrix/array.",examples:["map([1, 2, 3], function(val) { return value * value })"],seealso:["filter","forEach"]}},function(e,t){e.exports={name:"ones",category:"Matrix",syntax:["ones(m)","ones(m, n)","ones(m, n, p, ...)","ones([m])","ones([m, n])","ones([m, n, p, ...])","ones"],description:"Create a matrix containing ones.",examples:["ones(3)","ones(3, 5)","ones([2,3]) * 4.5","a = [1, 2, 3; 4, 5, 6]","ones(size(a))"],seealso:["concat","det","diag","eye","inv","range","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"partitionSelect",category:"Matrix",syntax:["partitionSelect(x, k)","partitionSelect(x, k, compare)"],description:"Partition-based selection of an array or 1D matrix. Will find the kth smallest value, and mutates the input array. Uses Quickselect.",examples:["partitionSelect([5, 10, 1], 2)",'partitionSelect(["C", "B", "A", "D"], 1)'],seealso:["sort"]}},function(e,t){e.exports={name:"range",category:"Type",syntax:["start:end","start:step:end","range(start, end)","range(start, end, step)","range(string)"],description:"Create a range. Lower bound of the range is included, upper bound is excluded.",examples:["1:5","3:-1:-3","range(3, 7)","range(0, 12, 2)",'range("4:10")',"a = [1, 2, 3, 4; 5, 6, 7, 8]","a[1:2, 1:2]"],seealso:["concat","det","diag","eye","inv","ones","size","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"resize",category:"Matrix",syntax:["resize(x, size)","resize(x, size, defaultValue)"],description:"Resize a matrix.",examples:["resize([1,2,3,4,5], [3])","resize([1,2,3], [5])","resize([1,2,3], [5], -1)","resize(2, [2, 3])",'resize("hello", [8], "!")'],seealso:["size","subset","squeeze"]}},function(e,t){e.exports={name:"size",category:"Matrix",syntax:["size(x)"],description:"Calculate the size of a matrix.",examples:["size(2.3)",'size("hello world")',"a = [1, 2; 3, 4; 5, 6]","size(a)","size(1:6)"],seealso:["concat","det","diag","eye","inv","ones","range","squeeze","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"sort",category:"Matrix",syntax:["sort(x)","sort(x, compare)"],description:'Sort the items in a matrix. Compare can be a string "asc" or "desc", or a custom sort function.',examples:["sort([5, 10, 1])",'sort(["C", "B", "A", "D"])',"sortByLength(a, b) = size(a)[1] - size(b)[1]",'sort(["Langdon", "Tom", "Sara"], sortByLength)'],seealso:["map","filter","forEach"]}},function(e,t){e.exports={name:"squeeze",category:"Matrix",syntax:["squeeze(x)"],description:"Remove inner and outer singleton dimensions from a matrix.",examples:["a = zeros(3,2,1)","size(squeeze(a))","b = zeros(1,1,3)","size(squeeze(b))"],seealso:["concat","det","diag","eye","inv","ones","range","size","subset","trace","transpose","zeros"]}},function(e,t){e.exports={name:"subset",category:"Matrix",syntax:["value(index)","value(index) = replacement","subset(value, [index])","subset(value, [index], replacement)"],
description:"Get or set a subset of a matrix or string. Indexes are one-based. Both the ranges lower-bound and upper-bound are included.",examples:["d = [1, 2; 3, 4]","e = []","e[1, 1:2] = [5, 6]","e[2, :] = [7, 8]","f = d * e","f[2, 1]","f[:, 1]"],seealso:["concat","det","diag","eye","inv","ones","range","size","squeeze","trace","transpose","zeros"]}},function(e,t){e.exports={name:"trace",category:"Matrix",syntax:["trace(A)"],description:"Calculate the trace of a matrix: the sum of the elements on the main diagonal of a square matrix.",examples:["A = [1, 2, 3; -1, 2, 3; 2, 0, 3]","trace(A)"],seealso:["concat","det","diag","eye","inv","ones","range","size","squeeze","subset","transpose","zeros"]}},function(e,t){e.exports={name:"transpose",category:"Matrix",syntax:["x'","transpose(x)"],description:"Transpose a matrix",examples:["a = [1, 2, 3; 4, 5, 6]","a'","transpose(a)"],seealso:["concat","det","diag","eye","inv","ones","range","size","squeeze","subset","trace","zeros"]}},function(e,t){e.exports={name:"zeros",category:"Matrix",syntax:["zeros(m)","zeros(m, n)","zeros(m, n, p, ...)","zeros([m])","zeros([m, n])","zeros([m, n, p, ...])","zeros"],description:"Create a matrix containing zeros.",examples:["zeros(3)","zeros(3, 5)","a = [1, 2, 3; 4, 5, 6]","zeros(size(a))"],seealso:["concat","det","diag","eye","inv","ones","range","size","squeeze","subset","trace","transpose"]}},function(e,t){e.exports={name:"combinations",category:"Probability",syntax:["combinations(n, k)"],description:"Compute the number of combinations of n items taken k at a time",examples:["combinations(7, 5)"],seealso:["permutations","factorial"]}},function(e,t){e.exports={name:"factorial",category:"Probability",syntax:["kldivergence(x, y)"],description:"Compute the factorial of a value",examples:["5!","5 * 4 * 3 * 2 * 1","3!"],seealso:["combinations","permutations","gamma"]}},function(e,t){e.exports={name:"gamma",category:"Probability",syntax:["gamma(n)"],description:"Compute the gamma function. For small values, the Lanczos approximation is used, and for large values the extended Stirling approximation.",examples:["gamma(4)","3!","gamma(1/2)","sqrt(pi)"],seealso:["factorial"]}},function(e,t){e.exports={name:"kldivergence",category:"Probability",syntax:["n!","factorial(n)"],description:"Calculate the Kullback-Leibler (KL) divergence  between two distributions.",examples:["math.kldivergence([0.7,0.5,0.4], [0.2,0.9,0.5])"],seealso:[]}},function(e,t){e.exports={name:"multinomial",category:"Probability",syntax:["multinomial(A)"],description:"Multinomial Coefficients compute the number of ways of picking a1, a2, ..., ai unordered outcomes from `n` possibilities. multinomial takes one array of integers as an argument. The following condition must be enforced: every ai <= 0.",examples:["multinomial([1, 2, 1])"],seealso:["combinations","factorial"]}},function(e,t){e.exports={name:"permutations",category:"Probability",syntax:["permutations(n)","permutations(n, k)"],description:"Compute the number of permutations of n items taken k at a time",examples:["permutations(5)","permutations(5, 3)"],seealso:["combinations","factorial"]}},function(e,t){e.exports={name:"pickRandom",category:"Probability",syntax:["pickRandom(array)"],description:"Pick a random entry from a given array.",examples:["pickRandom(0:10)","pickRandom([1, 3, 1, 6])"],seealso:["random","randomInt"]}},function(e,t){e.exports={name:"random",category:"Probability",syntax:["random()","random(max)","random(min, max)","random(size)","random(size, max)","random(size, min, max)"],description:"Return a random number.",examples:["random()","random(10, 20)","random([2, 3])"],seealso:["pickRandom","randomInt"]}},function(e,t){e.exports={name:"randInt",category:"Probability",syntax:["randInt(max)","randInt(min, max)","randInt(size)","randInt(size, max)","randInt(size, min, max)"],description:"Return a random integer number",examples:["randInt(10, 20)","randInt([2, 3], 10)"],seealso:["pickRandom","random"]}},function(e,t){e.exports={name:"compare",category:"Relational",syntax:["compare(x, y)"],description:"Compare two values. Returns 1 if x is larger than y, -1 if x is smaller than y, and 0 if x and y are equal.",examples:["compare(2, 3)","compare(3, 2)","compare(2, 2)","compare(5cm, 40mm)","compare(2, [1, 2, 3])"],seealso:["equal","unequal","smaller","smallerEq","largerEq"]}},function(e,t){e.exports={name:"deepEqual",category:"Relational",syntax:["deepEqual(x, y)"],description:"Check equality of two matrices element wise. Returns true if the size of both matrices is equal and when and each of the elements are equal.",examples:["[1,3,4] == [1,3,4]","[1,3,4] == [1,3]"],seealso:["equal","unequal","smaller","larger","smallerEq","largerEq","compare"]}},function(e,t){e.exports={name:"equal",category:"Relational",syntax:["x == y","equal(x, y)"],description:"Check equality of two values. Returns true if the values are equal, and false if not.",examples:["2+2 == 3","2+2 == 4","a = 3.2","b = 6-2.8","a == b","50cm == 0.5m"],seealso:["unequal","smaller","larger","smallerEq","largerEq","compare","deepEqual"]}},function(e,t){e.exports={name:"larger",category:"Relational",syntax:["x > y","larger(x, y)"],description:"Check if value x is larger than y. Returns true if x is larger than y, and false if not.",examples:["2 > 3","5 > 2*2","a = 3.3","b = 6-2.8","(a > b)","(b < a)","5 cm > 2 inch"],seealso:["equal","unequal","smaller","smallerEq","largerEq","compare"]}},function(e,t){e.exports={name:"largerEq",category:"Relational",syntax:["x >= y","largerEq(x, y)"],description:"Check if value x is larger or equal to y. Returns true if x is larger or equal to y, and false if not.",examples:["2 > 1+1","2 >= 1+1","a = 3.2","b = 6-2.8","(a > b)"],seealso:["equal","unequal","smallerEq","smaller","largerEq","compare"]}},function(e,t){e.exports={name:"smaller",category:"Relational",syntax:["x < y","smaller(x, y)"],description:"Check if value x is smaller than value y. Returns true if x is smaller than y, and false if not.",examples:["2 < 3","5 < 2*2","a = 3.3","b = 6-2.8","(a < b)","5 cm < 2 inch"],seealso:["equal","unequal","larger","smallerEq","largerEq","compare"]}},function(e,t){e.exports={name:"smallerEq",category:"Relational",syntax:["x <= y","smallerEq(x, y)"],description:"Check if value x is smaller or equal to value y. Returns true if x is smaller than y, and false if not.",examples:["2 < 1+1","2 <= 1+1","a = 3.2","b = 6-2.8","(a < b)"],seealso:["equal","unequal","larger","smaller","largerEq","compare"]}},function(e,t){e.exports={name:"unequal",category:"Relational",syntax:["x != y","unequal(x, y)"],description:"Check unequality of two values. Returns true if the values are unequal, and false if they are equal.",examples:["2+2 != 3","2+2 != 4","a = 3.2","b = 6-2.8","a != b","50cm != 0.5m","5 cm != 2 inch"],seealso:["equal","smaller","larger","smallerEq","largerEq","compare","deepEqual"]}},function(e,t){e.exports={name:"max",category:"Statistics",syntax:["max(a, b, c, ...)","max(A)","max(A, dim)"],description:"Compute the maximum value of a list of values.",examples:["max(2, 3, 4, 1)","max([2, 3, 4, 1])","max([2, 5; 4, 3])","max([2, 5; 4, 3], 1)","max([2, 5; 4, 3], 2)","max(2.7, 7.1, -4.5, 2.0, 4.1)","min(2.7, 7.1, -4.5, 2.0, 4.1)"],seealso:["mean","median","min","prod","std","sum","var"]}},function(e,t){e.exports={name:"mean",category:"Statistics",syntax:["mean(a, b, c, ...)","mean(A)","mean(A, dim)"],description:"Compute the arithmetic mean of a list of values.",examples:["mean(2, 3, 4, 1)","mean([2, 3, 4, 1])","mean([2, 5; 4, 3])","mean([2, 5; 4, 3], 1)","mean([2, 5; 4, 3], 2)","mean([1.0, 2.7, 3.2, 4.0])"],seealso:["max","median","min","prod","std","sum","var"]}},function(e,t){e.exports={name:"median",category:"Statistics",syntax:["median(a, b, c, ...)","median(A)"],description:"Compute the median of all values. The values are sorted and the middle value is returned. In case of an even number of values, the average of the two middle values is returned.",examples:["median(5, 2, 7)","median([3, -1, 5, 7])"],seealso:["max","mean","min","prod","std","sum","var"]}},function(e,t){e.exports={name:"min",category:"Statistics",syntax:["min(a, b, c, ...)","min(A)","min(A, dim)"],description:"Compute the minimum value of a list of values.",examples:["min(2, 3, 4, 1)","min([2, 3, 4, 1])","min([2, 5; 4, 3])","min([2, 5; 4, 3], 1)","min([2, 5; 4, 3], 2)","min(2.7, 7.1, -4.5, 2.0, 4.1)","max(2.7, 7.1, -4.5, 2.0, 4.1)"],seealso:["max","mean","median","prod","std","sum","var"]}},function(e,t){e.exports={name:"mode",category:"Statistics",syntax:["mode(a, b, c, ...)","mode(A)","mode(A, a, b, B, c, ...)"],description:"Computes the mode of all values as an array. In case mode being more than one, multiple values are returned in an array.",examples:["mode(5, 2, 7)","mode([3, -1, 5, 7])"],seealso:["max","mean","min","median","prod","std","sum","var"]}},function(e,t){e.exports={name:"prod",category:"Statistics",syntax:["prod(a, b, c, ...)","prod(A)"],description:"Compute the product of all values.",examples:["prod(2, 3, 4)","prod([2, 3, 4])","prod([2, 5; 4, 3])"],seealso:["max","mean","min","median","min","std","sum","var"]}},function(e,t){e.exports={name:"quantileSeq",category:"Statistics",syntax:["quantileSeq(A, prob[, sorted])","quantileSeq(A, [prob1, prob2, ...][, sorted])","quantileSeq(A, N[, sorted])"],description:"Compute the prob order quantile of a matrix or a list with values. The sequence is sorted and the middle value is returned. Supported types of sequence values are: Number, BigNumber, Unit Supported types of probablity are: Number, BigNumber. \n\nIn case of a (multi dimensional) array or matrix, the prob order quantile of all elements will be calculated.",examples:["quantileSeq([3, -1, 5, 7], 0.5)","quantileSeq([3, -1, 5, 7], [1/3, 2/3])","quantileSeq([3, -1, 5, 7], 2)","quantileSeq([-1, 3, 5, 7], 0.5, true)"],seealso:["mean","median","min","max","prod","std","sum","var"]}},function(e,t){e.exports={name:"std",category:"Statistics",syntax:["std(a, b, c, ...)","std(A)","std(A, normalization)"],description:'Compute the standard deviation of all values, defined as std(A) = sqrt(var(A)). Optional parameter normalization can be "unbiased" (default), "uncorrected", or "biased".',examples:["std(2, 4, 6)","std([2, 4, 6, 8])",'std([2, 4, 6, 8], "uncorrected")','std([2, 4, 6, 8], "biased")',"std([1, 2, 3; 4, 5, 6])"],seealso:["max","mean","min","median","min","prod","sum","var"]}},function(e,t){e.exports={name:"sum",category:"Statistics",syntax:["sum(a, b, c, ...)","sum(A)"],description:"Compute the sum of all values.",examples:["sum(2, 3, 4, 1)","sum([2, 3, 4, 1])","sum([2, 5; 4, 3])"],seealso:["max","mean","median","min","prod","std","sum","var"]}},function(e,t){e.exports={name:"var",category:"Statistics",syntax:["var(a, b, c, ...)","var(A)","var(A, normalization)"],description:'Compute the variance of all values. Optional parameter normalization can be "unbiased" (default), "uncorrected", or "biased".',examples:["var(2, 4, 6)","var([2, 4, 6, 8])",'var([2, 4, 6, 8], "uncorrected")','var([2, 4, 6, 8], "biased")',"var([1, 2, 3; 4, 5, 6])"],seealso:["max","mean","min","median","min","prod","std","sum"]}},function(e,t){e.exports={name:"acos",category:"Trigonometry",syntax:["acos(x)"],description:"Compute the inverse cosine of a value in radians.",examples:["acos(0.5)","acos(cos(2.3))"],seealso:["cos","atan","asin"]}},function(e,t){e.exports={name:"acosh",category:"Trigonometry",syntax:["acosh(x)"],description:"Calculate the hyperbolic arccos of a value, defined as `acosh(x) = ln(sqrt(x^2 - 1) + x)`.",examples:["acosh(1.5)"],seealso:["cosh","asinh","atanh"]}},function(e,t){e.exports={name:"acot",category:"Trigonometry",syntax:["acot(x)"],description:"Calculate the inverse cotangent of a value.",examples:["acot(0.5)","acot(cot(0.5))","acot(2)"],seealso:["cot","atan"]}},function(e,t){e.exports={name:"acoth",category:"Trigonometry",syntax:["acoth(x)"],description:"Calculate the hyperbolic arccotangent of a value, defined as `acoth(x) = (ln((x+1)/x) + ln(x/(x-1))) / 2`.",examples:["acoth(0.5)"],seealso:["acsch","asech"]}},function(e,t){e.exports={name:"acsc",category:"Trigonometry",syntax:["acsc(x)"],description:"Calculate the inverse cotangent of a value.",examples:["acsc(0.5)","acsc(csc(0.5))","acsc(2)"],seealso:["csc","asin","asec"]}},function(e,t){e.exports={name:"acsch",category:"Trigonometry",syntax:["acsch(x)"],description:"Calculate the hyperbolic arccosecant of a value, defined as `acsch(x) = ln(1/x + sqrt(1/x^2 + 1))`.",examples:["acsch(0.5)"],seealso:["asech","acoth"]}},function(e,t){e.exports={name:"asec",category:"Trigonometry",syntax:["asec(x)"],description:"Calculate the inverse secant of a value.",examples:["asec(0.5)","asec(sec(0.5))","asec(2)"],seealso:["acos","acot","acsc"]}},function(e,t){e.exports={name:"asech",category:"Trigonometry",syntax:["asech(x)"],description:"Calculate the inverse secant of a value.",examples:["asech(0.5)"],seealso:["acsch","acoth"]}},function(e,t){e.exports={name:"asin",category:"Trigonometry",syntax:["asin(x)"],description:"Compute the inverse sine of a value in radians.",examples:["asin(0.5)","asin(sin(2.3))"],seealso:["sin","acos","atan"]}},function(e,t){e.exports={name:"asinh",category:"Trigonometry",syntax:["asinh(x)"],description:"Calculate the hyperbolic arcsine of a value, defined as `asinh(x) = ln(x + sqrt(x^2 + 1))`.",examples:["asinh(0.5)"],seealso:["acosh","atanh"]}},function(e,t){e.exports={name:"atan",category:"Trigonometry",syntax:["atan(x)"],description:"Compute the inverse tangent of a value in radians.",examples:["atan(0.5)","atan(tan(2.3))"],seealso:["tan","acos","asin"]}},function(e,t){e.exports={name:"atanh",category:"Trigonometry",syntax:["atanh(x)"],description:"Calculate the hyperbolic arctangent of a value, defined as `atanh(x) = ln((1 + x)/(1 - x)) / 2`.",examples:["atanh(0.5)"],seealso:["acosh","asinh"]}},function(e,t){e.exports={name:"atan2",category:"Trigonometry",syntax:["atan2(y, x)"],description:"Computes the principal value of the arc tangent of y/x in radians.",examples:["atan2(2, 2) / pi","angle = 60 deg in rad","x = cos(angle)","y = sin(angle)","atan2(y, x)"],seealso:["sin","cos","tan"]}},function(e,t){e.exports={name:"cos",category:"Trigonometry",syntax:["cos(x)"],description:"Compute the cosine of x in radians.",examples:["cos(2)","cos(pi / 4) ^ 2","cos(180 deg)","cos(60 deg)","sin(0.2)^2 + cos(0.2)^2"],seealso:["acos","sin","tan"]}},function(e,t){e.exports={name:"cosh",category:"Trigonometry",syntax:["cosh(x)"],description:"Compute the hyperbolic cosine of x in radians.",examples:["cosh(0.5)"],seealso:["sinh","tanh","coth"]}},function(e,t){e.exports={name:"cot",category:"Trigonometry",syntax:["cot(x)"],description:"Compute the cotangent of x in radians. Defined as 1/tan(x)",examples:["cot(2)","1 / tan(2)"],seealso:["sec","csc","tan"]}},function(e,t){e.exports={name:"coth",category:"Trigonometry",syntax:["coth(x)"],description:"Compute the hyperbolic cotangent of x in radians.",examples:["coth(2)","1 / tanh(2)"],seealso:["sech","csch","tanh"]}},function(e,t){e.exports={name:"csc",category:"Trigonometry",syntax:["csc(x)"],description:"Compute the cosecant of x in radians. Defined as 1/sin(x)",examples:["csc(2)","1 / sin(2)"],seealso:["sec","cot","sin"]}},function(e,t){e.exports={name:"csch",category:"Trigonometry",syntax:["csch(x)"],description:"Compute the hyperbolic cosecant of x in radians. Defined as 1/sinh(x)",examples:["csch(2)","1 / sinh(2)"],seealso:["sech","coth","sinh"]}},function(e,t){e.exports={name:"sec",category:"Trigonometry",syntax:["sec(x)"],description:"Compute the secant of x in radians. Defined as 1/cos(x)",examples:["sec(2)","1 / cos(2)"],seealso:["cot","csc","cos"]}},function(e,t){e.exports={name:"sech",category:"Trigonometry",syntax:["sech(x)"],description:"Compute the hyperbolic secant of x in radians. Defined as 1/cosh(x)",examples:["sech(2)","1 / cosh(2)"],seealso:["coth","csch","cosh"]}},function(e,t){e.exports={name:"sin",category:"Trigonometry",syntax:["sin(x)"],description:"Compute the sine of x in radians.",examples:["sin(2)","sin(pi / 4) ^ 2","sin(90 deg)","sin(30 deg)","sin(0.2)^2 + cos(0.2)^2"],seealso:["asin","cos","tan"]}},function(e,t){e.exports={name:"sinh",category:"Trigonometry",syntax:["sinh(x)"],description:"Compute the hyperbolic sine of x in radians.",examples:["sinh(0.5)"],seealso:["cosh","tanh"]}},function(e,t){e.exports={name:"tan",category:"Trigonometry",syntax:["tan(x)"],description:"Compute the tangent of x in radians.",examples:["tan(0.5)","sin(0.5) / cos(0.5)","tan(pi / 4)","tan(45 deg)"],seealso:["atan","sin","cos"]}},function(e,t){e.exports={name:"tanh",category:"Trigonometry",syntax:["tanh(x)"],description:"Compute the hyperbolic tangent of x in radians.",examples:["tanh(0.5)","sinh(0.5) / cosh(0.5)"],seealso:["sinh","cosh"]}},function(e,t){e.exports={name:"to",category:"Units",syntax:["x to unit","to(x, unit)"],description:"Change the unit of a value.",examples:["5 inch to cm","3.2kg to g","16 bytes in bits"],seealso:[]}},function(e,t){e.exports={name:"clone",category:"Utils",syntax:["clone(x)"],description:"Clone a variable. Creates a copy of primitive variables,and a deep copy of matrices",examples:["clone(3.5)","clone(2 - 4i)","clone(45 deg)","clone([1, 2; 3, 4])",'clone("hello world")'],seealso:[]}},function(e,t){e.exports={name:"format",category:"Utils",syntax:["format(value)","format(value, precision)"],description:"Format a value of any type as string.",examples:["format(2.3)","format(3 - 4i)","format([])","format(pi, 3)"],seealso:["print"]}},function(e,t){e.exports={name:"isNaN",category:"Utils",syntax:["isNaN(x)"],description:"Test whether a value is NaN (not a number)",examples:["isNaN(2)","isNaN(0 / 0)","isNaN(NaN)","isNaN(Infinity)"],seealso:["isNegative","isNumeric","isPositive","isZero"]}},function(e,t){e.exports={name:"isInteger",category:"Utils",syntax:["isInteger(x)"],description:"Test whether a value is an integer number.",examples:["isInteger(2)","isInteger(3.5)","isInteger([3, 0.5, -2])"],seealso:["isNegative","isNumeric","isPositive","isZero"]}},function(e,t){e.exports={name:"isNegative",category:"Utils",syntax:["isNegative(x)"],description:"Test whether a value is negative: smaller than zero.",examples:["isNegative(2)","isNegative(0)","isNegative(-4)","isNegative([3, 0.5, -2])"],seealso:["isInteger","isNumeric","isPositive","isZero"]}},function(e,t){e.exports={name:"isNumeric",category:"Utils",syntax:["isNumeric(x)"],description:"Test whether a value is a numeric value. Returns true when the input is a number, BigNumber, Fraction, or boolean.",examples:["isNumeric(2)","isNumeric(0)","isNumeric(bignumber(500))","isNumeric(fraction(0.125))",'isNumeric("3")',"isNumeric(2 + 3i)",'isNumeric([2.3, "foo", false])'],seealso:["isInteger","isZero","isNegative","isPositive","isNaN"]}},function(e,t){e.exports={name:"isPositive",category:"Utils",syntax:["isPositive(x)"],description:"Test whether a value is positive: larger than zero.",examples:["isPositive(2)","isPositive(0)","isPositive(-4)","isPositive([3, 0.5, -2])"],seealso:["isInteger","isNumeric","isNegative","isZero"]}},function(e,t){e.exports={name:"isPrime",category:"Utils",syntax:["isPrime(x)"],description:"Test whether a value is prime: has no divisors other than itself and one.",examples:["isPrime(3)","isPrime(-2)","isPrime([2, 17, 100])"],seealso:["isInteger","isNumeric","isNegative","isZero"]}},function(e,t){e.exports={name:"isZero",category:"Utils",syntax:["isZero(x)"],description:"Test whether a value is zero.",examples:["isZero(2)","isZero(0)","isZero(-4)","isZero([3, 0, -2, 0])"],seealso:["isInteger","isNumeric","isNegative","isPositive"]}},function(e,t){e.exports={name:"typeof",category:"Utils",syntax:["typeof(x)"],description:"Get the type of a variable.",examples:["typeof(3.5)","typeof(2 - 4i)","typeof(45 deg)",'typeof("hello world")'],seealso:[]}},function(e,t,r){e.exports=[r(278),r(301),r(302),r(303),r(304)]},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(279));return o("compile",{string:function(e){return a(e).compile()},"Array | Matrix":function(e){return i(e,function(e){return a(e).compile()})}})}var i=r(19);t.name="compile",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(t,r){if(1!=arguments.length&&2!=arguments.length)throw new i("parse",arguments.length,1,2);if(de=r&&r.nodes?r.nodes:{},"string"==typeof t)return ge=t,x();if(Array.isArray(t)||t instanceof e.Matrix)return o(t,function(e){if("string"!=typeof e)throw new TypeError("String expected");return ge=e,x()});throw new TypeError("String or matrix expected")}function u(){ve=0,ye=ge.charAt(0),we=0,Ne=null}function c(){ve++,ye=ge.charAt(ve)}function f(){return ge.charAt(ve+1)}function l(){return ge.charAt(ve+2)}function p(){for(be=pe.NULL,xe="";" "==ye||"	"==ye||"\n"==ye&&we;)c();if("#"==ye)for(;"\n"!=ye&&""!=ye;)c();if(""==ye)return void(be=pe.DELIMITER);if("\n"==ye&&!we)return be=pe.DELIMITER,xe=ye,void c();var e=ye+f(),t=e+l();if(3==t.length&&he[t])return be=pe.DELIMITER,xe=t,c(),c(),void c();if(2==e.length&&he[e])return be=pe.DELIMITER,xe=e,c(),void c();if(he[ye])return be=pe.DELIMITER,xe=ye,void c();if(!v(ye)){if(g()){for(;g()||y(ye);)xe+=ye,c();return void(be=me.hasOwnProperty(xe)?pe.DELIMITER:pe.SYMBOL)}for(be=pe.UNKNOWN;""!=ye;)xe+=ye,c();throw X('Syntax error in part "'+xe+'"')}if(be=pe.NUMBER,"."==ye)xe+=ye,c(),y(ye)||(be=pe.UNKNOWN);else{for(;y(ye);)xe+=ye,c();"."==ye&&(xe+=ye,c())}for(;y(ye);)xe+=ye,c();if(e=f(),"E"==ye||"e"==ye)if(y(e)||"-"==e||"+"==e){if(xe+=ye,c(),"+"!=ye&&"-"!=ye||(xe+=ye,c()),!y(ye))throw X('Digit expected, got "'+ye+'"');for(;y(ye);)xe+=ye,c();if("."==ye)throw X('Digit expected, got "'+ye+'"')}else if("."==e)throw c(),X('Digit expected, got "'+ye+'"')}function h(){do p();while("\n"==xe)}function m(){we++}function d(){we--}function g(){var e=ge.charAt(ve-1),t=ge.charAt(ve+1),r=function(e){return/^[a-zA-Z_\u00C0-\u02AF\u0370-\u03FF]$/.test(e)},n=function(e,t){return/^[\uD835]$/.test(e)&&/^[\uDC00-\uDFFF]$/.test(t)&&/^[^\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]$/.test(t)};return r(ye)||n(ye,t)||n(e,ye)}function v(e){return e>="0"&&"9">=e||"."==e}function y(e){return e>="0"&&"9">=e}function x(){u(),p();var e=b();if(""!=xe)throw be==pe.DELIMITER?J("Unexpected operator "+xe):X('Unexpected part "'+xe+'"');return e}function b(){var e,t,r=[];if(""==xe)return new ne("undefined","undefined");for("\n"!=xe&&";"!=xe&&(e=w());"\n"==xe||";"==xe;)0==r.length&&e&&(t=";"!=xe,r.push({node:e,visible:t})),p(),"\n"!=xe&&";"!=xe&&""!=xe&&(e=w(),t=";"!=xe,r.push({node:e,visible:t}));return r.length>0?new te(r):e}function w(){var e,t,r,n,i=N();if("="==xe){if(i&&i.isSymbolNode)return e=i.name,h(),r=w(),new ee(new le(e),r);if(i&&i.isAccessorNode)return h(),r=w(),new ee(i.object,i.index,r);if(i&&i.isFunctionNode&&(n=!0,t=[],e=i.name,i.args.forEach(function(e,r){e&&e.isSymbolNode?t[r]=e.name:n=!1}),n))return h(),r=w(),new ie(e,t,r);throw X("Invalid left hand side of assignment operator =")}return i}function N(){for(var e=E();"?"==xe;){var t=Ne;Ne=we,h();var r=e,n=w();if(":"!=xe)throw X("False part of conditional expression expected");Ne=null,h();var i=w();e=new re(r,n,i),Ne=t}return e}function E(){for(var e=M();"or"==xe;)h(),e=new se("or","or",[e,M()]);return e}function M(){for(var e=A();"xor"==xe;)h(),e=new se("xor","xor",[e,A()]);return e}function A(){for(var e=O();"and"==xe;)h(),e=new se("and","and",[e,O()]);return e}function O(){for(var e=_();"|"==xe;)h(),e=new se("|","bitOr",[e,_()]);return e}function _(){for(var e=T();"^|"==xe;)h(),e=new se("^|","bitXor",[e,T()]);return e}function T(){for(var e=C();"&"==xe;)h(),e=new se("&","bitAnd",[e,C()]);return e}function C(){var e,t,r,n,i;for(e=S(),t={"==":"equal","!=":"unequal","<":"smaller",">":"larger","<=":"smallerEq",">=":"largerEq"};xe in t;)r=xe,n=t[r],h(),i=[e,S()],e=new se(r,n,i);return e}function S(){var e,t,r,n,i;for(e=z(),t={"<<":"leftShift",">>":"rightArithShift",">>>":"rightLogShift"};xe in t;)r=xe,n=t[r],h(),i=[e,z()],e=new se(r,n,i);return e}function z(){var e,t,r,n,i;for(e=B(),t={to:"to","in":"to"};xe in t;)r=xe,n=t[r],h(),"in"===r&&""===xe?e=new se("*","multiply",[e,new le("in")],!0):(i=[e,B()],e=new se(r,n,i));return e}function B(){var e,t=[];if(e=":"==xe?new ne("1","number"):k(),":"==xe&&Ne!==we){for(t.push(e);":"==xe&&t.length<3;)h(),")"==xe||"]"==xe||","==xe||""==xe?t.push(new le("end")):t.push(k());e=3==t.length?new fe(t[0],t[2],t[1]):new fe(t[0],t[1])}return e}function k(){var e,t,r,n,i;for(e=I(),t={"+":"add","-":"subtract"};xe in t;)r=xe,n=t[r],h(),i=[e,I()],e=new se(r,n,i);return e}function I(){var e,t,r,n,i;for(e=P(),t=e,r={"*":"multiply",".*":"dotMultiply","/":"divide","./":"dotDivide","%":"mod",mod:"mod"};;)if(xe in r)n=xe,i=r[n],h(),t=P(),e=new se(n,i,[e,t]);else{if(!(be==pe.SYMBOL||"in"==xe&&e&&e.isConstantNode||be==pe.NUMBER&&!t.isConstantNode||"("==xe))break;t=P(),e=new se("*","multiply",[e,t],!0)}return e}function P(){var e,t,r={"-":"unaryMinus","+":"unaryPlus","~":"bitNot",not:"not"}[xe];return r?(e=xe,h(),t=[P()],new se(e,r,t)):R()}function R(){var e,t,r,n;return e=U(),"^"!=xe&&".^"!=xe||(t=xe,r="^"==t?"pow":"dotPow",h(),n=[e,P()],e=new se(t,r,n)),e}function U(){var e,t,r,n,i;for(e=q(),t={"!":"factorial","'":"transpose"};xe in t;)r=xe,n=t[r],p(),i=[e],e=new se(r,n,i),e=j(e);return e}function q(){var e,t=[];if(be==pe.SYMBOL&&de[xe]){if(e=de[xe],p(),"("==xe){if(t=[],m(),p(),")"!=xe)for(t.push(w());","==xe;)p(),t.push(w());if(")"!=xe)throw X("Parenthesis ) expected");d(),p()}return new e(t)}return L()}function L(){var e,t;return be==pe.SYMBOL||be==pe.DELIMITER&&xe in me?(t=xe,p(),e=new le(t),e=j(e)):F()}function j(e,t){for(var r;!("("!=xe&&"["!=xe&&"."!=xe||t&&-1===t.indexOf(xe));)if(r=[],"("==xe){if(!e.isSymbolNode&&!e.isAccessorNode)return e;if(m(),p(),")"!=xe)for(r.push(w());","==xe;)p(),r.push(w());if(")"!=xe)throw X("Parenthesis ) expected");d(),p(),e=new ce(e,r)}else if("["==xe){if(m(),p(),"]"!=xe)for(r.push(w());","==xe;)p(),r.push(w());if("]"!=xe)throw X("Parenthesis ] expected");d(),p(),e=new Q(e,new oe(r))}else{if(p(),be!=pe.SYMBOL)throw X("Property name expected after dot");r.push(new ne(xe)),p();var n=!0;e=new Q(e,new oe(r,n))}return e}function F(){var e,t;return'"'==xe?(t=D(),e=new ne(t,"string"),e=j(e)):$()}function D(){for(var e="";""!=ye&&'"'!=ye;)"\\"==ye&&(e+=ye,c()),e+=ye,c();if(p(),'"'!=xe)throw X('End of string " expected');return p(),e}function $(){var e,t,r,n;if("["==xe){if(m(),p(),"]"!=xe){var i=G();if(";"==xe){for(r=1,t=[i];";"==xe;)p(),t[r]=G(),r++;if("]"!=xe)throw X("End of matrix ] expected");d(),p(),n=t[0].items.length;for(var o=1;r>o;o++)if(t[o].items.length!=n)throw J("Column dimensions mismatch ("+t[o].items.length+" != "+n+")");e=new K(t)}else{if("]"!=xe)throw X("End of matrix ] expected");d(),p(),e=i}}else d(),p(),e=new K([]);return j(e)}return H()}function G(){for(var e=[w()],t=1;","==xe;)p(),e[t]=w(),t++;return new K(e)}function H(){if("{"==xe){var e,t={};do if(p(),"}"!=xe){if('"'==xe)e=D();else{if(be!=pe.SYMBOL)throw X("Symbol or string expected as object key");e=xe,p()}if(":"!=xe)throw X("Colon : expected after object key");p(),t[e]=w()}while(","==xe);if("}"!=xe)throw X("Comma , or bracket } expected after object value");p();var r=new ae(t);return r=j(r)}return Z()}function Z(){var e;return be==pe.NUMBER?(e=xe,p(),new ne(e,"number")):V()}function V(){var e;if("("==xe){if(m(),p(),e=w(),")"!=xe)throw X("Parenthesis ) expected");return d(),p(),e=new ue(e),e=j(e)}return Y()}function Y(){throw X(""==xe?"Unexpected end of expression":"Value expected")}function W(){return ve-xe.length+1}function X(e){var t=W(),r=new SyntaxError(e+" (char "+t+")");return r["char"]=t,r}function J(e){var t=W(),r=new SyntaxError(e+" (char "+t+")");return r["char"]=t,r}var Q=n(r(280)),K=n(r(286)),ee=n(r(287)),te=n(r(290)),re=n(r(291)),ne=n(r(292)),ie=n(r(293)),oe=n(r(294)),ae=n(r(297)),se=n(r(298)),ue=n(r(300)),ce=n(r(299)),fe=n(r(295)),le=n(r(296)),pe={NULL:0,DELIMITER:1,NUMBER:2,SYMBOL:3,UNKNOWN:4},he={",":!0,"(":!0,")":!0,"[":!0,"]":!0,"{":!0,"}":!0,'"':!0,";":!0,"+":!0,"-":!0,"*":!0,".*":!0,"/":!0,"./":!0,"%":!0,"^":!0,".^":!0,"~":!0,"!":!0,"&":!0,"|":!0,"^|":!0,"'":!0,"=":!0,":":!0,"?":!0,"==":!0,"!=":!0,"<":!0,">":!0,"<=":!0,">=":!0,"<<":!0,">>":!0,">>>":!0},me={mod:!0,to:!0,"in":!0,and:!0,xor:!0,or:!0,not:!0},de={},ge="",ve=0,ye="",xe="",be=pe.NULL,we=0,Ne=null;return s}var i=r(11),o=r(19);t.name="parse",t.path="expression",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(!e||!e.isNode)throw new TypeError('Node expected for parameter "object"');if(!t||!t.isIndexNode)throw new TypeError('IndexNode expected for parameter "index"');this.object=e||null,this.index=t,Object.defineProperty(this,"name",{get:function(){return this.index?this.index.isObjectProperty()?this.index.getObjectProperty():"":this.object.name||""}.bind(this),set:function(){throw new Error("Cannot assign a new name, name is read-only")}})}function a(e){return!(e.isAccessorNode||e.isArrayNode||e.isConstantNode||e.isFunctionNode||e.isObjectNode||e.isParenthesisNode||e.isSymbolNode)}var s=n(r(281)),u=n(r(283));return o.prototype=new s,o.prototype.type="AccessorNode",o.prototype.isAccessorNode=!0,o.prototype._compile=function(e,t){e.access=u;var r=this.object._compile(e,t),n=this.index._compile(e,t);return this.index.isObjectProperty()?r+'["'+this.index.getObjectProperty()+'"]':this.index.needsSize()?"(function () {  var object = "+r+";  var size = math.size(object).valueOf();  return access(object, "+n+");})()":"access("+r+", "+n+")"},o.prototype.forEach=function(e){e(this.object,"object",this),e(this.index,"index",this)},o.prototype.map=function(e){return new o(this._ifNode(e(this.object,"object",this)),this._ifNode(e(this.index,"index",this)))},o.prototype.clone=function(){return new o(this.object,this.index)},o.prototype._toString=function(e){var t=this.object.toString(e);return a(this.object)&&(t="("+t+")"),t+this.index.toString(e)},o.prototype._toTex=function(e){var t=this.object.toTex(e);return a(this.object)&&(t="\\left("+t+"\\right)"),t+this.index.toTex(e)},o}t.name="AccessorNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n,o){function a(){if(!(this instanceof a))throw new SyntaxError("Constructor must be called with the new operator")}function s(e){for(var t in e)if(e.hasOwnProperty(t)&&t in i)throw new Error('Scope contains an illegal symbol, "'+t+'" is a reserved keyword')}return a.prototype.eval=function(e){return this.compile().eval(e)},a.prototype.type="Node",a.prototype.isNode=!0,a.prototype.compile=function(){if(arguments.length>0)throw new Error("Calling compile(math) is deprecated. Call the function as compile() instead.");var e={math:o.expression.transform,args:{},_validateScope:s},t={},r=this._compile(e,t),n=Object.keys(e).map(function(e){return"    var "+e+' = defs["'+e+'"];'}),i=n.join(" ")+'return {  "eval": function (scope) {    if (scope) _validateScope(scope);    scope = scope || {};    return '+r+";  }};",a=new Function("defs",i);return a(e)},a.prototype._compile=function(e,t){throw new Error("Cannot compile a Node interface")},a.prototype.forEach=function(e){throw new Error("Cannot run forEach on a Node interface")},a.prototype.map=function(e){throw new Error("Cannot run map on a Node interface")},a.prototype._ifNode=function(e){if(!e||!e.isNode)throw new TypeError("Callback function must return a Node");return e},a.prototype.traverse=function(e){function t(e,r){e.forEach(function(e,n,i){r(e,n,i),t(e,r)})}e(this,null,null),t(this,e)},a.prototype.transform=function(e){function t(e,r){return e.map(function(e,n,i){var o=r(e,n,i);return t(o,r)})}var r=e(this,null,null);return t(r,e)},a.prototype.filter=function(e){var t=[];return this.traverse(function(r,n,i){
e(r,n,i)&&t.push(r)}),t},a.prototype.find=function(){throw new Error("Function Node.find is deprecated. Use Node.filter instead.")},a.prototype.match=function(){throw new Error("Function Node.match is deprecated. See functions Node.filter, Node.transform, Node.traverse.")},a.prototype.clone=function(){throw new Error("Cannot clone a Node interface")},a.prototype.toString=function(e){var t;if(e&&"object"==typeof e)switch(typeof e.handler){case"object":case"undefined":break;case"function":t=e.handler(this,e);break;default:throw new TypeError("Object or function expected as callback")}return"undefined"!=typeof t?t:this._toString(e)},a.prototype._toString=function(){throw new Error("_toString not implemented for "+this.type)},a.prototype.toTex=function(e){var t;if(e&&"object"==typeof e)switch(typeof e.handler){case"object":case"undefined":break;case"function":t=e.handler(this,e);break;default:throw new TypeError("Object or function expected as callback")}return"undefined"!=typeof t?t:this._toTex(e)},a.prototype._toTex=function(e){throw new Error("_toTex not implemented for "+this.type)},a.prototype.getIdentifier=function(){return this.type},a.prototype.getContent=function(){return this},a}var i=r(282);r(3).extend;t.name="Node",t.path="expression.node",t.math=!0,t.factory=n},function(e,t){"use strict";e.exports={end:!0}},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(285)),s=n(r(52));return function(e,t){try{if(Array.isArray(e))return s(e).subset(t).valueOf();if(e&&"function"==typeof e.subset)return e.subset(t);if("string"==typeof e)return a(e,t);if("object"==typeof e){if(!t.isObjectProperty())throw TypeError("Cannot apply a numeric index as object property");return e[t.getObjectProperty()]}throw new TypeError("Cannot apply index: unsupported type of object")}catch(r){throw i(r)}}}var i=r(284).transform;t.factory=n},function(e,t,r){var n=r(43);t.transform=function(e){return e&&e.isIndexError?new n(e.index+1,e.min+1,void 0!==e.max?e.max+1:void 0):e}},function(e,t,r){"use strict";function n(e,t,n,c){function f(e,t){if(!t||t.isIndex!==!0)throw new TypeError("Index expected");if(1!=t.size().length)throw new u(t.size().length,1);var r=e.length;s(t.min()[0],r),s(t.max()[0],r);var n=t.dimension(0),i="";return n.forEach(function(t){i+=e.charAt(t)}),i}function l(e,t,r,n){if(!t||t.isIndex!==!0)throw new TypeError("Index expected");if(1!=t.size().length)throw new u(t.size().length,1);if(void 0!==n){if("string"!=typeof n||1!==n.length)throw new TypeError("Single character expected as defaultValue")}else n=" ";var i=t.dimension(0),o=i.size()[0];if(o!=r.length)throw new u(i.size()[0],r.length);var a=e.length;s(t.min()[0]),s(t.max()[0]);for(var c=[],f=0;a>f;f++)c[f]=e.charAt(f);if(i.forEach(function(e,t){c[e]=r.charAt(t[0])}),c.length>a)for(f=a-1,o=c.length;o>f;f++)c[f]||(c[f]=n);return c.join("")}var p=n(r(52)),h=c("subset",{"Array, Index":function(e,t){var r=p(e),n=r.subset(t);return n&&n.valueOf()},"Matrix, Index":function(e,t){return e.subset(t)},"Object, Index":i,"string, Index":f,"Array, Index, any":function(e,t,r){return p(a(e)).subset(t,r,void 0).valueOf()},"Array, Index, any, any":function(e,t,r,n){return p(a(e)).subset(t,r,n).valueOf()},"Matrix, Index, any":function(e,t,r){return e.clone().subset(t,r)},"Matrix, Index, any, any":function(e,t,r,n){return e.clone().subset(t,r,n)},"string, Index, string":l,"string, Index, string, string":l,"Object, Index, any":o});return h.toTex=void 0,h}function i(e,t){if(1!==t.size().length)throw new u(t.size(),1);var r=t.dimension(0);if("string"!=typeof r)throw new TypeError("String expected as index to retrieve an object property");return e[r]}function o(e,t,r){if(1!==t.size().length)throw new u(t.size(),1);var n=t.dimension(0);if("string"!=typeof n)throw new TypeError("String expected as index to retrieve an object property");var i=a(e);return i[n]=r,i}var a=r(3).clone,s=r(40).validateIndex,u=r(42);t.name="subset",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(this.items=e||[],!Array.isArray(this.items)||!this.items.every(function(e){return e&&e.isNode}))throw new TypeError("Array containing Nodes expected");var t=function(){throw new Error("Property `ArrayNode.nodes` is deprecated, use `ArrayNode.items` instead")};Object.defineProperty(this,"nodes",{get:t,set:t})}var a=n(r(281));return o.prototype=new a,o.prototype.type="ArrayNode",o.prototype.isArrayNode=!0,o.prototype._compile=function(e,t){var r="Array"!==e.math.config().matrix,n=this.items.map(function(r){return r._compile(e,t)});return(r?"math.matrix([":"[")+n.join(",")+(r?"])":"]")},o.prototype.forEach=function(e){for(var t=0;t<this.items.length;t++){var r=this.items[t];e(r,"items["+t+"]",this)}},o.prototype.map=function(e){for(var t=[],r=0;r<this.items.length;r++)t[r]=this._ifNode(e(this.items[r],"items["+r+"]",this));return new o(t)},o.prototype.clone=function(){return new o(this.items.slice(0))},o.prototype._toString=function(e){var t=this.items.map(function(t){return t.toString(e)});return"["+t.join(", ")+"]"},o.prototype._toTex=function(e){var t="\\begin{bmatrix}";return this.items.forEach(function(r){t+=r.items?r.items.map(function(t){return t.toTex(e)}).join("&"):r.toTex(e),t+="\\\\"}),t+="\\end{bmatrix}"},o}t.name="ArrayNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t,r){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(this.object=e,this.index=r?t:null,this.value=r?r:t,!e||!e.isSymbolNode&&!e.isAccessorNode)throw new TypeError('SymbolNode or AccessorNode expected as "object"');if(e&&e.isSymbolNode&&"end"===e.name)throw new Error('Cannot assign to symbol "end"');if(this.index&&!this.index.isIndexNode)throw new TypeError('IndexNode expected as "index"');if(!this.value||!this.value.isNode)throw new TypeError('Node expected as "value"');Object.defineProperty(this,"name",{get:function(){return this.index?this.index.isObjectProperty()?this.index.getObjectProperty():"":this.object.name||""}.bind(this),set:function(){throw new Error("Cannot assign a new name, name is read-only")}})}function a(e,t){t||(t="keep");var r=f.getPrecedence(e,t),n=f.getPrecedence(e.value,t);return"all"===t||null!==n&&r>=n}var s=n(r(281)),u=(n(r(286)),n(r(52)),n(r(288))),c=n(r(283)),f=(r(282),r(289));return o.prototype=new s,o.prototype.type="AssignmentNode",o.prototype.isAssignmentNode=!0,o.prototype._compile=function(e,t){e.assign=u,e.access=c;var r,n=this.object._compile(e,t),i=this.index?this.index._compile(e,t):null,o=this.value._compile(e,t);if(this.index){if(this.index.isObjectProperty())return n+'["'+this.index.getObjectProperty()+'"] = '+o;if(this.object.isSymbolNode)return r=this.index.needsSize()?"var size = math.size(object).valueOf();":"","(function () {  var object = "+n+";  var value = "+o+";  "+r+'  scope["'+this.object.name+'"] = assign(object, '+i+", value);  return value;})()";r=this.index.needsSize()?"var size = math.size(object).valueOf();":"";var a=this.object.object._compile(e,t);if(this.object.index.isObjectProperty()){var s='["'+this.object.index.getObjectProperty()+'"]';return"(function () {  var parent = "+a+";  var object = parent"+s+";  var value = "+o+";"+r+"  parent"+s+" = assign(object, "+i+", value);  return value;})()"}var f=this.object.index.needsSize()?"var size = math.size(parent).valueOf();":"",l=this.object.index._compile(e,t);return"(function () {  var parent = "+a+";  "+f+"  var parentIndex = "+l+";  var object = access(parent, parentIndex);  var value = "+o+";  "+r+"  assign(parent, parentIndex, assign(object, "+i+", value));  return value;})()"}if(!this.object.isSymbolNode)throw new TypeError("SymbolNode expected as object");return'scope["'+this.object.name+'"] = '+o},o.prototype.forEach=function(e){e(this.object,"object",this),this.index&&e(this.index,"index",this),e(this.value,"value",this)},o.prototype.map=function(e){var t=this._ifNode(e(this.object,"object",this)),r=this.index?this._ifNode(e(this.index,"index",this)):null,n=this._ifNode(e(this.value,"value",this));return new o(t,r,n)},o.prototype.clone=function(){return new o(this.object,this.index,this.value)},o.prototype._toString=function(e){var t=this.object.toString(e),r=this.index?this.index.toString(e):"",n=this.value.toString(e);return a(this,e&&e.parenthesis)&&(n="("+n+")"),t+r+" = "+n},o.prototype._toTex=function(e){var t=this.object.toTex(e),r=this.index?this.index.toTex(e):"",n=this.value.toTex(e);return a(this,e&&e.parenthesis)&&(n="\\left("+n+"\\right)"),t+r+":="+n},o}r(32);t.name="AssignmentNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(285)),s=n(r(52));return function(e,t,r){try{if(Array.isArray(e))return s(e).subset(t,r).valueOf();if(e&&"function"==typeof e.subset)return e.subset(t,r);if("string"==typeof e)return a(e,t,r);if("object"==typeof e){if(!t.isObjectProperty())throw TypeError("Cannot apply a numeric index as object property");return e[t.getObjectProperty()]=r,e}throw new TypeError("Cannot apply index: unsupported type of object")}catch(n){throw i(n)}}}var i=r(284).transform;t.factory=n},function(e,t){"use strict";function r(e,t){var r=e;"keep"!==t&&(r=e.getContent());for(var n=r.getIdentifier(),i=0;i<o.length;i++)if(n in o[i])return i;return null}function n(e,t){var n=e;"keep"!==t&&(n=e.getContent());var i=n.getIdentifier(),a=r(n,t);if(null===a)return null;var s=o[a][i];if(s.hasOwnProperty("associativity")){if("left"===s.associativity)return"left";if("right"===s.associativity)return"right";throw Error("'"+i+"' has the invalid associativity '"+s.associativity+"'.")}return null}function i(e,t,n){var i=e,a=t;if("keep"!==n)var i=e.getContent(),a=t.getContent();var s=i.getIdentifier(),u=a.getIdentifier(),c=r(i,n);if(null===c)return null;var f=o[c][s];if(f.hasOwnProperty("associativeWith")&&f.associativeWith instanceof Array){for(var l=0;l<f.associativeWith.length;l++)if(f.associativeWith[l]===u)return!0;return!1}return null}var o=[{AssignmentNode:{},FunctionAssignmentNode:{}},{ConditionalNode:{latexLeftParens:!1,latexRightParens:!1,latexParens:!1}},{"OperatorNode:or":{associativity:"left",associativeWith:[]}},{"OperatorNode:xor":{associativity:"left",associativeWith:[]}},{"OperatorNode:and":{associativity:"left",associativeWith:[]}},{"OperatorNode:bitOr":{associativity:"left",associativeWith:[]}},{"OperatorNode:bitXor":{associativity:"left",associativeWith:[]}},{"OperatorNode:bitAnd":{associativity:"left",associativeWith:[]}},{"OperatorNode:equal":{associativity:"left",associativeWith:[]},"OperatorNode:unequal":{associativity:"left",associativeWith:[]},"OperatorNode:smaller":{associativity:"left",associativeWith:[]},"OperatorNode:larger":{associativity:"left",associativeWith:[]},"OperatorNode:smallerEq":{associativity:"left",associativeWith:[]},"OperatorNode:largerEq":{associativity:"left",associativeWith:[]}},{"OperatorNode:leftShift":{associativity:"left",associativeWith:[]},"OperatorNode:rightArithShift":{associativity:"left",associativeWith:[]},"OperatorNode:rightLogShift":{associativity:"left",associativeWith:[]}},{"OperatorNode:to":{associativity:"left",associativeWith:[]}},{RangeNode:{}},{"OperatorNode:add":{associativity:"left",associativeWith:["OperatorNode:add","OperatorNode:subtract"]},"OperatorNode:subtract":{associativity:"left",associativeWith:[]}},{"OperatorNode:multiply":{associativity:"left",associativeWith:["OperatorNode:multiply","OperatorNode:divide","Operator:dotMultiply","Operator:dotDivide"]},"OperatorNode:divide":{associativity:"left",associativeWith:[],latexLeftParens:!1,latexRightParens:!1,latexParens:!1},"OperatorNode:dotMultiply":{associativity:"left",associativeWith:["OperatorNode:multiply","OperatorNode:divide","OperatorNode:dotMultiply","OperatorNode:doDivide"]},"OperatorNode:dotDivide":{associativity:"left",associativeWith:[]},"OperatorNode:mod":{associativity:"left",associativeWith:[]}},{"OperatorNode:unaryPlus":{associativity:"right"},"OperatorNode:unaryMinus":{associativity:"right"},"OperatorNode:bitNot":{associativity:"right"},"OperatorNode:not":{associativity:"right"}},{"OperatorNode:pow":{associativity:"right",associativeWith:[],latexRightParens:!1},"OperatorNode:dotPow":{associativity:"right",associativeWith:[]}},{"OperatorNode:factorial":{associativity:"left"}},{"OperatorNode:transpose":{associativity:"left"}}];e.exports.properties=o,e.exports.getPrecedence=r,e.exports.getAssociativity=n,e.exports.isAssociativeWith=i},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(!Array.isArray(e))throw new Error("Array expected");this.blocks=e.map(function(e){var t=e&&e.node,r=e&&void 0!==e.visible?e.visible:!0;if(!t||!t.isNode)throw new TypeError('Property "node" must be a Node');if("boolean"!=typeof r)throw new TypeError('Property "visible" must be a boolean');return{node:t,visible:r}})}var a=n(r(281)),s=n(r(72));return o.prototype=new a,o.prototype.type="BlockNode",o.prototype.isBlockNode=!0,o.prototype._compile=function(e,t){e.ResultSet=s;var r=this.blocks.map(function(r){var n=r.node._compile(e,t);return r.visible?"results.push("+n+");":n+";"});return"(function () {var results = [];"+r.join("")+"return new ResultSet(results);})()"},o.prototype.forEach=function(e){for(var t=0;t<this.blocks.length;t++)e(this.blocks[t].node,"blocks["+t+"].node",this)},o.prototype.map=function(e){for(var t=[],r=0;r<this.blocks.length;r++){var n=this.blocks[r],i=this._ifNode(e(n.node,"blocks["+r+"].node",this));t[r]={node:i,visible:n.visible}}return new o(t)},o.prototype.clone=function(){var e=this.blocks.map(function(e){return{node:e.node,visible:e.visible}});return new o(e)},o.prototype._toString=function(e){return this.blocks.map(function(t){return t.node.toString(e)+(t.visible?"":";")}).join("\n")},o.prototype._toTex=function(e){return this.blocks.map(function(t){return t.node.toTex(e)+(t.visible?"":";")}).join("\\;\\;\n")},o}t.name="BlockNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t,r){if(!(this instanceof a))throw new SyntaxError("Constructor must be called with the new operator");if(!e||!e.isNode)throw new TypeError("Parameter condition must be a Node");if(!t||!t.isNode)throw new TypeError("Parameter trueExpr must be a Node");if(!r||!r.isNode)throw new TypeError("Parameter falseExpr must be a Node");this.condition=e,this.trueExpr=t,this.falseExpr=r}var s=n(r(281));return a.prototype=new s,a.prototype.type="ConditionalNode",a.prototype.isConditionalNode=!0,a.prototype._compile=function(e,t){return e.testCondition=function(t){if("number"==typeof t||"boolean"==typeof t||"string"==typeof t)return!!t;if(t){if(t.isBigNumber===!0)return!t.isZero();if(t.isComplex===!0)return!(!t.re&&!t.im);if(t.isUnit===!0)return!!t.value}if(null===t||void 0===t)return!1;throw new TypeError('Unsupported type of condition "'+e.math["typeof"](t)+'"')},"testCondition("+this.condition._compile(e,t)+") ? ( "+this.trueExpr._compile(e,t)+") : ( "+this.falseExpr._compile(e,t)+")"},a.prototype.forEach=function(e){e(this.condition,"condition",this),e(this.trueExpr,"trueExpr",this),e(this.falseExpr,"falseExpr",this)},a.prototype.map=function(e){return new a(this._ifNode(e(this.condition,"condition",this)),this._ifNode(e(this.trueExpr,"trueExpr",this)),this._ifNode(e(this.falseExpr,"falseExpr",this)))},a.prototype.clone=function(){return new a(this.condition,this.trueExpr,this.falseExpr)},a.prototype._toString=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=i.getPrecedence(this,t),n=this.condition.toString(e),o=i.getPrecedence(this.condition,t);("all"===t||"OperatorNode"===this.condition.type||null!==o&&r>=o)&&(n="("+n+")");var a=this.trueExpr.toString(e),s=i.getPrecedence(this.trueExpr,t);("all"===t||"OperatorNode"===this.trueExpr.type||null!==s&&r>=s)&&(a="("+a+")");var u=this.falseExpr.toString(e),c=i.getPrecedence(this.falseExpr,t);return("all"===t||"OperatorNode"===this.falseExpr.type||null!==c&&r>=c)&&(u="("+u+")"),n+" ? "+a+" : "+u},a.prototype._toTex=function(e){return"\\begin{cases} {"+this.trueExpr.toTex(e)+"}, &\\quad{\\text{if }\\;"+this.condition.toTex(e)+"}\\\\{"+this.falseExpr.toTex(e)+"}, &\\quad{\\text{otherwise}}\\end{cases}"},a}var i=(r(32),r(289));t.name="ConditionalNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t){if(!(this instanceof a))throw new SyntaxError("Constructor must be called with the new operator");if(t){if("string"!=typeof t)throw new TypeError('String expected for parameter "valueType"');if("string"!=typeof e)throw new TypeError('String expected for parameter "value"');this.value=e,this.valueType=t}else this.value=e+"",this.valueType=i(e);if(!u[this.valueType])throw new TypeError('Unsupported type of value "'+this.valueType+'"')}var s=n(r(281)),u={number:!0,string:!0,"boolean":!0,undefined:!0,"null":!0};return a.prototype=new s,a.prototype.type="ConstantNode",a.prototype.isConstantNode=!0,a.prototype._compile=function(e,t){switch(this.valueType){case"number":var r=e.math.config().number;return"BigNumber"===r?'math.bignumber("'+this.value+'")':"Fraction"===r?'math.fraction("'+this.value+'")':this.value.replace(/^(0*)[0-9]/,function(e,t){return e.substring(t.length)});case"string":return'"'+this.value+'"';case"boolean":return this.value;case"undefined":return this.value;case"null":return this.value;default:throw new TypeError('Unsupported type of constant "'+this.valueType+'"')}},a.prototype.forEach=function(e){},a.prototype.map=function(e){return this.clone()},a.prototype.clone=function(){return new a(this.value,this.valueType)},a.prototype._toString=function(e){switch(this.valueType){case"string":return'"'+this.value+'"';default:return this.value}},a.prototype._toTex=function(e){var t,r=this.value;switch(this.valueType){case"string":return'\\mathtt{"'+r+'"}';case"number":return t=r.toLowerCase().indexOf("e"),-1!==t?r.substring(0,t)+"\\cdot10^{"+r.substring(t+1)+"}":r;default:return r}},a}var i=r(41).type;t.name="ConstantNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,s){function u(e,t,r){if(!(this instanceof u))throw new SyntaxError("Constructor must be called with the new operator");if("string"!=typeof e)throw new TypeError('String expected for parameter "name"');if(!Array.isArray(t))throw new TypeError('Array containing strings or objects expected for parameter "params"');if(!r||!r.isNode)throw new TypeError('Node expected for parameter "expr"');if(e in i)throw new Error('Illegal function name, "'+e+'" is a reserved keyword');this.name=e,this.params=t.map(function(e){return e&&e.name||e}),this.types=t.map(function(e){return e&&e.type||"any"}),this.expr=r}function c(e,t){var r=a.getPrecedence(e,t),n=a.getPrecedence(e.expr,t);return"all"===t||null!==n&&r>=n}var f=n(r(281));return u.prototype=new f,u.prototype.type="FunctionAssignmentNode",u.prototype.isFunctionAssignmentNode=!0,u.prototype._compile=function(e,t){e.typed=s;var r=Object.create(t);this.params.forEach(function(e){r[e]=!0});var n=this.expr._compile(e,r);return'scope["'+this.name+'"] =   (function () {    var fn = typed("'+this.name+'", {      "'+this.types.join(",")+'": function ('+this.params.join(",")+") {        return "+n+'      }    });    fn.syntax = "'+this.name+"("+this.params.join(", ")+')";    return fn;  })()'},u.prototype.forEach=function(e){e(this.expr,"expr",this)},u.prototype.map=function(e){var t=this._ifNode(e(this.expr,"expr",this));return new u(this.name,this.params.slice(0),t)},u.prototype.clone=function(){return new u(this.name,this.params.slice(0),this.expr)},u.prototype._toString=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=this.expr.toString(e);return c(this,t)&&(r="("+r+")"),"function "+this.name+"("+this.params.join(", ")+") = "+r},u.prototype._toTex=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=this.expr.toTex(e);return c(this,t)&&(r="\\left("+r+"\\right)"),"\\mathrm{"+this.name+"}\\left("+this.params.map(o.toSymbol).join(",")+"\\right):="+r},u}var i=r(282),o=r(32),a=r(289);t.name="FunctionAssignmentNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(this.dimensions=e,this.dotNotation=t||!1,!u(e)||!e.every(function(e){return e&&e.isNode}))throw new TypeError('Array containing Nodes expected for parameter "dimensions"');if(this.dotNotation&&!this.isObjectProperty())throw new Error("dotNotation only applicable for object properties");var r=function(){throw new Error("Property `IndexNode.object` is deprecated, use `IndexNode.fn` instead")};Object.defineProperty(this,"object",{get:r,set:r})}var a=n(r(281)),s=(n(r(295)),n(r(296)),n(r(67))),u=Array.isArray;return o.prototype=new a,o.prototype.type="IndexNode",o.prototype.isIndexNode=!0,o.prototype._compile=function(e,t){var r=Object.create(t);e.range=function(e,t,r){return new s(e&&e.isBigNumber===!0?e.toNumber():e,t&&t.isBigNumber===!0?t.toNumber():t,r&&r.isBigNumber===!0?r.toNumber():r)};var n=this.dimensions.map(function(t,n){return t&&t.isRangeNode?t.needsEnd()?(r.end=!0,"(function () {var end = size["+n+"]; return range("+t.start._compile(e,r)+", "+t.end._compile(e,r)+", "+(t.step?t.step._compile(e,r):"1")+"); })()"):"range("+t.start._compile(e,r)+", "+t.end._compile(e,r)+", "+(t.step?t.step._compile(e,r):"1")+")":t.isSymbolNode&&"end"===t.name?(r.end=!0,"(function () {var end = size["+n+"]; return "+t._compile(e,r)+"; })()"):t._compile(e,r)});return"math.index("+n.join(", ")+")"},o.prototype.forEach=function(e){for(var t=0;t<this.dimensions.length;t++)e(this.dimensions[t],"dimensions["+t+"]",this)},o.prototype.map=function(e){for(var t=[],r=0;r<this.dimensions.length;r++)t[r]=this._ifNode(e(this.dimensions[r],"dimensions["+r+"]",this));return new o(t)},o.prototype.clone=function(){return new o(this.dimensions.slice(0))},o.prototype.isObjectProperty=function(){return 1===this.dimensions.length&&this.dimensions[0].isConstantNode&&"string"===this.dimensions[0].valueType},o.prototype.getObjectProperty=function(){return this.isObjectProperty()?this.dimensions[0].value:null},o.prototype._toString=function(e){return this.dotNotation?"."+this.getObjectProperty():"["+this.dimensions.join(", ")+"]"},o.prototype._toTex=function(e){var t=this.dimensions.map(function(t){return t.toTex(e)});return this.dotNotation?"."+this.getObjectProperty():"_{"+t.join(",")+"}"},o.prototype.needsSize=function(){return this.dimensions.some(function(e){return e.isRangeNode&&e.needsEnd()||e.isSymbolNode&&"end"===e.name})},o}t.name="IndexNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t,r){if(!(this instanceof a))throw new SyntaxError("Constructor must be called with the new operator");if(!e||!e.isNode)throw new TypeError("Node expected");if(!t||!t.isNode)throw new TypeError("Node expected");if(r&&(!r||!r.isNode))throw new TypeError("Node expected");if(arguments.length>3)throw new Error("Too many arguments");this.start=e,this.end=t,this.step=r||null}function s(e,t){var r=i.getPrecedence(e,t),n={},o=i.getPrecedence(e.start,t);if(n.start=null!==o&&r>=o||"all"===t,e.step){var a=i.getPrecedence(e.step,t);n.step=null!==a&&r>=a||"all"===t}var s=i.getPrecedence(e.end,t);return n.end=null!==s&&r>=s||"all"===t,n}var u=n(r(281));return a.prototype=new u,a.prototype.type="RangeNode",a.prototype.isRangeNode=!0,a.prototype.needsEnd=function(){var e=this.filter(function(e){return e&&e.isSymbolNode&&"end"==e.name});return e.length>0},a.prototype._compile=function(e,t){return"math.range("+this.start._compile(e,t)+", "+this.end._compile(e,t)+(this.step?", "+this.step._compile(e,t):"")+")"},a.prototype.forEach=function(e){e(this.start,"start",this),e(this.end,"end",this),this.step&&e(this.step,"step",this)},a.prototype.map=function(e){return new a(this._ifNode(e(this.start,"start",this)),this._ifNode(e(this.end,"end",this)),this.step&&this._ifNode(e(this.step,"step",this)))},a.prototype.clone=function(){return new a(this.start,this.end,this.step&&this.step)},a.prototype._toString=function(e){var t,r=e&&e.parenthesis?e.parenthesis:"keep",n=s(this,r),i=this.start.toString(e);if(n.start&&(i="("+i+")"),t=i,this.step){var o=this.step.toString(e);n.step&&(o="("+o+")"),t+=":"+o}var a=this.end.toString(e);return n.end&&(a="("+a+")"),t+=":"+a},a.prototype._toTex=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=s(this,t),n=this.start.toTex(e);if(r.start&&(n="\\left("+n+"\\right)"),this.step){var i=this.step.toTex(e);r.step&&(i="\\left("+i+"\\right)"),n+=":"+i}var o=this.end.toTex(e);return r.end&&(o="\\left("+o+"\\right)"),n+=":"+o},a}var i=r(289);t.name="RangeNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o,a){function s(e){if(!(this instanceof s))throw new SyntaxError("Constructor must be called with the new operator");if("string"!=typeof e)throw new TypeError('String expected for parameter "name"');this.name=e}function u(e){throw new Error("Undefined symbol "+e)}var c=n(r(281)),f=n(r(75));return s.prototype=new c,s.prototype.type="SymbolNode",s.prototype.isSymbolNode=!0,s.prototype._compile=function(e,t){return e.undef=u,e.Unit=f,t[this.name]?this.name:this.name in e.math?'("'+this.name+'" in scope ? scope["'+this.name+'"] : math["'+this.name+'"])':'("'+this.name+'" in scope ? scope["'+this.name+'"] : '+(f.isValuelessUnit(this.name)?'new Unit(null, "'+this.name+'")':'undef("'+this.name+'")')+")"},s.prototype.forEach=function(e){},s.prototype.map=function(e){return this.clone()},s.prototype.clone=function(){return new s(this.name)},s.prototype._toString=function(e){return this.name},s.prototype._toTex=function(e){var t=!1;"undefined"==typeof a[this.name]&&f.isValuelessUnit(this.name)&&(t=!0);var r=i.toSymbol(this.name,t);return"\\"===r[0]?r:" "+r},s}var i=r(32);t.name="SymbolNode",t.path="expression.node",t.math=!0,t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(this.properties=e||{},e&&("object"!=typeof e||Object.keys(e).some(function(t){return!e[t]||!e[t].isNode})))throw new TypeError("Object containing Nodes expected")}var a=n(r(281));return o.prototype=new a,o.prototype.type="ObjectNode",o.prototype.isObjectNode=!0,o.prototype._compile=function(e,t){var r=[];for(var n in this.properties)this.properties.hasOwnProperty(n)&&r.push('"'+n+'": '+this.properties[n]._compile(e,t));return"{"+r.join(", ")+"}"},o.prototype.forEach=function(e){for(var t in this.properties)this.properties.hasOwnProperty(t)&&e(this.properties[t],'properties["'+t+'"]',this)},o.prototype.map=function(e){var t={};for(var r in this.properties)this.properties.hasOwnProperty(r)&&(t[r]=this._ifNode(e(this.properties[r],'properties["'+r+'"]',this)));return new o(t)},o.prototype.clone=function(){var e={};for(var t in this.properties)this.properties.hasOwnProperty(t)&&(e[t]=this.properties[t]);return new o(e)},o.prototype._toString=function(e){var t=[];for(var r in this.properties)this.properties.hasOwnProperty(r)&&t.push('"'+r+'": '+this.properties[r].toString(e));return"{"+t.join(", ")+"}"},o.prototype._toTex=function(e){var t=[];for(var r in this.properties)this.properties.hasOwnProperty(r)&&t.push("\\mathbf{"+r+":} & "+this.properties[r].toTex(e)+"\\\\");return"\\left\\{\\begin{array}{ll}"+t.join("\n")+"\\end{array}\\right\\}"},o}r(23);t.name="ObjectNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a,s){function u(e,t,r,n){if(!(this instanceof u))throw new SyntaxError("Constructor must be called with the new operator");if("string"!=typeof e)throw new TypeError('string expected for parameter "op"');if("string"!=typeof t)throw new TypeError('string expected for parameter "fn"');if(!Array.isArray(r)||!r.every(function(e){return e&&e.isNode}))throw new TypeError('Array containing Nodes expected for parameter "args"');this.implicit=n===!0,this.op=e,this.fn=t,this.args=r||[]}function c(e,t,r,n){var i=o.getPrecedence(e,t),a=o.getAssociativity(e,t);if("all"===t||r.length>2){var s=[];return r.forEach(function(e){switch(e.getContent().type){case"ArrayNode":case"ConstantNode":case"SymbolNode":case"ParenthesisNode":s.push(!1);break;default:s.push(!0)}}),s}switch(r.length){case 0:return[];case 1:var u=o.getPrecedence(r[0],t);if(n&&null!==u){var c,f;if("keep"===t?(c=r[0].getIdentifier(),f=e.getIdentifier()):(c=r[0].getContent().getIdentifier(),f=e.getContent().getIdentifier()),o.properties[i][f].latexLeftParens===!1)return[!1];if(o.properties[u][c].latexParens===!1)return[!1]}return null===u?[!1]:i>=u?[!0]:[!1];case 2:var l,p=o.getPrecedence(r[0],t),h=o.isAssociativeWith(e,r[0],t);l=null===p?!1:p!==i||"right"!==a||h?i>p:!0;var m,d=o.getPrecedence(r[1],t),g=o.isAssociativeWith(e,r[1],t);if(m=null===d?!1:d!==i||"left"!==a||g?i>d:!0,n){var f,v,y;"keep"===t?(f=e.getIdentifier(),v=e.args[0].getIdentifier(),y=e.args[1].getIdentifier()):(f=e.getContent().getIdentifier(),v=e.args[0].getContent().getIdentifier(),y=e.args[1].getContent().getIdentifier()),null!==p&&(o.properties[i][f].latexLeftParens===!1&&(l=!1),o.properties[p][v].latexParens===!1&&(l=!1)),null!==d&&(o.properties[i][f].latexRightParens===!1&&(m=!1),o.properties[d][y].latexParens===!1&&(m=!1))}return[l,m]}}var f=n(r(281));n(r(292)),n(r(296)),n(r(299));return u.prototype=new f,u.prototype.type="OperatorNode",u.prototype.isOperatorNode=!0,u.prototype._compile=function(e,t){if(!e.math[this.fn])throw new Error("Function "+this.fn+' missing in provided namespace "math"');var r=this.args.map(function(r){return r._compile(e,t)});return"math."+this.fn+"("+r.join(", ")+")"},u.prototype.forEach=function(e){for(var t=0;t<this.args.length;t++)e(this.args[t],"args["+t+"]",this)},u.prototype.map=function(e){for(var t=[],r=0;r<this.args.length;r++)t[r]=this._ifNode(e(this.args[r],"args["+r+"]",this));return new u(this.op,this.fn,t)},u.prototype.clone=function(){return new u(this.op,this.fn,this.args.slice(0))},u.prototype._toString=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=e&&e.implicit?e.implicit:"hide",n=this.args,i=c(this,t,n,!1);switch(n.length){case 1:var a=o.getAssociativity(this,t),s=n[0].toString(e);return i[0]&&(s="("+s+")"),"right"===a?this.op+s:"left"===a?s+this.op:s+this.op;case 2:var u=n[0].toString(e),f=n[1].toString(e);return i[0]&&(u="("+u+")"),i[1]&&(f="("+f+")"),this.implicit&&"OperatorNode:multiply"===this.getIdentifier()&&"hide"==r?u+" "+f:u+" "+this.op+" "+f;default:return this.fn+"("+this.args.join(", ")+")"}},u.prototype._toTex=function(e){var t=e&&e.parenthesis?e.parenthesis:"keep",r=e&&e.implicit?e.implicit:"hide",n=this.args,a=c(this,t,n,!0),s=i.operators[this.fn];switch(s="undefined"==typeof s?this.op:s,n.length){case 1:var u=o.getAssociativity(this,t),f=n[0].toTex(e);return a[0]&&(f="\\left("+f+"\\right)"),"right"===u?s+f:"left"===u?f+s:f+s;case 2:var l=n[0],p=l.toTex(e);a[0]&&(p="\\left("+p+"\\right)");var h=n[1],m=h.toTex(e);a[1]&&(m="\\left("+m+"\\right)");var d;switch(d="keep"===t?l.getIdentifier():l.getContent().getIdentifier(),this.getIdentifier()){case"OperatorNode:divide":return s+"{"+p+"}{"+m+"}";case"OperatorNode:pow":switch(p="{"+p+"}",m="{"+m+"}",d){case"ConditionalNode":case"OperatorNode:divide":p="\\left("+p+"\\right)"}case"OperatorNode:multiply":if(this.implicit&&"hide"===r)return p+"~"+m}return p+s+m;default:return"\\mathrm{"+this.fn+"}\\left("+n.map(function(t){return t.toTex(e)}).join(",")+"\\right)"}},u.prototype.getIdentifier=function(){return this.type+":"+this.fn},u}var i=r(32),o=r(289);t.name="OperatorNode",t.path="expression.node",t.math=!0,t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o,a){function s(e,t){
if(!(this instanceof s))throw new SyntaxError("Constructor must be called with the new operator");if("string"==typeof e&&(console.warn("WARNING: passing a string to FunctionNode is deprecated, pass a SymbolNode instead."),e=new f(e)),!e||!e.isNode)throw new TypeError('Node expected as parameter "fn"');if(!Array.isArray(t)||!t.every(function(e){return e&&e.isNode}))throw new TypeError('Array containing Nodes expected for parameter "args"');this.fn=e,this.args=t||[],Object.defineProperty(this,"name",{get:function(){return this.fn.name||""}.bind(this),set:function(){throw new Error("Cannot assign a new name, name is read-only")}});var r=function(){throw new Error("Property `FunctionNode.object` is deprecated, use `FunctionNode.fn` instead")};Object.defineProperty(this,"object",{get:r,set:r})}function u(e,t,r){for(var n,i="",o=new RegExp("\\$(?:\\{([a-z_][a-z_0-9]*)(?:\\[([0-9]+)\\])?\\}|\\$)","ig"),a=0;null!==(n=o.exec(e));)if(i+=e.substring(a,n.index),a=n.index,"$$"===n[0])i+="$",a++;else{a+=n[0].length;var s=t[n[1]];if(!s)throw new ReferenceError("Template: Property "+n[1]+" does not exist.");if(void 0===n[2])switch(typeof s){case"string":i+=s;break;case"object":if(s.isNode)i+=s.toTex(r);else{if(!Array.isArray(s))throw new TypeError("Template: "+n[1]+" has to be a Node, String or array of Nodes");i+=s.map(function(e,t){if(e&&e.isNode)return e.toTex(r);throw new TypeError("Template: "+n[1]+"["+t+"] is not a Node.")}).join(",")}break;default:throw new TypeError("Template: "+n[1]+" has to be a Node, String or array of Nodes")}else{if(!s[n[2]]||!s[n[2]].isNode)throw new TypeError("Template: "+n[1]+"["+n[2]+"] is not a Node.");i+=s[n[2]].toTex(r)}}return i+=e.slice(a)}var c=n(r(281)),f=n(r(296));s.prototype=new c,s.prototype.type="FunctionNode",s.prototype.isFunctionNode=!0,s.prototype._compile=function(e,t){var r,n=this.fn._compile(e,t),i=this.args.map(function(r){return r._compile(e,t)});if(this.fn.isSymbolNode){var o=this.fn.name,a=e.math[o],s="function"==typeof a&&1==a.rawArgs;return s?(r=this._getUniqueArgumentsName(e),e[r]=this.args,n+"("+r+", math, scope)"):n+"("+i.join(", ")+")"}if(this.fn.isAccessorNode&&this.fn.index.isObjectProperty()){r=this._getUniqueArgumentsName(e),e[r]=this.args;var u=this.fn.object._compile(e,t),c=this.fn.index.getObjectProperty();return"(function () {var object = "+u+';return (object["'+c+'"] && object["'+c+'"].rawArgs)  ? object["'+c+'"]('+r+', math, scope) : object["'+c+'"]('+i.join(", ")+")})()"}return r=this._getUniqueArgumentsName(e),e[r]=this.args,"(function () {var fn = "+n+";return (fn && fn.rawArgs)  ? fn("+r+", math, scope) : fn("+i.join(", ")+")})()"},s.prototype._getUniqueArgumentsName=function(e){var t,r=0;do t="args"+r,r++;while(t in e);return t},s.prototype.forEach=function(e){for(var t=0;t<this.args.length;t++)e(this.args[t],"args["+t+"]",this)},s.prototype.map=function(e){for(var t=this.fn.map(e),r=[],n=0;n<this.args.length;n++)r[n]=this._ifNode(e(this.args[n],"args["+n+"]",this));return new s(t,r)},s.prototype.clone=function(){return new s(this.fn,this.args.slice(0))};var l=s.prototype.toString;s.prototype.toString=function(e){var t,r=this.fn.toString(e);return e&&"object"==typeof e.handler&&e.handler.hasOwnProperty(r)&&(t=e.handler[r](this,e)),"undefined"!=typeof t?t:l.call(this,e)},s.prototype._toString=function(e){var t=this.args.map(function(t){return t.toString(e)});return this.fn.toString(e)+"("+t.join(", ")+")"};var p=s.prototype.toTex;return s.prototype.toTex=function(e){var t;return e&&"object"==typeof e.handler&&e.handler.hasOwnProperty(this.name)&&(t=e.handler[this.name](this,e)),"undefined"!=typeof t?t:p.call(this,e)},s.prototype._toTex=function(e){var t,r=this.args.map(function(t){return t.toTex(e)});!a[this.name]||"function"!=typeof a[this.name].toTex&&"object"!=typeof a[this.name].toTex&&"string"!=typeof a[this.name].toTex||(t=a[this.name].toTex);var n;switch(typeof t){case"function":n=t(this,e);break;case"string":n=u(t,this,e);break;case"object":switch(typeof t[r.length]){case"function":n=t[r.length](this,e);break;case"string":n=u(t[r.length],this,e)}}return"undefined"!=typeof n?n:u(i.defaultTemplate,this,e)},s.prototype.getIdentifier=function(){return this.type+":"+this.name},s}var i=r(32);t.name="FunctionNode",t.path="expression.node",t.math=!0,t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){if(!(this instanceof o))throw new SyntaxError("Constructor must be called with the new operator");if(!e||!e.isNode)throw new TypeError('Node expected for parameter "content"');this.content=e}var a=n(r(281));return o.prototype=new a,o.prototype.type="ParenthesisNode",o.prototype.isParenthesisNode=!0,o.prototype._compile=function(e,t){return this.content._compile(e,t)},o.prototype.getContent=function(){return this.content.getContent()},o.prototype.forEach=function(e){e(this.content,"content",this)},o.prototype.map=function(e){var t=e(this.content,"content",this);return new o(t)},o.prototype.clone=function(){return new o(this.content)},o.prototype._toString=function(e){return!e||e&&!e.parenthesis||e&&"keep"===e.parenthesis?"("+this.content.toString(e)+")":this.content.toString(e)},o.prototype._toTex=function(e){return!e||e&&!e.parenthesis||e&&"keep"===e.parenthesis?"\\left("+this.content.toTex(e)+"\\right)":this.content.toTex(e)},o}t.name="ParenthesisNode",t.path="expression.node",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(279));return o("compile",{string:function(e){var t={};return a(e).compile().eval(t)},"string, Object":function(e,t){return a(e).compile().eval(t)},"Array | Matrix":function(e){var t={};return i(e,function(e){return a(e).compile().eval(t)})},"Array | Matrix, Object":function(e,t){return i(e,function(e){return a(e).compile().eval(t)})}})}var i=r(19);t.name="eval",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i,o){var a=n(r(103));return i("help",{any:function(t){var r,n=t;if("string"!=typeof t)for(r in o)if(o.hasOwnProperty(r)&&t===o[r]){n=r;break}var i=a[n];if(!i)throw new Error('No documentation found on "'+n+'"');return new e.Help(i)}})}t.math=!0,t.name="help",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(279));return i("parse",{"string | Array | Matrix":o,"string | Array | Matrix, Object":o})}t.name="parse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i,o){var a=n(r(305));return i("parser",{"":function(){return new a(o)}})}t.name="parser",t.factory=n,t.math=!0},function(e,t,r){"use strict";function n(e,t,n,o,a){function s(){if(!(this instanceof s))throw new SyntaxError("Constructor must be called with the new operator");this.scope={}}var u=n(r(279));return s.prototype.type="Parser",s.prototype.isParser=!0,s.prototype.parse=function(e){throw new Error("Parser.parse is deprecated. Use math.parse instead.")},s.prototype.compile=function(e){throw new Error("Parser.compile is deprecated. Use math.compile instead.")},s.prototype.eval=function(e){return u(e).compile().eval(this.scope)},s.prototype.get=function(e){return this.scope[e]},s.prototype.getAll=function(){return i({},this.scope)},s.prototype.set=function(e,t){return this.scope[e]=t},s.prototype.remove=function(e){delete this.scope[e]},s.prototype.clear=function(){for(var e in this.scope)this.scope.hasOwnProperty(e)&&delete this.scope[e]},s}var i=r(3).extend;t.name="Parser",t.path="expression",t.factory=n,t.math=!0},function(e,t,r){e.exports=[r(280),r(286),r(287),r(290),r(291),r(292),r(294),r(293),r(299),r(281),r(297),r(298),r(300),r(295),r(296),r(307)]},function(e,t){"use strict";function r(e,t,r,n){function i(){throw new Error("UpdateNode is deprecated. Use AssignmentNode instead.")}return i}t.name="UpdateNode",t.path="expression.node",t.factory=r},function(e,t,r){e.exports=[r(309),r(311),r(313),r(315),r(316),r(318),r(324),r(329),r(331),r(333)]},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(310));return o("concat",{"...any":function(e){var t=e.length-1,r=e[t];"number"==typeof r?e[t]=r-1:r&&r.isBigNumber===!0&&(e[t]=r.minus(1));try{return a.apply(null,e)}catch(n){throw i(n)}}})}var i=r(284).transform;t.name="concat",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,f){var l=n(r(52)),p=f("concat",{"...Array | Matrix | number | BigNumber":function(e){var t,r,n=e.length,f=-1,p=!1,h=[];for(t=0;n>t;t++){var m=e[t];if(m&&m.isMatrix===!0&&(p=!0),"number"==typeof m||m&&m.isBigNumber===!0){if(t!==n-1)throw new Error("Dimension must be specified as last argument");if(r=f,f=m.valueOf(),!a(f))throw new TypeError("Integer number expected for dimension");if(0>f||t>0&&f>r)throw new u(f,r+1)}else{var d=o(m).valueOf(),g=s.size(d);if(h[t]=d,r=f,f=g.length-1,t>0&&f!=r)throw new c(r+1,f+1)}}if(0==h.length)throw new SyntaxError("At least one matrix expected");for(var v=h.shift();h.length;)v=i(v,h.shift(),f,0);return p?l(v):v},"...string":function(e){return e.join("")}});return p.toTex=void 0,p}function i(e,t,r,n){if(r>n){if(e.length!=t.length)throw new c(e.length,t.length);for(var o=[],a=0;a<e.length;a++)o[a]=i(e[a],t[a],r,n+1);return o}return e.concat(t)}var o=r(3).clone,a=r(6).isInteger,s=r(40),u=r(43),c=r(42);t.name="concat",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t,r){var n,i;if(e[0]&&(n=e[0].compile().eval(r)),e[1])if(e[1]&&e[1].isSymbolNode)i=e[1].compile().eval(r);else{var o=r||{},s=e[1].filter(function(e){return e&&e.isSymbolNode&&!(e.name in t)&&!(e.name in o)})[0],u=Object.create(o),c=e[1].compile();if(!s)throw new Error("No undefined variable found in filter equation");var f=s.name;i=function(e){return u[f]=e,c.eval(u)}}return a(n,i)}var a=n(r(312));n(r(296));return o.rawArgs=!0,o}r(45).maxArgumentCount;t.name="filter",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=a("filter",{"Array, function":i,"Array, RegExp":o,"Matrix, function":function(e,t){return s(i(e.toArray(),t))},"Matrix, RegExp":function(e,t){return s(o(e.toArray(),t))}});return u.toTex=void 0,u}function i(e,t){if(1!==a(e).length)throw new Error("Only one dimensional matrices supported");var r=s(t);return e.filter(function(e,n,i){return 1===r?t(e):2===r?t(e,[n]):t(e,[n],i)})}function o(e,t){if(1!==a(e).length)throw new Error("Only one dimensional matrices supported");return e.filter(function(e){return t.test(e)})}var a=r(40).size,s=r(45).maxArgumentCount;t.name="filter",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){n(r(314));return o("forEach",{"Array | Matrix, function":function(e,t){var r=i(t),n=function(i,o){Array.isArray(i)?i.forEach(function(e,t){n(e,o.concat(t+1))}):1===r?t(i):2===r?t(i,o):t(i,o,e)};n(e.valueOf(),[])}})}var i=r(45).maxArgumentCount;t.name="forEach",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("forEach",{"Array, function":i,"Matrix, function":function(e,t){return e.forEach(t)}});return o.toTex=void 0,o}function i(e,t){var r=o(t),n=function(i,o){Array.isArray(i)?i.forEach(function(e,t){n(e,o.concat(t))}):1===r?t(i):2===r?t(i,o):t(i,o,e)};n(e,[])}var o=r(45).maxArgumentCount;t.name="forEach",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){n(r(68));return function(){for(var t=[],r=0,n=arguments.length;n>r;r++){var i=arguments[r];if(i&&i.isRange===!0)i.start--,i.end-=i.step>0?0:2;else if(i&&i.isSet===!0)i=i.map(function(e){return e-1});else if(i&&(i.isArray===!0||i.isMatrix))i=i.map(function(e){return e-1});else if("number"==typeof i)i--;else if(i&&i.isBigNumber===!0)i=i.toNumber()-1;else if("string"!=typeof i)throw new TypeError("Dimension must be an Array, Matrix, number, string, or Range");t[r]=i}var o=new e.Index;return e.Index.apply(o,t),o}}Array.isArray;t.name="index",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=(n(r(317)),n(r(52)));return o("max",{"Array, function":function(e,t){return i(e,t,e)},"Matrix, function":function(e,t){return a(i(e.valueOf(),t,e))}})}function i(e,t,r){function n(e,o){return Array.isArray(e)?e.map(function(e,t){return n(e,o.concat(t+1))}):1===i?t(e):2===i?t(e,o):t(e,o,r)}var i=o(t);return n(e,[])}var o=r(45).maxArgumentCount;t.name="map",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("map",{"Array, function":i,"Matrix, function":function(e,t){return e.map(t)}});return o.toTex=void 0,o}function i(e,t){var r=o(t),n=function(i,o){return Array.isArray(i)?i.map(function(e,t){return n(e,o.concat(t))}):1===r?t(i):2===r?t(i,o):t(i,o,e)};return n(e,[])}var o=r(45).maxArgumentCount;t.name="map",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(320));return a("max",{"...any":function(e){if(2==e.length&&o(e[0])){var t=e[1];"number"==typeof t?e[1]=t-1:t&&t.isBigNumber===!0&&(e[1]=t.minus(1))}try{return s.apply(null,e)}catch(r){throw i(r)}}})}var i=r(284).transform,o=r(319);t.name="max",t.path="expression.transform",t.factory=n},function(e,t){"use strict";e.exports=function(e){return Array.isArray(e)||e&&e.isMatrix===!0}},function(e,t,r){"use strict";function n(e,t,n,s){function u(e,t){return f(e,t)?e:t}function c(e){var t=void 0;if(i(e,function(e){(void 0===t||f(e,t))&&(t=e)}),void 0===t)throw new Error("Cannot calculate max of an empty array");return t}var f=n(r(64)),l=s("max",{"Array | Matrix":c,"Array | Matrix, number | BigNumber":function(e,t){return o(e,t.valueOf(),u)},"...":function(e){if(a(e))throw new TypeError("Scalar values expected in function max");return c(e)}});return l.toTex="\\max\\left(${args}\\right)",l}var i=r(321),o=r(322),a=r(323);t.name="max",t.factory=n},function(e,t){"use strict";e.exports=function r(e,t){e&&e.isMatrix===!0&&(e=e.valueOf());for(var n=0,i=e.length;i>n;n++){var o=e[n];Array.isArray(o)?r(o,t):t(o)}}},function(e,t,r){"use strict";function n(e,t,r){var o,a,s,u;if(0>=t){if(Array.isArray(e[0])){for(u=i(e),a=[],o=0;o<u.length;o++)a[o]=n(u[o],t-1,r);return a}for(s=e[0],o=1;o<e.length;o++)s=r(s,e[o]);return s}for(a=[],o=0;o<e.length;o++)a[o]=n(e[o],t-1,r);return a}function i(e){var t,r,n=e.length,i=e[0].length,o=[];for(r=0;i>r;r++){var a=[];for(t=0;n>t;t++)a.push(e[t][r]);o.push(a)}return o}var o=r(40).size,a=r(43);e.exports=function(e,t,r){var i=Array.isArray(e)?o(e):e.size();if(0>t||t>=i.length)throw new a(t,i.length);return e&&e.isMatrix===!0?e.create(n(e.valueOf(),t,r)):n(e,t,r)}},function(e,t,r){"use strict";var n=r(319);e.exports=function(e){for(var t=0;t<e.length;t++)if(n(e[t]))return!0;return!1}},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(325));return a("mean",{"...any":function(e){if(2==e.length&&o(e[0])){var t=e[1];"number"==typeof t?e[1]=t-1:t&&t.isBigNumber===!0&&(e[1]=t.minus(1))}try{return s.apply(null,e)}catch(r){throw i(r)}}})}var i=r(284).transform,o=r(319);t.name="mean",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,u){function c(e,t){var r=a(e,t,l),n=Array.isArray(e)?i(e):e.size();return p(r,n[t])}function f(e){var t=0,r=0;if(o(e,function(e){t=l(t,e),r++}),0===r)throw new Error("Cannot calculate mean of an empty array");return p(t,r)}var l=n(r(51)),p=n(r(326)),h=u("mean",{"Array | Matrix":f,"Array | Matrix, number | BigNumber":c,"...":function(e){if(s(e))throw new TypeError("Scalar values expected in function mean");return f(e)}});return h.toTex=void 0,h}var i=r(40).size,o=r(321),a=r(322),s=r(323);t.name="mean",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(81)),s=n(r(84)),u=n(r(327)),c=n(r(52)),f=n(r(85)),l=n(r(58)),p=o("divide",i({"Array | Matrix, Array | Matrix":function(e,t){return s(e,u(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,a,!1);break;case"dense":r=l(e,t,a,!1)}return r},"Array, any":function(e,t){return l(c(e),t,a,!1).valueOf()},"any, Array | Matrix":function(e,t){return s(e,u(t))}},a.signatures));return p.toTex={2:"\\frac{${args[0]}}{${args[1]}}"},p}var i=r(3).extend;t.name="divide",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t,r){var n,i,o,a,s;if(1==t){if(a=e[0][0],0==a)throw Error("Cannot calculate inverse, determinant is zero");return[[u(1,a)]]}if(2==t){var m=p(e);if(0==m)throw Error("Cannot calculate inverse, determinant is zero");return[[u(e[1][1],m),u(l(e[0][1]),m)],[u(l(e[1][0]),m),u(e[0][0],m)]]}var d=e.concat();for(n=0;t>n;n++)d[n]=d[n].concat();for(var g=h(t).valueOf(),v=0;r>v;v++){for(n=v;t>n&&0==d[n][v];)n++;if(n==t||0==d[n][v])throw Error("Cannot calculate inverse, determinant is zero");n!=v&&(s=d[v],d[v]=d[n],d[n]=s,s=g[v],g[v]=g[n],g[n]=s);var y=d[v],x=g[v];for(n=0;t>n;n++){var b=d[n],w=g[n];if(n!=v){if(0!=b[v]){for(o=u(l(b[v]),y[v]),i=v;r>i;i++)b[i]=c(b[i],f(o,y[i]));for(i=0;r>i;i++)w[i]=c(w[i],f(o,x[i]))}}else{for(o=y[v],i=v;r>i;i++)b[i]=u(b[i],o);for(i=0;r>i;i++)w[i]=u(w[i],o)}}}return g}var s=n(r(52)),u=n(r(81)),c=n(r(53)),f=n(r(84)),l=n(r(78)),p=n(r(328)),h=n(r(83)),m=o("inv",{"Array | Matrix":function(e){var t=e.isMatrix===!0?e.size():i.array.size(e);switch(t.length){case 1:if(1==t[0])return e.isMatrix===!0?s([u(1,e.valueOf()[0])]):[u(1,e[0])];throw new RangeError("Matrix must be square (size: "+i.string.format(t)+")");case 2:var r=t[0],n=t[1];if(r==n)return e.isMatrix===!0?s(a(e.valueOf(),r,n),e.storage()):a(e,r,n);throw new RangeError("Matrix must be square (size: "+i.string.format(t)+")");default:throw new RangeError("Matrix must be two dimensional (size: "+i.string.format(t)+")")}},any:function(e){return u(1,e)}});return m.toTex={1:"\\left(${args[0]}\\right)^{-1}"},m}var i=r(39);t.name="inv",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function s(e,t,r){if(1==t)return o.clone(e[0][0]);if(2==t)return f(l(e[0][0],e[1][1]),l(e[1][0],e[0][1]));for(var n=function(e){var t,r,n=new Array(e.length),i=0;for(t=1;t<e.length;t++)i=c(i,e[t][t]);for(t=0;t<e.length;t++){for(n[t]=new Array(e.length),n[t][t]=p(i),r=0;t>r;r++)n[t][r]=0;for(r=t+1;r<e.length;r++)n[t][r]=e[t][r];t+1<e.length&&(i=f(i,e[t+1][t+1]))}return n},i=e,a=0;t-1>a;a++)i=l(n(i),e);return t%2==0?p(i[0][0]):i[0][0]}var u=n(r(52)),c=n(r(51)),f=n(r(77)),l=n(r(84)),p=n(r(78)),h=i("det",{any:function(e){return o.clone(e)},"Array | Matrix":function(e){var t;switch(e&&e.isMatrix===!0?t=e.size():Array.isArray(e)?(e=u(e),t=e.size()):t=[],t.length){case 0:return o.clone(e);case 1:if(1==t[0])return o.clone(e.valueOf()[0]);throw new RangeError("Matrix must be square (size: "+a.format(t)+")");case 2:var r=t[0],n=t[1];if(r==n)return s(e.clone().valueOf(),r,n);throw new RangeError("Matrix must be square (size: "+a.format(t)+")");default:throw new RangeError("Matrix must be two dimensional (size: "+a.format(t)+")")}}});return h.toTex={1:"\\det\\left(${args[0]}\\right)"},h}var i=r(39),o=i.object,a=i.string;t.name="det",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(330));return a("min",{"...any":function(e){if(2==e.length&&o(e[0])){var t=e[1];"number"==typeof t?e[1]=t-1:t&&t.isBigNumber===!0&&(e[1]=t.minus(1))}try{return s.apply(null,e)}catch(r){throw i(r)}}})}var i=r(284).transform,o=r(319);t.name="min",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,s){function u(e,t){return f(e,t)?e:t}function c(e){var t=void 0;if(i(e,function(e){(void 0===t||f(e,t))&&(t=e)}),void 0===t)throw new Error("Cannot calculate min of an empty array");return t}var f=n(r(60)),l=s("min",{"Array | Matrix":c,"Array | Matrix, number | BigNumber":function(e,t){return o(e,t.valueOf(),u)},"...":function(e){if(a(e))throw new TypeError("Scalar values expected in function min");return c(e)}});return l.toTex="\\min\\left(${args}\\right)",l}var i=r(321),o=r(322),a=r(323);t.name="min",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(332));return i("range",{"...any":function(e){var t=e.length-1,r=e[t];return"boolean"!=typeof r&&e.push(!0),o.apply(null,e)}})}t.name="range",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){return"Array"===t.matrix?e:p(e)}function a(r,n){var i=l(r);if(!i)throw new SyntaxError('String "'+r+'" is no valid range');var a;return"BigNumber"===t.number?(a=n?f:c,o(a(new e.BigNumber(i.start),new e.BigNumber(i.end),new e.BigNumber(i.step)))):(a=n?u:s,o(a(i.start,i.end,i.step)))}function s(e,t,r){var n=[],i=e;if(r>0)for(;t>i;)n.push(i),i+=r;else if(0>r)for(;i>t;)n.push(i),i+=r;return n}function u(e,t,r){var n=[],i=e;if(r>0)for(;t>=i;)n.push(i),i+=r;else if(0>r)for(;i>=t;)n.push(i),i+=r;return n}function c(e,t,r){var n=[],i=e;if(r.gt(h))for(;i.lt(t);)n.push(i),i=i.plus(r);else if(r.lt(h))for(;i.gt(t);)n.push(i),i=i.plus(r);return n}function f(e,t,r){var n=[],i=e;if(r.gt(h))for(;i.lte(t);)n.push(i),i=i.plus(r);else if(r.lt(h))for(;i.gte(t);)n.push(i),i=i.plus(r);return n}function l(e){var t=e.split(":"),r=t.map(function(e){return Number(e)}),n=r.some(function(e){return isNaN(e)});if(n)return null;switch(r.length){case 2:return{start:r[0],end:r[1],step:1};case 3:return{start:r[0],end:r[2],step:r[1]};default:return null}}var p=n(r(52)),h=new e.BigNumber(0),m=new e.BigNumber(1),d=i("range",{string:a,"string, boolean":a,"number, number":function(e,t){return o(s(e,t,1))},"number, number, number":function(e,t,r){return o(s(e,t,r))},"number, number, boolean":function(e,t,r){return o(r?u(e,t,1):s(e,t,1))},"number, number, number, boolean":function(e,t,r,n){return o(n?u(e,t,r):s(e,t,r))},"BigNumber, BigNumber":function(e,t){return o(c(e,t,m))},"BigNumber, BigNumber, BigNumber":function(e,t,r){return o(c(e,t,r))},"BigNumber, BigNumber, boolean":function(e,t,r){return o(r?f(e,t,m):c(e,t,m))},"BigNumber, BigNumber, BigNumber, boolean":function(e,t,r,n){return o(n?f(e,t,r):c(e,t,r))}});return d.toTex=void 0,d}t.name="range",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(285));return o("subset",{"...any":function(e){try{return a.apply(null,e)}catch(t){throw i(t)}}})}var i=r(284).transform;t.name="subset",t.path="expression.transform",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(e){if(!(this instanceof s))throw new SyntaxError("Constructor must be called with the new operator");if(!e)throw new Error('Argument "doc" missing');this.doc=e}var u=n(r(304))();return s.prototype.type="Help",s.prototype.isHelp=!0,s.prototype.toString=function(){var e=this.doc||{},t="\n";if(e.name&&(t+="Name: "+e.name+"\n\n"),e.category&&(t+="Category: "+e.category+"\n\n"),e.description&&(t+="Description:\n    "+e.description+"\n\n"),e.syntax&&(t+="Syntax:\n    "+e.syntax.join("\n    ")+"\n\n"),e.examples){t+="Examples:\n";for(var r=0;r<e.examples.length;r++){var n=e.examples[r];t+="    "+n+"\n";var i;try{i=u.eval(n)}catch(a){i=a}i&&!i.isHelp&&(t+="        "+o.format(i,{precision:14})+"\n")}t+="\n"}return e.seealso&&(t+="See also: "+e.seealso.join(", ")+"\n"),t},s.prototype.toJSON=function(){var e=i.clone(this.doc);return e.mathjs="Help",e},s.fromJSON=function(e){var t={};for(var r in e)"mathjs"!==r&&(t[r]=e[r]);return new s(t)},s.prototype.valueOf=s.prototype.toString,s}var i=r(3),o=r(23);t.name="Help",t.path="type",t.factory=n},function(e,t,r){e.exports=[r(336),r(363),r(394),r(410),r(419),r(424),r(427),r(433),r(445),r(454),r(458),r(465),r(467),r(493),r(495)]},function(e,t,r){e.exports=[r(337),r(338),r(358),r(360),r(362)]},function(e,t,r){"use strict";function n(e,t,n,i){var a=n(r(52)),s=n(r(86)),u=n(r(53)),c=n(r(81)),f=n(r(80)),l=n(r(77)),p=n(r(64)),h=n(r(48)),m=n(r(78)),d=e.SparseMatrix,g=e.DenseMatrix,v=e.Spa,y=i("lup",{DenseMatrix:function(e){return x(e)},SparseMatrix:function(e){return b(e)},Array:function(e){var t=a(e),r=x(t);return{L:r.L.valueOf(),U:r.U.valueOf(),p:r.p}}}),x=function(e){var t,r,n,i=e._size[0],a=e._size[1],m=Math.min(i,a),d=o.clone(e._data),v=[],y=[i,m],x=[],b=[m,a],w=[];for(t=0;i>t;t++)w[t]=t;for(r=0;a>r;r++){if(r>0)for(t=0;i>t;t++){var N=Math.min(t,r),E=0;for(n=0;N>n;n++)E=u(E,f(d[t][n],d[n][r]));d[t][r]=l(d[t][r],E)}var M=r,A=0,O=0;for(t=r;i>t;t++){var _=d[t][r],T=s(_);p(T,A)&&(M=t,A=T,O=_)}if(r!==M&&(w[r]=[w[M],w[M]=w[r]][0],g._swapRows(r,M,d)),i>r)for(t=r+1;i>t;t++){var C=d[t][r];h(C,0)||(d[t][r]=c(d[t][r],O))}}for(r=0;a>r;r++)for(t=0;i>t;t++)0===r&&(a>t&&(x[t]=[]),v[t]=[]),r>t?(a>t&&(x[t][r]=d[t][r]),i>r&&(v[t][r]=0)):t!==r?(a>t&&(x[t][r]=0),i>r&&(v[t][r]=d[t][r])):(a>t&&(x[t][r]=d[t][r]),i>r&&(v[t][r]=1));var S=new g({data:v,size:y}),z=new g({data:x,size:b}),B=[];for(t=0,m=w.length;m>t;t++)B[w[t]]=t;return{L:S,U:z,p:B,toString:function(){return"L: "+this.L.toString()+"\nU: "+this.U.toString()+"\nP: "+this.p}}},b=function(e){var t,r,n,i=e._size[0],o=e._size[1],a=Math.min(i,o),u=e._values,l=e._index,g=e._ptr,y=[],x=[],b=[],w=[i,a],N=[],E=[],M=[],A=[a,o],O=[],_=[];for(t=0;i>t;t++)O[t]=t,_[t]=t;var T=function(e,t){var r=_[e],n=_[t];O[r]=t,O[n]=e,_[e]=n,_[t]=r};for(r=0;o>r;r++){var C=new v;i>r&&(b.push(y.length),y.push(1),x.push(r)),M.push(N.length);var S=g[r],z=g[r+1];for(n=S;z>n;n++)t=l[n],C.set(O[t],u[n]);r>0&&C.forEach(0,r-1,function(e,t){d._forEachRow(e,y,x,b,function(r,n){r>e&&C.accumulate(r,m(f(n,t)))})});var B=r,k=C.get(r),I=s(k);C.forEach(r+1,i-1,function(e,t){var r=s(t);p(r,I)&&(B=e,I=r,k=t)}),r!==B&&(d._swapRows(r,B,w[1],y,x,b),d._swapRows(r,B,A[1],N,E,M),C.swap(r,B),T(r,B)),C.forEach(0,i-1,function(e,t){r>=e?(N.push(t),E.push(e)):(t=c(t,k),h(t,0)||(y.push(t),x.push(e)))})}return M.push(N.length),b.push(y.length),{L:new d({values:y,index:x,ptr:b,size:w}),U:new d({values:N,index:E,ptr:M,size:A}),p:O,toString:function(){return"L: "+this.L.toString()+"\nU: "+this.U.toString()+"\nP: "+this.p}}};return y}var i=r(39),o=i.object;t.name="lup",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(339)),s=n(r(350)),u=i("slu",{"SparseMatrix, number, number":function(e,t,r){if(!a(t)||0>t||t>3)throw new Error("Symbolic Ordering and Analysis order must be an integer number in the interval [0, 3]");if(0>r||r>1)throw new Error("Partial pivoting threshold must be a number from 0 to 1");var n=o(t,e,!1),i=s(e,n,r);return{L:i.L,U:i.U,p:i.pinv,q:n.q,toString:function(){return"L: "+this.L.toString()+"\nU: "+this.U.toString()+"\np: "+this.p.toString()+(this.q?"\nq: "+this.q.toString():"")+"\n"}}}});return u}var i=r(39),o=i.number,a=o.isInteger;t.name="slu",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(340)),o=n(r(345)),a=n(r(346)),s=n(r(347)),u=n(r(348)),c=function(e,t,r){var n,c=t._ptr,l=t._size,p=l[1],h={};if(h.q=i(e,t),e&&!h.q)return null;if(r){var m=e?o(t,null,h.q,0):t;h.parent=a(m,1);var d=s(h.parent,p);if(h.cp=u(m,h.parent,d,1),m&&h.parent&&h.cp&&f(m,h))for(h.unz=0,n=0;p>n;n++)h.unz+=h.cp[n]}else h.unz=4*c[p]+p,h.lnz=h.unz;return h},f=function(e,t){var r=e._ptr,n=e._index,i=e._size,o=i[0],a=i[1];t.pinv=[],t.leftmost=[];var s,u,c,f,l,p=t.parent,h=t.pinv,m=t.leftmost,d=[],g=0,v=o,y=o+a,x=o+2*a;for(u=0;a>u;u++)d[v+u]=-1,d[y+u]=-1,d[x+u]=0;for(s=0;o>s;s++)m[s]=-1;for(u=a-1;u>=0;u--)for(f=r[u],l=r[u+1],c=f;l>c;c++)m[n[c]]=u;for(s=o-1;s>=0;s--)h[s]=-1,u=m[s],-1!=u&&(0===d[x+u]++&&(d[y+u]=s),d[g+s]=d[v+u],d[v+u]=s);for(t.lnz=0,t.m2=o,u=0;a>u;u++)if(s=d[v+u],t.lnz++,0>s&&(s=t.m2++),h[s]=u,!(--x[u]<=0)){t.lnz+=d[x+u];var b=p[u];-1!=b&&(0===d[x+b]&&(d[y+b]=d[y+u]),d[g+d[y+u]]=d[v+b],d[v+b]=d[g+s],d[x+b]+=d[x+u])}for(s=0;o>s;s++)h[s]<0&&(h[s]=u++);return!0};return c}t.name="cs_sqr",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(341)),o=n(r(342)),a=n(r(343)),s=n(r(51)),u=n(r(84)),c=n(r(344)),f=function(e,t){if(!t||0>=e||e>3)return null;var r=t._size,n=r[0],s=r[1],u=0,c=Math.max(16,10*Math.sqrt(s));c=Math.min(s-2,c);var f=l(e,t,n,s,c);o(f,d,null);for(var g,v,y,x,b,w,N,E,M,A,O,_,T,C,S,z,B=f._index,k=f._ptr,I=k[s],P=[],R=[],U=0,q=s+1,L=2*(s+1),j=3*(s+1),F=4*(s+1),D=5*(s+1),$=6*(s+1),G=7*(s+1),H=P,Z=p(s,k,R,U,j,H,L,G,q,$,F,D),V=h(s,k,R,D,F,$,c,q,j,H,L),Y=0;s>V;){for(y=-1;s>Y&&-1==(y=R[j+Y]);Y++);-1!=R[L+y]&&(H[R[L+y]]=-1),R[j+Y]=R[L+y];var W=R[F+y],X=R[q+y];V+=X;var J=0;R[q+y]=-X;var Q=k[y],K=0===W?Q:I,ee=K;for(x=1;W+1>=x;x++){for(x>W?(w=y,N=Q,E=R[U+y]-W):(w=B[Q++],N=k[w],E=R[U+w]),b=1;E>=b;b++)g=B[N++],(M=R[q+g])<=0||(J+=M,R[q+g]=-M,B[ee++]=g,-1!=R[L+g]&&(H[R[L+g]]=H[g]),-1!=H[g]?R[L+H[g]]=R[L+g]:R[j+R[D+g]]=R[L+g]);w!=y&&(k[w]=i(y),R[$+w]=0)}for(0!==W&&(I=ee),R[D+y]=J,k[y]=K,R[U+y]=ee-K,R[F+y]=-2,Z=m(Z,u,R,$,s),A=K;ee>A;A++)if(g=B[A],!((O=R[F+g])<=0)){M=-R[q+g];var te=Z-M;for(Q=k[g],_=k[g]+O-1;_>=Q;Q++)w=B[Q],R[$+w]>=Z?R[$+w]-=M:0!==R[$+w]&&(R[$+w]=R[D+w]+te)}for(A=K;ee>A;A++){for(g=B[A],_=k[g],T=_+R[F+g]-1,C=_,S=0,z=0,Q=_;T>=Q;Q++)if(w=B[Q],0!==R[$+w]){var re=R[$+w]-Z;re>0?(z+=re,B[C++]=w,S+=w):(k[w]=i(y),R[$+w]=0)}R[F+g]=C-_+1;var ne=C,ie=_+R[U+g];for(Q=T+1;ie>Q;Q++){v=B[Q];var oe=R[q+v];0>=oe||(z+=oe,B[C++]=v,S+=v)}0===z?(k[g]=i(y),M=-R[q+g],J-=M,X+=M,V+=M,R[q+g]=0,R[F+g]=-1):(R[D+g]=Math.min(R[D+g],z),B[C]=B[ne],B[ne]=B[_],B[_]=y,R[U+g]=C-_+1,S=(0>S?-S:S)%s,R[L+g]=R[G+S],R[G+S]=g,H[g]=S)}for(R[D+y]=J,u=Math.max(u,J),Z=m(Z+u,u,R,$,s),A=K;ee>A;A++)if(g=B[A],!(R[q+g]>=0))for(S=H[g],g=R[G+S],R[G+S]=-1;-1!=g&&-1!=R[L+g];g=R[L+g],Z++){for(E=R[U+g],O=R[F+g],Q=k[g]+1;Q<=k[g]+E-1;Q++)R[$+B[Q]]=Z;var ae=g;for(v=R[L+g];-1!=v;){var se=R[U+v]===E&&R[F+v]===O;for(Q=k[v]+1;se&&Q<=k[v]+E-1;Q++)R[$+B[Q]]!=Z&&(se=0);se?(k[v]=i(g),R[q+g]+=R[q+v],R[q+v]=0,R[F+v]=-1,v=R[L+v],R[L+ae]=v):(ae=v,v=R[L+v])}}for(Q=K,A=K;ee>A;A++)g=B[A],(M=-R[q+g])<=0||(R[q+g]=M,z=R[D+g]+J-M,z=Math.min(z,s-V-M),-1!=R[j+z]&&(H[R[j+z]]=g),R[L+g]=R[j+z],H[g]=-1,R[j+z]=g,Y=Math.min(Y,z),R[D+g]=z,B[Q++]=g);R[q+y]=X,0===(R[U+y]=Q-K)&&(k[y]=-1,R[$+y]=0),0!==W&&(I=Q)}for(g=0;s>g;g++)k[g]=i(k[g]);for(v=0;s>=v;v++)R[j+v]=-1;for(v=s;v>=0;v--)R[q+v]>0||(R[L+v]=R[j+k[v]],R[j+k[v]]=v);for(w=s;w>=0;w--)R[q+w]<=0||-1!=k[w]&&(R[L+w]=R[j+k[w]],R[j+k[w]]=w);for(y=0,g=0;s>=g;g++)-1==k[g]&&(y=a(g,y,R,j,L,P,$));return P.splice(P.length-1,1),P},l=function(e,t,r,n,i){var o=c(t);if(1===e&&n===r)return s(t,o);if(2==e){for(var a=o._index,f=o._ptr,l=0,p=0;r>p;p++){var h=f[p];if(f[p]=l,!(f[p+1]-h>i))for(var m=f[p+1];m>h;h++)a[l++]=a[h]}return f[r]=l,t=c(o),u(o,t)}return u(o,t)},p=function(e,t,r,n,i,o,a,s,u,c,f,l){for(var p=0;e>p;p++)r[n+p]=t[p+1]-t[p];r[n+e]=0;for(var h=0;e>=h;h++)r[i+h]=-1,o[h]=-1,r[a+h]=-1,r[s+h]=-1,r[u+h]=1,r[c+h]=1,r[f+h]=0,r[l+h]=r[n+h];var d=m(0,0,r,c,e);return r[f+e]=-2,t[e]=-1,r[c+e]=0,d},h=function(e,t,r,n,o,a,s,u,c,f,l){for(var p=0,h=0;e>h;h++){var m=r[n+h];if(0===m)r[o+h]=-2,p++,t[h]=-1,r[a+h]=0;else if(m>s)r[u+h]=0,r[o+h]=-1,p++,t[h]=i(e),r[u+e]++;else{var d=r[c+m];-1!=d&&(f[d]=h),r[l+h]=r[c+m],r[c+m]=h}}return p},m=function(e,t,r,n,i){if(2>e||0>e+t){for(var o=0;i>o;o++)0!==r[n+o]&&(r[n+o]=1);e=2}return e},d=function(e,t){return e!=t};return f}t.name="cs_amd",t.path="sparse",t.factory=n},function(e,t){"use strict";function r(){var e=function(e){return-e-2};return e}t.name="cs_flip",t.path="sparse",t.factory=r},function(e,t){"use strict";function r(){var e=function(e,t,r){for(var n=e._values,i=e._index,o=e._ptr,a=e._size,s=a[1],u=0,c=0;s>c;c++){var f=o[c];for(o[c]=u;f<o[c+1];f++)t(i[f],c,n?n[f]:1,r)&&(i[u]=i[f],n&&(n[u]=n[f]),u++)}return o[s]=u,i.splice(u,i.length-u),n&&n.splice(u,n.length-u),u};return e}t.name="cs_fkeep",t.path="sparse",t.factory=r},function(e,t){"use strict";function r(){var e=function(e,t,r,n,i,o,a){var s=0;for(r[a]=e;s>=0;){var u=r[a+s],c=r[n+u];-1==c?(s--,o[t++]=u):(r[n+u]=r[i+c],++s,r[a+s]=c)}return t};return e}t.name="cs_tdfs",t.path="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=e.DenseMatrix,f=e.SparseMatrix,l=a("transpose",{Array:function(e){return l(u(e)).valueOf()},Matrix:function(e){var t,r=e.size();switch(r.length){case 1:t=e.clone();break;case 2:var n=r[0],i=r[1];if(0===i)throw new RangeError("Cannot transpose a 2D matrix with no columns (size: "+o(r)+")");switch(e.storage()){case"dense":t=p(e,n,i);break;case"sparse":t=h(e,n,i)}break;default:throw new RangeError("Matrix must be a vector or two dimensional (size: "+o(this._size)+")")}return t},any:function(e){return i(e)}}),p=function(e,t,r){for(var n,o=e._data,a=[],s=0;r>s;s++){n=a[s]=[];for(var u=0;t>u;u++)n[u]=i(o[u][s]);
}return new c({data:a,size:[r,t],datatype:e._datatype})},h=function(e,t,r){for(var n=e._values,o=e._index,a=e._ptr,s=n?[]:void 0,u=[],c=[],l=[],p=0;t>p;p++)l[p]=0;var h,m,d;for(h=0,m=o.length;m>h;h++)l[o[h]]++;for(var g=0,v=0;t>v;v++)c.push(g),g+=l[v],l[v]=c[v];for(c.push(g),d=0;r>d;d++)for(var y=a[d],x=a[d+1],b=y;x>b;b++){var w=l[o[b]]++;u[w]=d,n&&(s[w]=i(n[b]))}return new f({values:s,index:u,ptr:c,size:[r,t],datatype:e._datatype})};return l.toTex={1:"\\left(${args[0]}\\right)"+s.operators.transpose},l}var i=r(3).clone,o=r(23).format;t.name="transpose",t.factory=n},function(e,t){"use strict";function r(e){var t=e.SparseMatrix,r=function(e,r,n,i){for(var o=e._values,a=e._index,s=e._ptr,u=e._size,c=e._datatype,f=u[0],l=u[1],p=i&&e._values?[]:null,h=[],m=[],d=0,g=0;l>g;g++){m[g]=d;for(var v=n?n[g]:g,y=s[v],x=s[v+1],b=y;x>b;b++){var w=r?r[a[b]]:a[b];h[d]=w,p&&(p[d]=o[b]),d++}}return m[l]=d,new t({values:p,index:h,ptr:m,size:[f,l],datatype:c})};return r}t.name="cs_permute",t.path="sparse",t.factory=r},function(e,t){"use strict";function r(){var e=function(e,t){if(!e)return null;var r,n,i=e._index,o=e._ptr,a=e._size,s=a[0],u=a[1],c=[],f=[],l=0,p=u;if(t)for(r=0;s>r;r++)f[p+r]=-1;for(var h=0;u>h;h++){c[h]=-1,f[l+h]=-1;for(var m=o[h],d=o[h+1],g=m;d>g;g++){var v=i[g];for(r=t?f[p+v]:v;-1!=r&&h>r;r=n)n=f[l+r],f[l+r]=h,-1==n&&(c[r]=h);t&&(f[p+v]=h)}}return c};return e}t.name="cs_etree",t.path="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(343)),o=function(e,t){if(!e)return null;var r,n=0,o=[],a=[],s=0,u=t,c=2*t;for(r=0;t>r;r++)a[s+r]=-1;for(r=t-1;r>=0;r--)-1!=e[r]&&(a[u+r]=a[s+e[r]],a[s+e[r]]=r);for(r=0;t>r;r++)-1==e[r]&&(n=i(r,n,a,s,u,o,c));return o};return o}t.name="cs_post",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(344)),o=n(r(349)),a=function(e,t,r,n){if(!e||!t||!r)return null;var a,s,u,c,f,l,p,h=e._size,m=h[0],d=h[1],g=4*d+(n?d+m+1:0),v=[],y=0,x=d,b=2*d,w=3*d,N=4*d,E=5*d+1;for(u=0;g>u;u++)v[u]=-1;var M=[],A=i(e),O=A._index,_=A._ptr;for(u=0;d>u;u++)for(s=r[u],M[s]=-1==v[w+s]?1:0;-1!=s&&-1==v[w+s];s=t[s])v[w+s]=u;if(n){for(u=0;d>u;u++)v[r[u]]=u;for(a=0;m>a;a++){for(u=d,l=_[a],p=_[a+1],f=l;p>f;f++)u=Math.min(u,v[O[f]]);v[E+a]=v[N+u],v[N+u]=a}}for(a=0;d>a;a++)v[y+a]=a;for(u=0;d>u;u++){for(s=r[u],-1!=t[s]&&M[t[s]]--,c=n?v[N+u]:s;-1!=c;c=n?v[E+c]:-1)for(f=_[c];f<_[c+1];f++){a=O[f];var T=o(a,s,v,w,x,b,y);T.jleaf>=1&&M[s]++,2==T.jleaf&&M[T.q]--}-1!=t[s]&&(v[y+s]=t[s])}for(s=0;d>s;s++)-1!=t[s]&&(M[t[s]]+=M[s]);return M};return a}t.name="cs_counts",t.path="sparse",t.factory=n},function(e,t){"use strict";function r(){var e=function(e,t,r,n,i,o,a){var s,u,c,f,l=0;if(t>=e||r[n+t]<=r[i+e])return-1;if(r[i+e]=r[n+t],c=r[o+e],r[o+e]=t,-1===c)l=1,f=e;else{for(l=2,f=c;f!=r[a+f];f=r[a+f]);for(s=c;s!=f;s=u)u=r[a+s],r[a+s]=f}return{jleaf:l,q:f}};return e}t.name="cs_leaf",t.path="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(86)),o=n(r(81)),a=n(r(84)),s=n(r(64)),u=n(r(351)),c=n(r(352)),f=e.SparseMatrix,l=function(e,t,r){if(!e)return null;var n,l=e._size,p=l[1],h=100,m=100;t&&(n=t.q,h=t.lnz||h,m=t.unz||m);var d,g,v=[],y=[],x=[],b=new f({values:v,index:y,ptr:x,size:[p,p]}),w=[],N=[],E=[],M=new f({values:w,index:N,ptr:E,size:[p,p]}),A=[],O=[],_=[];for(d=0;p>d;d++)O[d]=0,A[d]=-1,x[d+1]=0;h=0,m=0;for(var T=0;p>T;T++){x[T]=h,E[T]=m;var C=n?n[T]:T,S=c(b,e,C,_,O,A,1),z=-1,B=-1;for(g=S;p>g;g++)if(d=_[g],A[d]<0){var k=i(O[d]);s(k,B)&&(B=k,z=d)}else N[m]=A[d],w[m++]=O[d];if(-1==z||0>=B)return null;A[C]<0&&u(i(O[C]),a(B,r))&&(z=C);var I=O[z];for(N[m]=T,w[m++]=I,A[z]=T,y[h]=z,v[h++]=1,g=S;p>g;g++)d=_[g],A[d]<0&&(y[h]=d,v[h++]=o(O[d],I)),O[d]=0}for(x[p]=h,E[p]=m,g=0;h>g;g++)y[g]=A[y[g]];return v.splice(h,v.length-h),y.splice(h,y.length-h),w.splice(m,w.length-m),N.splice(m,N.length-m),{L:b,U:M,pinv:A}};return l}t.name="cs_lu",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(62)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=r(32),m=a("largerEq",{"boolean, boolean":function(e,t){return e>=t},"number, number":function(e,r){return e>=r||i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return e.gte(r)||o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return-1!==e.compare(t)},"Complex, Complex":function(){throw new TypeError("No ordering relation is defined for complex numbers")},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return m(e.value,t.value)},"string, string":function(e,t){return e>=t},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,m);break;default:r=u(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,m,!1);break;default:r=l(e,t,m)}}return r},"Array, Array":function(e,t){return m(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return m(s(e),t)},"Matrix, Array":function(e,t){return m(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=p(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,m,!0);break;default:r=p(t,e,m,!0)}return r},"Array, any":function(e,t){return p(s(e),t,m,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+h.operators.largerEq+"${args[1]}\\right)"},m}var i=r(6).nearlyEqual,o=r(49);t.name="largerEq",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(81)),o=n(r(84)),a=n(r(77)),s=n(r(353)),u=function(e,t,r,n,u,c,f){var l,p,h,m,d=e._values,g=e._index,v=e._ptr,y=e._size,x=y[1],b=t._values,w=t._index,N=t._ptr,E=s(e,t,r,n,c);for(l=E;x>l;l++)u[n[l]]=0;for(p=N[r],h=N[r+1],l=p;h>l;l++)u[w[l]]=b[l];for(var M=E;x>M;M++){var A=n[M],O=c?c[A]:A;if(!(0>O))for(p=v[O],h=v[O+1],u[A]=i(u[A],d[f?p:h-1]),l=f?p+1:p,m=f?h:h-1;m>l;l++){var _=g[l];u[_]=a(u[_],o(d[l],u[A]))}}return E};return u}t.name="cs_spsolve",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(354)),o=n(r(355)),a=n(r(356)),s=function(e,t,r,n,s){var u,c,f,l=e._ptr,p=e._size,h=t._index,m=t._ptr,d=p[1],g=d;for(c=m[r],f=m[r+1],u=c;f>u;u++){var v=h[u];o(l,v)||(g=i(v,e,g,n,s))}for(u=g;d>u;u++)a(l,n[u]);return g};return s}t.name="cs_reach",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(355)),o=n(r(356)),a=n(r(357)),s=function(e,t,r,n,s){var u,c,f,l=t._index,p=t._ptr,h=t._size,m=h[1],d=0;for(n[0]=e;d>=0;){e=n[d];var g=s?s[e]:e;i(p,e)||(o(p,e),n[m+d]=0>g?0:a(p[g]));var v=1;for(c=n[m+d],f=0>g?0:a(p[g+1]);f>c;c++)if(u=l[c],!i(p,u)){n[m+d]=c,n[++d]=u,v=0;break}v&&(d--,n[--r]=e)}return r};return s}t.name="cs_dfs",t.path="sparse",t.factory=n},function(e,t){"use strict";function r(){var e=function(e,t){return e[t]<0};return e}t.name="cs_marked",t.path="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(341)),o=function(e,t){e[t]=i(e[t])};return o}t.name="cs_mark",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n){var i=n(r(341)),o=function(e){return 0>e?i(e):e};return o}t.name="cs_unflip",t.path="sparse",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(81)),s=n(r(80)),u=n(r(77)),c=n(r(48)),f=n(r(359)),l=e.DenseMatrix,p=i("lsolve",{"SparseMatrix, Array | Matrix":function(e,t){return m(e,t)},"DenseMatrix, Array | Matrix":function(e,t){return h(e,t)},"Array, Array | Matrix":function(e,t){var r=o(e),n=h(r,t);return n.valueOf()}}),h=function(e,t){t=f(e,t,!0);for(var r=t._data,n=e._size[0],i=e._size[1],o=[],p=e._data,h=0;i>h;h++){var m,d=r[h][0]||0;if(c(d,0))m=0;else{var g=p[h][h];if(c(g,0))throw new Error("Linear system cannot be solved since matrix is singular");m=a(d,g);for(var v=h+1;n>v;v++)r[v]=[u(r[v][0]||0,s(m,p[v][h]))]}o[h]=[m]}return new l({data:o,size:[n,1]})},m=function(e,t){t=f(e,t,!0);for(var r,n,i=t._data,o=e._size[0],p=e._size[1],h=e._values,m=e._index,d=e._ptr,g=[],v=0;p>v;v++){var y=i[v][0]||0;if(c(y,0))g[v]=[0];else{var x=0,b=[],w=[],N=d[v+1];for(n=d[v];N>n;n++)r=m[n],r===v?x=h[n]:r>v&&(b.push(h[n]),w.push(r));if(c(x,0))throw new Error("Linear system cannot be solved since matrix is singular");var E=a(y,x);for(n=0,N=w.length;N>n;n++)r=w[n],i[r]=[u(i[r][0]||0,s(E,b[n]))];g[v]=[E]}}return new l({data:g,size:[o,1]})};return p}t.name="lsolve",t.factory=n},function(e,t,r){"use strict";function n(e){var t=e.DenseMatrix,r=function(e,r,n){var i=e.size();if(2!==i.length)throw new RangeError("Matrix must be two dimensional (size: "+o.format(i)+")");var u=i[0],c=i[1];if(u!==c)throw new RangeError("Matrix must be square (size: "+o.format(i)+")");var f,l,p;if(r&&r.isMatrix===!0){var h=r.size();if(1===h.length){if(h[0]!==u)throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");for(f=[],p=r._data,l=0;u>l;l++)f[l]=[p[l]];return new t({data:f,size:[u,1],datatype:r._datatype})}if(2===h.length){if(h[0]!==u||1!==h[1])throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");if(r.isDenseMatrix===!0){if(n){for(f=[],p=r._data,l=0;u>l;l++)f[l]=[p[l][0]];return new t({data:f,size:[u,1],datatype:r._datatype})}return r}for(f=[],l=0;u>l;l++)f[l]=[0];for(var m=r._values,d=r._index,g=r._ptr,v=g[1],y=g[0];v>y;y++)l=d[y],f[l][0]=m[y];return new t({data:f,size:[u,1],datatype:r._datatype})}throw new RangeError("Dimension mismatch. Matrix columns must match vector length.")}if(s(r)){var x=a.size(r);if(1===x.length){if(x[0]!==u)throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");for(f=[],l=0;u>l;l++)f[l]=[r[l]];return new t({data:f,size:[u,1]})}if(2===x.length){if(x[0]!==u||1!==x[1])throw new RangeError("Dimension mismatch. Matrix columns must match vector length.");for(f=[],l=0;u>l;l++)f[l]=[r[l][0]];return new t({data:f,size:[u,1]})}throw new RangeError("Dimension mismatch. Matrix columns must match vector length.")}};return r}var i=r(39),o=i.string,a=i.array,s=Array.isArray;t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(52)),s=n(r(337)),u=n(r(338)),c=n(r(361)),f=n(r(359)),l=n(r(362)),p=n(r(358)),h=o("lusolve",{"Array, Array | Matrix":function(e,t){e=a(e);var r=s(e),n=d(r.L,r.U,r.p,null,t);return n.valueOf()},"DenseMatrix, Array | Matrix":function(e,t){var r=s(e);return d(r.L,r.U,r.p,null,t)},"SparseMatrix, Array | Matrix":function(e,t){var r=s(e);return d(r.L,r.U,r.p,null,t)},"SparseMatrix, Array | Matrix, number, number":function(e,t,r,n){var i=u(e,r,n);return d(i.L,i.U,i.p,i.q,t)},"Object, Array | Matrix":function(e,t){return d(e.L,e.U,e.p,e.q,t)}}),m=function(e){if(e&&e.isMatrix===!0)return e;if(i(e))return a(e);throw new TypeError("Invalid Matrix LU decomposition")},d=function(e,t,r,n,i){e=m(e),t=m(t),i=f(e,i,!1),r&&(i._data=c(r,i._data));var o=p(e,i),a=l(t,o);return n&&(a._data=c(n,a._data)),a};return h}var i=Array.isArray;t.name="lusolve",t.factory=n},function(e,t){"use strict";function r(){var e=function(e,t,r){var n,r=t.length,i=[];if(e)for(n=0;r>n;n++)i[e[n]]=t[n];else for(n=0;r>n;n++)i[n]=t[n];return i};return e}t.name="cs_ipvec",t.path="sparse",t.factory=r},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(81)),s=n(r(80)),u=n(r(77)),c=n(r(48)),f=n(r(359)),l=e.DenseMatrix,p=i("usolve",{"SparseMatrix, Array | Matrix":function(e,t){return m(e,t)},"DenseMatrix, Array | Matrix":function(e,t){return h(e,t)},"Array, Array | Matrix":function(e,t){var r=o(e),n=h(r,t);return n.valueOf()}}),h=function(e,t){t=f(e,t,!0);for(var r=t._data,n=e._size[0],i=e._size[1],o=[],p=e._data,h=i-1;h>=0;h--){var m,d=r[h][0]||0;if(c(d,0))m=0;else{var g=p[h][h];if(c(g,0))throw new Error("Linear system cannot be solved since matrix is singular");m=a(d,g);for(var v=h-1;v>=0;v--)r[v]=[u(r[v][0]||0,s(m,p[v][h]))]}o[h]=[m]}return new l({data:o,size:[n,1]})},m=function(e,t){t=f(e,t,!0);for(var r,n,i=t._data,o=e._size[0],p=e._size[1],h=e._values,m=e._index,d=e._ptr,g=[],v=p-1;v>=0;v--){var y=i[v][0]||0;if(c(y,0))g[v]=[0];else{var x=0,b=[],w=[],N=d[v],E=d[v+1];for(n=E-1;n>=N;n--)r=m[n],r===v?x=h[n]:v>r&&(b.push(h[n]),w.push(r));if(c(x,0))throw new Error("Linear system cannot be solved since matrix is singular");var M=a(y,x);for(n=0,E=w.length;E>n;n++)r=w[n],i[r]=[u(i[r][0],s(M,b[n]))];g[v]=[M]}}return new l({data:g,size:[o,1]})};return p}t.name="usolve",t.factory=n},function(e,t,r){e.exports=[r(86),r(51),r(53),r(364),r(366),r(367),r(326),r(368),r(370),r(372),r(373),r(87),r(374),r(375),r(376),r(379),r(382),r(383),r(384),r(84),r(385),r(387),r(82),r(388),r(390),r(377),r(391),r(77),r(78),r(392),r(393)]},function(e,t,r){"use strict";function n(e,t,n,a){function s(r,n){var i=r.arg()/3,a=r.abs(),s=new e.Complex(o(a),0).mul(new e.Complex(0,i).exp());if(n){var u=[s,new e.Complex(o(a),0).mul(new e.Complex(0,i+2*Math.PI/3).exp()),new e.Complex(o(a),0).mul(new e.Complex(0,i-2*Math.PI/3).exp())];return"Array"===t.matrix?u:l(u)}return s}function u(t){if(t.value&&t.value.isComplex){var r=t.clone();return r.value=1,r=r.pow(1/3),r.value=s(t.value),r}var n=f(t.value);n&&(t.value=c(t.value));var i;i=t.value&&t.value.isBigNumber?new e.BigNumber(1).div(3):t.value&&t.value.isFraction?new e.Fraction(1,3):1/3;var r=t.pow(i);return n&&(r.value=c(r.value)),r}var c=n(r(78)),f=n(r(365)),l=n(r(52)),p=a("cbrt",{number:o,Complex:s,"Complex, boolean":s,BigNumber:function(e){return e.cbrt()},Unit:u,"Array | Matrix":function(e){return i(e,p,!0)}});return p.toTex={1:"\\sqrt[3]{${args[0]}}"},p}var i=r(19),o=Math.cbrt||function(e){if(0===e)return e;var t,r=0>e;return r&&(e=-e),isFinite(e)?(t=Math.exp(Math.log(e)/3),t=(e/(t*t)+2*t)/3):t=e,r?-t:t};t.name="cbrt",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isNegative",{number:function(e){return 0>e},BigNumber:function(e){return e.isNeg()&&!e.isZero()&&!e.isNaN()},Fraction:function(e){return e.s<0},Unit:function(e){return o(e.value)},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);r(6);t.name="isNegative",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("ceil",{number:Math.ceil,Complex:function(e){return e.ceil()},BigNumber:function(e){return e.ceil()},Fraction:function(e){return e.ceil()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\left\\lceil${args[0]}\\right\\rceil"},o}var i=r(19);t.name="ceil",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("cube",{number:function(e){return e*e*e},Complex:function(e){return e.mul(e).mul(e)},BigNumber:function(e){return e.times(e).times(e)},Fraction:function(e){return e.pow(3)},"Array | Matrix":function(e){return i(e,o,!0)},Unit:function(e){return e.pow(3)}});return o.toTex={1:"\\left(${args[0]}\\right)^3"},o}var i=r(19);t.name="cube",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(81)),s=r(32),u=n(r(369)),c=n(r(61)),f=n(r(62)),l=n(r(85)),p=n(r(63)),h=n(r(57)),m=n(r(58)),d=i("dotDivide",{"any, any":a,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,a,!1);break;default:r=u(t,e,a,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,a,!1);break;default:r=h(e,t,a)}}return r},"Array, Array":function(e,t){return d(o(e),o(t)).valueOf()},"Array, Matrix":function(e,t){return d(o(e),t)},"Matrix, Array":function(e,t){return d(e,o(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,a,!1);break;default:r=m(e,t,a,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=p(t,e,a,!0);break;default:r=m(t,e,a,!0)}return r},"Array, any":function(e,t){return m(o(e),t,a,!1).valueOf()},"any, Array":function(e,t){return m(o(t),e,a,!0).valueOf()}});return d.toTex={2:"\\left(${args[0]}"+s.operators.dotDivide+"${args[1]}\\right)"},d}t.name="dotDivide",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(48)),s=e.SparseMatrix,u=function(e,t,r,n){var u=e._data,c=e._size,f=e._datatype,l=t._values,p=t._index,h=t._ptr,m=t._size,d=t._datatype;if(c.length!==m.length)throw new i(c.length,m.length);if(c[0]!==m[0]||c[1]!==m[1])throw new RangeError("Dimension mismatch. Matrix A ("+c+") must match Matrix B ("+m+")");if(!l)throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");var g,v=c[0],y=c[1],x=a,b=0,w=r;"string"==typeof f&&f===d&&(g=f,x=o.find(a,[g,g]),b=o.convert(0,g),w=o.find(r,[g,g]));for(var N=[],E=[],M=[],A=0;y>A;A++){M[A]=E.length;for(var O=h[A],_=h[A+1],T=O;_>T;T++){var C=p[T],S=n?w(l[T],u[C][A]):w(u[C][A],l[T]);x(S,b)||(E.push(C),N.push(S))}}return M[y]=E.length,new s({values:N,index:E,ptr:M,size:[v,y],datatype:g})};return u}var i=r(42);t.name="algorithm02",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(80)),s=r(32),u=n(r(369)),c=n(r(371)),f=n(r(85)),l=n(r(57)),p=n(r(58)),h=i("dotMultiply",{"any, any":a,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,a,!1);break;default:r=u(t,e,a,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,a,!1);break;default:r=l(e,t,a)}}return r},"Array, Array":function(e,t){return h(o(e),o(t)).valueOf()},"Array, Matrix":function(e,t){return h(o(e),t)},"Matrix, Array":function(e,t){return h(e,o(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,a,!1);break;default:r=p(e,t,a,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,a,!0);break;default:r=p(t,e,a,!0)}return r},"Array, any":function(e,t){return p(o(e),t,a,!1).valueOf()},"any, Array":function(e,t){return p(o(t),e,a,!0).valueOf()}});return h.toTex={2:"\\left(${args[0]}"+s.operators.dotMultiply+"${args[1]}\\right)"},h}t.name="dotMultiply",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(48)),s=e.SparseMatrix,u=function(e,t,r){var n=e._values,u=e._index,c=e._ptr,f=e._size,l=e._datatype,p=t._values,h=t._index,m=t._ptr,d=t._size,g=t._datatype;if(f.length!==d.length)throw new i(f.length,d.length);if(f[0]!==d[0]||f[1]!==d[1])throw new RangeError("Dimension mismatch. Matrix A ("+f+") must match Matrix B ("+d+")");var v,y=f[0],x=f[1],b=a,w=0,N=r;"string"==typeof l&&l===g&&(v=l,b=o.find(a,[v,v]),w=o.convert(0,v),N=o.find(r,[v,v]));var E,M,A,O,_,T=n&&p?[]:void 0,C=[],S=[],z=new s({values:T,index:C,ptr:S,size:[y,x],datatype:v}),B=T?[]:void 0,k=[];for(M=0;x>M;M++){S[M]=C.length;var I=M+1;if(B)for(O=m[M],_=m[M+1],A=O;_>A;A++)E=h[A],k[E]=I,B[E]=p[A];for(O=c[M],_=c[M+1],A=O;_>A;A++)if(E=u[A],B){var P=k[E]===I?B[E]:w,R=N(n[A],P);b(R,w)||(C.push(E),T.push(R))}else C.push(E)}return S[x]=C.length,z};return u}var i=r(42);t.name="algorithm09",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(82)),s=r(32),u=n(r(61)),c=n(r(62)),f=n(r(85)),l=n(r(63)),p=n(r(57)),h=n(r(58)),m=i("dotPow",{"any, any":a,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,a,!1);break;default:r=u(t,e,a,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,a,!1);break;default:r=p(e,t,a)}}return r},"Array, Array":function(e,t){return m(o(e),o(t)).valueOf()},"Array, Matrix":function(e,t){return m(o(e),t)},"Matrix, Array":function(e,t){return m(e,o(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=h(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=l(t,e,m,!0);break;default:r=h(t,e,m,!0)}return r},"Array, any":function(e,t){return h(o(e),t,m,!1).valueOf()},"any, Array":function(e,t){return h(o(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+s.operators.dotPow+"${args[1]}\\right)"},m}t.name="dotPow",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("exp",{number:Math.exp,Complex:function(e){return e.exp()},BigNumber:function(e){return e.exp()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\exp\\left(${args[0]}\\right)"},o}var i=r(19);t.name="exp",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("floor",{number:Math.floor,Complex:function(e){return e.floor()},BigNumber:function(e){return e.floor()},Fraction:function(e){return e.floor()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\left\\lfloor${args[0]}\\right\\rfloor"},o}var i=r(19);t.name="floor",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(t,r){if(!t.isInt()||!r.isInt())throw new Error("Parameters in function gcd must be integer numbers");for(var n=new e.BigNumber(0);!r.isZero();){var i=t.mod(r);t=r,r=i}return t.lt(n)?t.neg():t}var s=n(r(52)),u=n(r(54)),c=n(r(55)),f=n(r(56)),l=n(r(57)),p=n(r(58)),h=o("gcd",{"number, number":i,"BigNumber, BigNumber":a,"Fraction, Fraction":function(e,t){return e.gcd(t)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,h);break;default:r=u(t,e,h,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,h,!1);break;default:r=l(e,t,h)}}return r},"Array, Array":function(e,t){return h(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return h(s(e),t)},"Matrix, Array":function(e,t){return h(e,s(t))},"Matrix, number | BigNumber":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,h,!1);break;default:r=p(e,t,h,!1)}return r},"number | BigNumber, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,h,!0);break;default:r=p(t,e,h,!0)}return r},"Array, number | BigNumber":function(e,t){return p(s(e),t,h,!1).valueOf()},"number | BigNumber, Array":function(e,t){return p(s(t),e,h,!0).valueOf()},"Array | Matrix | number | BigNumber, Array | Matrix | number | BigNumber, ...Array | Matrix | number | BigNumber":function(e,t,r){for(var n=h(e,t),i=0;i<r.length;i++)n=h(n,r[i]);return n}});return h.toTex="\\gcd\\left(${args}\\right)",h}function i(e,t){if(!o(e)||!o(t))throw new Error("Parameters in function gcd must be integer numbers");for(var r;0!=t;)r=e%t,e=t,t=r;return 0>e?-e:e}var o=r(6).isInteger;t.name="gcd",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e){for(var t=0,r=0,n=0;n<e.length;n++){var i=s(e[n]);p(r,i)?(t=f(t,f(c(r,i),c(r,i))),t=u(t,1),r=i):t=u(t,h(i)?f(c(i,r),c(i,r)):i)}return f(r,l(t))}var s=n(r(86)),u=n(r(53)),c=n(r(81)),f=n(r(80)),l=n(r(377)),p=n(r(60)),h=n(r(378)),m=o("hypot",{"... number | BigNumber":a,Array:function(e){return m.apply(m,i(e))},Matrix:function(e){return m.apply(m,i(e.toArray()))}});return m.toTex="\\hypot\\left(${args}\\right)",m}var i=r(40).flatten;t.name="hypot",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){function o(r){return r>=0||t.predictable?Math.sqrt(r):new e.Complex(r,0).sqrt()}var a=n("sqrt",{number:o,Complex:function(e){return e.sqrt()},BigNumber:function(e){return!e.isNegative()||t.predictable?e.sqrt():o(e.toNumber())},"Array | Matrix":function(e){return i(e,a,!0)},Unit:function(e){return e.pow(.5)}});return a.toTex={1:"\\sqrt{${args[0]}}"},a}var i=r(19);t.name="sqrt",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isPositive",{number:function(e){return e>0},BigNumber:function(e){return!e.isNeg()&&!e.isZero()&&!e.isNaN()},Fraction:function(e){return e.s>0&&e.n>0},Unit:function(e){return o(e.value)},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);r(6);t.name="isPositive",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(t,r){if(!t.isInt()||!r.isInt())throw new Error("Parameters in function lcm must be integer numbers");if(t.isZero()||r.isZero())return new e.BigNumber(0);for(var n=t.times(r);!r.isZero();){var i=r;r=t.mod(i),t=i}return n.div(t).abs()}var s=n(r(52)),u=n(r(369)),c=n(r(380)),f=n(r(85)),l=n(r(57)),p=n(r(58)),h=o("lcm",{"number, number":i,"BigNumber, BigNumber":a,"Fraction, Fraction":function(e,t){return e.lcm(t)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,h);break;default:r=u(t,e,h,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,h,!1);break;default:r=l(e,t,h)}}return r},"Array, Array":function(e,t){return h(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return h(s(e),t)},"Matrix, Array":function(e,t){return h(e,s(t))},"Matrix, number | BigNumber":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,h,!1);break;default:r=p(e,t,h,!1)}return r},"number | BigNumber, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,h,!0);break;default:r=p(t,e,h,!0)}return r},"Array, number | BigNumber":function(e,t){return p(s(e),t,h,!1).valueOf()},"number | BigNumber, Array":function(e,t){return p(s(t),e,h,!0).valueOf()},"Array | Matrix | number | BigNumber, Array | Matrix | number | BigNumber, ...Array | Matrix | number | BigNumber":function(e,t,r){for(var n=h(e,t),i=0;i<r.length;i++)n=h(n,r[i]);return n}});return h.toTex=void 0,h}function i(e,t){if(!o(e)||!o(t))throw new Error("Parameters in function lcm must be integer numbers");if(0==e||0==t)return 0;for(var r,n=e*t;0!=t;)r=t,t=e%r,e=r;return Math.abs(n/e)}var o=r(6).isInteger;t.name="lcm",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(48)),u=e.SparseMatrix,c=function(e,t,r){var n=e._values,c=e._size,f=e._datatype,l=t._values,p=t._size,h=t._datatype;if(c.length!==p.length)throw new o(c.length,p.length);if(c[0]!==p[0]||c[1]!==p[1])throw new RangeError("Dimension mismatch. Matrix A ("+c+") must match Matrix B ("+p+")");var m,d=c[0],g=c[1],v=s,y=0,x=r;"string"==typeof f&&f===h&&(m=f,v=a.find(s,[m,m]),y=a.convert(0,m),x=a.find(r,[m,m]));for(var b=n&&l?[]:void 0,w=[],N=[],E=new u({values:b,index:w,ptr:N,size:[d,g],datatype:m}),M=b?[]:void 0,A=[],O=[],_=0;g>_;_++){N[_]=w.length;var T=_+1;if(i(e,_,A,M,O,T,E,x),i(t,_,A,M,O,T,E,x),M)for(var C=N[_];C<w.length;){var S=w[C];if(O[S]===T){var z=M[S];v(z,y)?w.splice(C,1):(b.push(z),C++)}else w.splice(C,1)}else for(var B=N[_];B<w.length;){var k=w[B];O[k]!==T?w.splice(B,1):B++}}return N[g]=w.length,E};return c}var i=r(381),o=r(42);t.name="algorithm06",t.factory=n},function(e,t){"use strict";e.exports=function(e,t,r,n,i,o,a,s,u,c,f){var l,p,h,m,d=e._values,g=e._index,v=e._ptr,y=a._index;if(n)for(p=v[t],h=v[t+1],l=p;h>l;l++)m=g[l],r[m]!==o?(r[m]=o,y.push(m),c?(n[m]=u?s(d[l],f):s(f,d[l]),i[m]=o):n[m]=d[l]):(n[m]=u?s(d[l],n[m]):s(n[m],d[l]),i[m]=o);else for(p=v[t],h=v[t+1],l=p;h>l;l++)m=g[l],r[m]!==o?(r[m]=o,y.push(m)):i[m]=o}},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(81)),s=o("log",{number:function(r){return r>=0||t.predictable?Math.log(r):new e.Complex(r,0).log()},Complex:function(e){return e.log()},BigNumber:function(r){return!r.isNegative()||t.predictable?r.ln():new e.Complex(r.toNumber(),0).log()},"Array | Matrix":function(e){return i(e,s)},"any, any":function(e,t){return a(s(e),s(t))}});return s.toTex={1:"\\ln\\left(${args[0]}\\right)",2:"\\log_{${args[1]}}\\left(${args[0]}\\right)"},s}var i=r(19);t.name="log",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("log10",{number:function(r){return r>=0||t.predictable?o(r):new e.Complex(r,0).log().div(Math.LN10)},Complex:function(t){return new e.Complex(t).log().div(Math.LN10)},BigNumber:function(r){return!r.isNegative()||t.predictable?r.log():new e.Complex(r.toNumber(),0).log().div(Math.LN10)},"Array | Matrix":function(e){return i(e,a)}});return a.toTex={1:"\\log_{10}\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.log10||function(e){return Math.log(e)/Math.LN10};t.name="log10",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){if(t>0)return e-t*Math.floor(e/t);if(0===t)return e;throw new Error("Cannot calculate mod for a negative divisor")}var a=n(r(52)),s=r(32),u=n(r(369)),c=n(r(61)),f=n(r(79)),l=n(r(85)),p=n(r(63)),h=n(r(57)),m=n(r(58)),d=i("mod",{"number, number":o,"BigNumber, BigNumber":function(e,t){return t.isZero()?e:e.mod(t)},"Fraction, Fraction":function(e,t){return e.mod(t)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,d,!1);break;default:r=u(t,e,d,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,d,!1);break;default:r=h(e,t,d)}}return r},"Array, Array":function(e,t){return d(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return d(a(e),t)},"Matrix, Array":function(e,t){return d(e,a(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,d,!1);break;default:r=m(e,t,d,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=p(t,e,d,!0);break;default:r=m(t,e,d,!0)}return r},"Array, any":function(e,t){return m(a(e),t,d,!1).valueOf()},"any, Array":function(e,t){return m(a(t),e,d,!0).valueOf()}});return d.toTex={2:"\\left(${args[0]}"+s.operators.mod+"${args[1]}\\right)"},d}t.name="mod",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){var r=e.size();if(1==r.length){if(t===Number.POSITIVE_INFINITY||"inf"===t){var n=0;return e.forEach(function(e){var t=a(e);p(t,n)&&(n=t)},!0),n}if(t===Number.NEGATIVE_INFINITY||"-inf"===t){var i;return e.forEach(function(e){var t=a(e);i&&!h(t,i)||(i=t)},!0),i||0}if("fro"===t)return o(e,2);if("number"==typeof t&&!isNaN(t)){if(!l(t,0)){var m=0;return e.forEach(function(e){m=s(u(a(e),t),m)},!0),u(m,1/t)}return Number.POSITIVE_INFINITY}throw new Error("Unsupported parameter value")}if(2==r.length){if(1===t){var v=[],y=0;return e.forEach(function(e,t){var r=t[1],n=s(v[r]||0,a(e));p(n,y)&&(y=n),v[r]=n},!0),y}if(t===Number.POSITIVE_INFINITY||"inf"===t){var x=[],b=0;return e.forEach(function(e,t){var r=t[0],n=s(x[r]||0,a(e));p(n,b)&&(b=n),x[r]=n},!0),b}if("fro"===t)return c(d(f(g(e),e)));if(2===t)throw new Error("Unsupported parameter value, missing implementation of matrix singular value decomposition");throw new Error("Unsupported parameter value")}}var a=n(r(86)),s=n(r(51)),u=n(r(82)),c=n(r(377)),f=n(r(84)),l=n(r(48)),p=n(r(64)),h=n(r(60)),m=n(r(52)),d=n(r(386)),g=n(r(344)),v=i("norm",{number:Math.abs,Complex:function(e){return e.abs()},BigNumber:function(e){return e.abs()},"boolean | null":function(e){return Math.abs(e)},Array:function(e){return o(m(e),2)},Matrix:function(e){return o(e,2)},"number | Complex | BigNumber | boolean | null, number | BigNumber | string":function(e){return v(e)},"Array, number | BigNumber | string":function(e,t){return o(m(e),t)},"Matrix, number | BigNumber | string":function(e,t){return o(e,t)}});return v.toTex={1:"\\left\\|${args[0]}\\right\\|",2:void 0},v}t.name="norm",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(51)),c=a("trace",{Array:function(e){return c(s(e))},Matrix:function(e){var t;switch(e.storage()){case"dense":t=f(e);break;case"sparse":t=l(e)}return t},any:i}),f=function(e){var t=e._size,r=e._data;switch(t.length){case 1:if(1==t[0])return i(r[0]);throw new RangeError("Matrix must be square (size: "+o(t)+")");case 2:var n=t[0],a=t[1];if(n===a){for(var s=0,c=0;n>c;c++)s=u(s,r[c][c]);return s}throw new RangeError("Matrix must be square (size: "+o(t)+")");default:throw new RangeError("Matrix must be two dimensional (size: "+o(t)+")")}},l=function(e){var t=e._values,r=e._index,n=e._ptr,i=e._size,a=i[0],s=i[1];if(a===s){var c=0;if(t.length>0)for(var f=0;s>f;f++)for(var l=n[f],p=n[f+1],h=l;p>h;h++){var m=r[h];if(m===f){c=u(c,t[h]);break}if(m>f)break}return c}throw new RangeError("Matrix must be square (size: "+o(i)+")")};return c.toTex={1:"\\mathrm{tr}\\left(${args[0]}\\right)"},c}var i=r(3).clone,o=r(23).format;t.name="trace",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(t,r){var n=e.BigNumber.precision,i=e.BigNumber.clone({precision:n+2}),o=new e.BigNumber(0),a=new i(1),s=r.isNegative();if(s&&(r=r.neg()),r.isZero())throw new Error("Root must be non-zero");if(t.isNegative()&&!r.abs().mod(2).equals(1))throw new Error("Root must be odd when a is negative.");if(t.isZero())return s?new i(1/0):0;if(!t.isFinite())return s?o:t;var u=t.abs().pow(a.div(r));return u=t.isNeg()?u.neg():u,new e.BigNumber((s?a.div(u):u).toPrecision(n))}var u=n(r(52)),c=n(r(54)),f=n(r(369)),l=n(r(380)),p=n(r(85)),h=n(r(57)),m=n(r(58)),d=a("nthRoot",{
number:function(e){return i(e,2)},"number, number":i,BigNumber:function(t){return s(t,new e.BigNumber(2))},Complex:function(e){return o(e,2)},"Complex, number":o,"BigNumber, BigNumber":s,"Array | Matrix":function(e){return d(e,2)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":if(1!==t.density())throw new Error("Root must be non-zero");r=l(e,t,d);break;default:r=f(t,e,d,!0)}break;default:switch(t.storage()){case"sparse":if(1!==t.density())throw new Error("Root must be non-zero");r=c(e,t,d,!1);break;default:r=h(e,t,d)}}return r},"Array, Array":function(e,t){return d(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return d(u(e),t)},"Matrix, Array":function(e,t){return d(e,u(t))},"Matrix, number | BigNumber":function(e,t){var r;switch(e.storage()){case"sparse":r=p(e,t,d,!1);break;default:r=m(e,t,d,!1)}return r},"number | BigNumber, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":if(1!==t.density())throw new Error("Root must be non-zero");r=p(t,e,d,!0);break;default:r=m(t,e,d,!0)}return r},"Array, number | BigNumber":function(e,t){return d(u(e),t).valueOf()},"number | BigNumber, Array":function(e,t){return d(e,u(t)).valueOf()}});return d.toTex={2:"\\sqrt[${args[1]}]{${args[0]}}"},d}function i(e,t){var r=0>t;if(r&&(t=-t),0===t)throw new Error("Root must be non-zero");if(0>e&&Math.abs(t)%2!=1)throw new Error("Root must be odd when a is negative.");if(0==e)return r?1/0:0;if(!isFinite(e))return r?0:e;var n=Math.pow(Math.abs(e),1/t);return n=0>e?-n:n,r?1/n:n}function o(e,t){if(0>t)throw new Error("Root must be greater than zero");if(0===t)throw new Error("Root must be non-zero");if(t%1!==0)throw new Error("Root must be an integer");for(var r=e.arg(),n=e.abs(),i=[],o=Math.pow(n,1/t),a=0;t>a;a++)i.push({r:o,phi:(r+2*Math.PI*a)/t});return i}t.name="nthRoot",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var c=n(r(52)),f=n(r(48)),l=n(r(389)),p=n(r(85)),h=n(r(63)),m=n(r(58)),d=a("round",{number:Math.round,"number, number":function(e,t){if(!o(t))throw new TypeError(u);if(0>t||t>15)throw new Error("Number of decimals in function round must be in te range of 0-15");return i(e,t)},Complex:function(e){return e.round()},"Complex, number":function(e,t){if(t%1)throw new TypeError(u);return e.round(t)},"Complex, BigNumber":function(e,t){if(!t.isInteger())throw new TypeError(u);var r=t.toNumber();return e.round(r)},"number, BigNumber":function(t,r){if(!r.isInteger())throw new TypeError(u);return new e.BigNumber(t).toDecimalPlaces(r.toNumber())},BigNumber:function(e){return e.toDecimalPlaces(0)},"BigNumber, BigNumber":function(e,t){if(!t.isInteger())throw new TypeError(u);return e.toDecimalPlaces(t.toNumber())},Fraction:function(e){return e.round()},"Fraction, number":function(e,t){if(t%1)throw new TypeError(u);return e.round(t)},"Array | Matrix":function(e){return s(e,d,!0)},"Matrix, number | BigNumber":function(e,t){var r;switch(e.storage()){case"sparse":r=p(e,t,d,!1);break;default:r=m(e,t,d,!1)}return r},"number | Complex | BigNumber, Matrix":function(e,t){if(!f(e,0)){var r;switch(t.storage()){case"sparse":r=h(t,e,d,!0);break;default:r=m(t,e,d,!0)}return r}return l(t.size(),t.storage())},"Array, number | BigNumber":function(e,t){return m(c(e),t,d,!1).valueOf()},"number | Complex | BigNumber, Array":function(e,t){return m(c(t),e,d,!0).valueOf()}});return d.toTex={1:"\\left\\lfloor${args[0]}\\right\\rceil",2:void 0},d}function i(e,t){return parseFloat(a(e,t))}var o=r(6).isInteger,a=r(6).toFixed,s=r(19),u="Number of decimals in function round must be an integer";t.name="round",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(t,r){var n=u(t),i=n?new e.BigNumber(0):0;if(c(t),r){var a=f(r);return t.length>0?a.resize(t,i):a}var s=[];return t.length>0?o(s,t,i):s}function u(e){var t=!1;return e.forEach(function(e,r,n){e&&e.isBigNumber===!0&&(t=!0,n[r]=e.toNumber())}),t}function c(e){e.forEach(function(e){if("number"!=typeof e||!i(e)||0>e)throw new Error("Parameters in function zeros must be positive integers")})}var f=n(r(52)),l=a("zeros",{"":function(){return"Array"===t.matrix?s([]):s([],"default")},"...number | BigNumber | string":function(e){var r=e[e.length-1];if("string"==typeof r){var n=e.pop();return s(e,n)}return"Array"===t.matrix?s(e):s(e,"default")},Array:s,Matrix:function(e){var t=e.storage();return s(e.valueOf(),t)},"Array | Matrix, string":function(e,t){return s(e.valueOf(),t)}});return l.toTex=void 0,l}var i=r(6).isInteger,o=r(40).resize;t.name="zeros",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("sign",{number:i.sign,Complex:function(e){return e.sign()},BigNumber:function(t){return new e.BigNumber(t.cmp(0))},Fraction:function(t){return new e.Fraction(t.s,1)},"Array | Matrix":function(e){return o(e,a,!0)},Unit:function(e){return a(e.value)}});return a.toTex={1:"\\mathrm{${name}}\\left(${args[0]}\\right)"},a}var i=r(6),o=r(19);t.name="sign",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("square",{number:function(e){return e*e},Complex:function(e){return e.mul(e)},BigNumber:function(e){return e.times(e)},Fraction:function(e){return e.mul(e)},"Array | Matrix":function(e){return i(e,o,!0)},Unit:function(e){return e.pow(2)}});return o.toTex={1:"\\left(${args[0]}\\right)^2"},o}var i=r(19);t.name="square",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=o("unaryPlus",{number:function(e){return e},Complex:function(e){return e},BigNumber:function(e){return e},Fraction:function(e){return e},Unit:function(e){return e.clone()},"Array | Matrix":function(e){return i(e,s,!0)},"boolean | string | null":function(r){return"BigNumber"==t.number?new e.BigNumber(+r):+r}});return s.toTex={1:a.operators.unaryPlus+"\\left(${args[0]}\\right)"},s}var i=r(19);t.name="unaryPlus",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,r){var n,o,a,s=0,c=1,f=1,l=0;if(!i(e)||!i(r))throw new Error("Parameters in function xgcd must be integer numbers");for(;r;)o=Math.floor(e/r),a=e%r,n=s,s=c-o*s,c=n,n=f,f=l-o*f,l=n,e=r,r=a;var p;return p=0>e?[-e,-c,-l]:[e,e?c:0,l],"Array"===t.matrix?p:u(p)}function s(r,n){var i,o,a,s=new e.BigNumber(0),c=new e.BigNumber(1),f=s,l=c,p=c,h=s;if(!r.isInt()||!n.isInt())throw new Error("Parameters in function xgcd must be integer numbers");for(;!n.isZero();)o=r.div(n).floor(),a=r.mod(n),i=f,f=l.minus(o.times(f)),l=i,i=p,p=h.minus(o.times(p)),h=i,r=n,n=a;var m;return m=r.lt(s)?[r.neg(),l.neg(),h.neg()]:[r,r.isZero()?0:l,h],"Array"===t.matrix?m:u(m)}var u=n(r(52)),c=o("xgcd",{"number, number":a,"BigNumber, BigNumber":s});return c.toTex=void 0,c}var i=r(6).isInteger;t.name="xgcd",t.factory=n},function(e,t,r){e.exports=[r(395),r(399),r(400),r(402),r(404),r(407),r(409)]},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(369)),f=n(r(380)),l=n(r(85)),p=n(r(57)),h=n(r(58)),m=a("bitAnd",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function bitAnd");return e&t},"BigNumber, BigNumber":o,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=c(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,m,!1);break;default:r=p(e,t,m)}}return r},"Array, Array":function(e,t){return m(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return m(u(e),t)},"Matrix, Array":function(e,t){return m(e,u(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,m,!1);break;default:r=h(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=l(t,e,m,!0);break;default:r=h(t,e,m,!0)}return r},"Array, any":function(e,t){return h(u(e),t,m,!1).valueOf()},"any, Array":function(e,t){return h(u(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+s.operators.bitAnd+"${args[1]}\\right)"},m}var i=r(6).isInteger,o=r(396);t.name="bitAnd",t.factory=n},function(e,t,r){var n=r(397);e.exports=function(e,t){if(e.isFinite()&&!e.isInteger()||t.isFinite()&&!t.isInteger())throw new Error("Integers expected in function bitAnd");var r=e.constructor;if(e.isNaN()||t.isNaN())return new r(NaN);if(e.isZero()||t.eq(-1)||e.eq(t))return e;if(t.isZero()||e.eq(-1))return t;if(!e.isFinite()||!t.isFinite()){if(!e.isFinite()&&!t.isFinite())return e.isNegative()==t.isNegative()?e:new r(0);if(!e.isFinite())return t.isNegative()?e:e.isNegative()?new r(0):t;if(!t.isFinite())return e.isNegative()?t:t.isNegative()?new r(0):e}return n(e,t,function(e,t){return e&t})}},function(e,t,r){function n(e){for(var t=e.d,r=t[0]+"",n=1;n<t.length;++n){for(var i=t[n]+"",o=7-i.length;o--;)i="0"+i;r+=i}var a;for(a=r.length-1;"0"==r.charAt(a);--a);var s=e.e,u=r.slice(0,a+1||1),c=u.length;if(s>0)if(++s>c)for(s-=c;s--;u+="0");else c>s&&(u=u.slice(0,s)+"."+u.slice(s));for(var f=[0],n=0;n<u.length;){for(var l=f.length;l--;f[l]*=10);f[0]+=u.charAt(n++)<<0;for(var a=0;a<f.length;++a)f[a]>1&&(null==f[a+1]&&(f[a+1]=0),f[a+1]+=f[a]>>1,f[a]&=1)}return f.reverse()}var i=r(398);e.exports=function(e,t,r){var o,a,s=e.constructor,u=+(e.s<0),c=+(t.s<0);if(u){o=n(i(e));for(var f=0;f<o.length;++f)o[f]^=1}else o=n(e);if(c){a=n(i(t));for(var f=0;f<a.length;++f)a[f]^=1}else a=n(t);var l,p,h;o.length<=a.length?(l=o,p=a,h=u):(l=a,p=o,h=c);var m=l.length,d=p.length,g=1^r(u,c),v=new s(1^g),y=new s(1),x=new s(2),b=s.precision;for(s.config({precision:1e9});m>0;)r(l[--m],p[--d])==g&&(v=v.plus(y)),y=y.times(x);for(;d>0;)r(h,p[--d])==g&&(v=v.plus(y)),y=y.times(x);return s.config({precision:b}),0==g&&(v.s=-v.s),v}},function(e,t){e.exports=function(e){if(e.isFinite()&&!e.isInteger())throw new Error("Integer expected in function bitNot");var t=e.constructor,r=t.precision;t.config({precision:1e9});var e=e.plus(new t(1));return e.s=-e.s||null,t.config({precision:r}),e}},function(e,t,r){"use strict";function n(e,t,n,s){var u=r(32),c=s("bitNot",{number:function(e){if(!a(e))throw new Error("Integer expected in function bitNot");return~e},BigNumber:o,"Array | Matrix":function(e){return i(e,c)}});return c.toTex={1:u.operators.bitNot+"\\left(${args[0]}\\right)"},c}var i=r(19),o=r(398),a=r(6).isInteger;t.name="bitNot",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(54)),f=n(r(55)),l=n(r(56)),p=n(r(57)),h=n(r(58)),m=a("bitOr",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function bitOr");return e|t},"BigNumber, BigNumber":o,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,m);break;default:r=c(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,m,!1);break;default:r=p(e,t,m)}}return r},"Array, Array":function(e,t){return m(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return m(u(e),t)},"Matrix, Array":function(e,t){return m(e,u(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,m,!1);break;default:r=h(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=l(t,e,m,!0);break;default:r=h(t,e,m,!0)}return r},"Array, any":function(e,t){return h(u(e),t,m,!1).valueOf()},"any, Array":function(e,t){return h(u(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+s.operators.bitOr+"${args[1]}\\right)"},m}var i=r(6).isInteger,o=r(401);t.name="bitOr",t.factory=n},function(e,t,r){var n=r(397);e.exports=function(e,t){if(e.isFinite()&&!e.isInteger()||t.isFinite()&&!t.isInteger())throw new Error("Integers expected in function bitOr");var r=e.constructor;if(e.isNaN()||t.isNaN())return new r(NaN);var i=new r(-1);return e.isZero()||t.eq(i)||e.eq(t)?t:t.isZero()||e.eq(i)?e:e.isFinite()&&t.isFinite()?n(e,t,function(e,t){return e|t}):!e.isFinite()&&!e.isNegative()&&t.isNegative()||e.isNegative()&&!t.isNegative()&&!t.isFinite()?i:e.isNegative()&&t.isNegative()?e.isFinite()?e:t:e.isFinite()?t:e}},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(61)),f=n(r(62)),l=n(r(63)),p=n(r(57)),h=n(r(58)),m=a("bitXor",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function bitXor");return e^t},"BigNumber, BigNumber":o,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,m);break;default:r=c(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,m,!1);break;default:r=p(e,t,m)}}return r},"Array, Array":function(e,t){return m(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return m(u(e),t)},"Matrix, Array":function(e,t){return m(e,u(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=l(e,t,m,!1);break;default:r=h(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=l(t,e,m,!0);break;default:r=h(t,e,m,!0)}return r},"Array, any":function(e,t){return h(u(e),t,m,!1).valueOf()},"any, Array":function(e,t){return h(u(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+s.operators.bitXor+"${args[1]}\\right)"},m}var i=r(6).isInteger,o=r(403);t.name="bitXor",t.factory=n},function(e,t,r){var n=r(397),i=r(398);e.exports=function(e,t){if(e.isFinite()&&!e.isInteger()||t.isFinite()&&!t.isInteger())throw new Error("Integers expected in function bitXor");var r=e.constructor;if(e.isNaN()||t.isNaN())return new r(NaN);if(e.isZero())return t;if(t.isZero())return e;if(e.eq(t))return new r(0);var o=new r(-1);return e.eq(o)?i(t):t.eq(o)?i(e):e.isFinite()&&t.isFinite()?n(e,t,function(e,t){return e^t}):e.isFinite()||t.isFinite()?new r(e.isNegative()==t.isNegative()?1/0:-(1/0)):o}},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(48)),f=n(r(389)),l=n(r(54)),p=n(r(369)),h=n(r(406)),m=n(r(56)),d=n(r(85)),g=n(r(57)),v=n(r(58)),y=a("leftShift",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function leftShift");return e<<t},"BigNumber, BigNumber":o,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=h(e,t,y,!1);break;default:r=p(t,e,y,!0)}break;default:switch(t.storage()){case"sparse":r=l(e,t,y,!1);break;default:r=g(e,t,y)}}return r},"Array, Array":function(e,t){return y(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return y(u(e),t)},"Matrix, Array":function(e,t){return y(e,u(t))},"Matrix, number | BigNumber":function(e,t){if(!c(t,0)){var r;switch(e.storage()){case"sparse":r=d(e,t,y,!1);break;default:r=v(e,t,y,!1)}return r}return e.clone()},"number | BigNumber, Matrix":function(e,t){if(!c(e,0)){var r;switch(t.storage()){case"sparse":r=m(t,e,y,!0);break;default:r=v(t,e,y,!0)}return r}return f(t.size(),t.storage())},"Array, number | BigNumber":function(e,t){return y(u(e),t).valueOf()},"number | BigNumber, Array":function(e,t){return y(e,u(t)).valueOf()}});return y.toTex={2:"\\left(${args[0]}"+s.operators.leftShift+"${args[1]}\\right)"},y}var i=r(6).isInteger,o=r(405);t.name="leftShift",t.factory=n},function(e,t){e.exports=function(e,t){if(e.isFinite()&&!e.isInteger()||t.isFinite()&&!t.isInteger())throw new Error("Integers expected in function leftShift");var r=e.constructor;return e.isNaN()||t.isNaN()||t.isNegative()&&!t.isZero()?new r(NaN):e.isZero()||t.isZero()?e:e.isFinite()||t.isFinite()?t.lt(55)?e.times(Math.pow(2,t.toNumber())+""):e.times(new r(2).pow(t)):new r(NaN)}},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(48)),s=e.SparseMatrix,u=function(e,t,r){var n=e._values,u=e._index,c=e._ptr,f=e._size,l=e._datatype,p=t._values,h=t._index,m=t._ptr,d=t._size,g=t._datatype;if(f.length!==d.length)throw new i(f.length,d.length);if(f[0]!==d[0]||f[1]!==d[1])throw new RangeError("Dimension mismatch. Matrix A ("+f+") must match Matrix B ("+d+")");if(!n||!p)throw new Error("Cannot perform operation on Pattern Sparse Matrices");var v,y=f[0],x=f[1],b=a,w=0,N=r;"string"==typeof l&&l===g&&(v=l,b=o.find(a,[v,v]),w=o.convert(0,v),N=o.find(r,[v,v]));for(var E,M,A,O,_=[],T=[],C=[],S=new s({values:_,index:T,ptr:C,size:[y,x],datatype:v}),z=[],B=[],k=0;x>k;k++){C[k]=T.length;var I=k+1;for(M=c[k],A=c[k+1],E=M;A>E;E++)O=u[E],B[O]=I,z[O]=n[E],T.push(O);for(M=m[k],A=m[k+1],E=M;A>E;E++)O=h[E],B[O]===I&&(z[O]=N(z[O],p[E]));for(E=C[k];E<T.length;){O=T[E];var P=z[O];b(P,w)?T.splice(E,1):(_.push(P),E++)}}return C[x]=T.length,S};return u}var i=r(42);t.name="algorithm08",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=r(32),u=n(r(52)),c=n(r(48)),f=n(r(389)),l=n(r(54)),p=n(r(369)),h=n(r(406)),m=n(r(56)),d=n(r(85)),g=n(r(57)),v=n(r(58)),y=a("rightArithShift",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function rightArithShift");return e>>t},"BigNumber, BigNumber":o,"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=h(e,t,y,!1);break;default:r=p(t,e,y,!0)}break;default:switch(t.storage()){case"sparse":r=l(e,t,y,!1);break;default:r=g(e,t,y)}}return r},"Array, Array":function(e,t){return y(u(e),u(t)).valueOf()},"Array, Matrix":function(e,t){return y(u(e),t)},"Matrix, Array":function(e,t){return y(e,u(t))},"Matrix, number | BigNumber":function(e,t){if(!c(t,0)){var r;switch(e.storage()){case"sparse":r=d(e,t,y,!1);break;default:r=v(e,t,y,!1)}return r}return e.clone()},"number | BigNumber, Matrix":function(e,t){if(!c(e,0)){var r;switch(t.storage()){case"sparse":r=m(t,e,y,!0);break;default:r=v(t,e,y,!0)}return r}return f(t.size(),t.storage())},"Array, number | BigNumber":function(e,t){return y(u(e),t).valueOf()},"number | BigNumber, Array":function(e,t){return y(e,u(t)).valueOf()}});return y.toTex={2:"\\left(${args[0]}"+s.operators.rightArithShift+"${args[1]}\\right)"},y}var i=r(6).isInteger,o=r(408);t.name="rightArithShift",t.factory=n},function(e,t){e.exports=function(e,t){if(e.isFinite()&&!e.isInteger()||t.isFinite()&&!t.isInteger())throw new Error("Integers expected in function rightArithShift");var r=e.constructor;return e.isNaN()||t.isNaN()||t.isNegative()&&!t.isZero()?new r(NaN):e.isZero()||t.isZero()?e:t.isFinite()?t.lt(55)?e.div(Math.pow(2,t.toNumber())+"").floor():e.div(new r(2).pow(t)).floor():new r(e.isNegative()?-1:e.isFinite()?0:NaN)}},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=n(r(52)),u=n(r(48)),c=n(r(389)),f=n(r(54)),l=n(r(369)),p=n(r(406)),h=n(r(56)),m=n(r(85)),d=n(r(57)),g=n(r(58)),v=o("rightLogShift",{"number, number":function(e,t){if(!i(e)||!i(t))throw new Error("Integers expected in function rightLogShift");return e>>>t},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=p(e,t,v,!1);break;default:r=l(t,e,v,!0)}break;default:switch(t.storage()){case"sparse":r=f(e,t,v,!1);break;default:r=d(e,t,v)}}return r},"Array, Array":function(e,t){return v(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return v(s(e),t)},"Matrix, Array":function(e,t){return v(e,s(t))},"Matrix, number | BigNumber":function(e,t){if(!u(t,0)){var r;switch(e.storage()){case"sparse":r=m(e,t,v,!1);break;default:r=g(e,t,v,!1)}return r}return e.clone()},"number | BigNumber, Matrix":function(e,t){if(!u(e,0)){var r;switch(t.storage()){case"sparse":r=h(t,e,v,!0);break;default:r=g(t,e,v,!0)}return r}return c(t.size(),t.storage())},"Array, number | BigNumber":function(e,t){return v(s(e),t).valueOf()},"number | BigNumber, Array":function(e,t){return v(e,s(t)).valueOf()}});return v.toTex={2:"\\left(${args[0]}"+a.operators.rightLogShift+"${args[1]}\\right)"},v}var i=r(6).isInteger;t.name="rightLogShift",t.factory=n},function(e,t,r){e.exports=[r(411),r(417),r(412),r(418)]},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(51)),a=n(r(412)),s=n(r(365)),u=n(r(416)),c=i("bellNumbers",{"number | BigNumber":function(e){if(!u(e)||s(e))throw new TypeError("Non-negative integer value expected in function bellNumbers");for(var t=0,r=0;e>=r;r++)t=o(t,a(e,r));return t}});return c.toTex={1:"\\mathrm{B}_{${args[0]}}"},c}t.name="bellNumbers",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(51)),a=n(r(77)),s=n(r(84)),u=n(r(326)),c=n(r(82)),f=n(r(413)),l=n(r(415)),p=n(r(365)),h=n(r(416)),m=n(r(64)),d=i("stirlingS2",{"number | BigNumber, number | BigNumber":function(e,t){if(!h(e)||p(e)||!h(t)||p(t))throw new TypeError("Non-negative integer value expected in function stirlingS2");if(m(t,e))throw new TypeError("k must be less than or equal to n in function stirlingS2");for(var r=f(t),n=0,i=0;t>=i;i++){var d=c(-1,a(t,i)),g=l(t,i),v=c(i,e);n=o(n,s(s(g,v),d))}return u(n,r)}});return d.toTex={2:"\\mathrm{S}\\left(${args}\\right)"},d}t.name="stirlingS2",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(414)),s=r(32),u=o("factorial",{number:function(e){if(0>e)throw new Error("Value must be non-negative");return a(e+1)},BigNumber:function(e){if(e.isNegative())throw new Error("Value must be non-negative");return a(e.plus(1))},"Array | Matrix":function(e){return i(e,u)}});return u.toTex={1:"\\left(${args[0]}\\right)"+s.operators.factorial},u}var i=r(19);t.name="factorial",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,u){function c(r){if(r.isZero())return new e.BigNumber(1);for(var n=t.precision+(0|Math.log(r.toNumber())),i=e.BigNumber.clone({precision:n}),o=new i(r),a=r.toNumber()-1;a>1;)o=o.times(a),a--;return new e.BigNumber(o.toPrecision(e.BigNumber.precision))}var f=n(r(84)),l=n(r(82)),p=u("gamma",{number:function(e){var t,r;if(o(e)){if(0>=e)return isFinite(e)?1/0:NaN;if(e>171)return 1/0;for(var n=e-2,i=e-1;n>1;)i*=n,n--;return 0==i&&(i=1),i}if(.5>e)return Math.PI/(Math.sin(Math.PI*e)*p(1-e));if(e>=171.35)return 1/0;if(e>85){var u=e*e,c=u*e,f=c*e,l=f*e;return Math.sqrt(2*Math.PI/e)*Math.pow(e/Math.E,e)*(1+1/(12*e)+1/(288*u)-139/(51840*c)-571/(2488320*f)+163879/(209018880*l)+5246819/(75246796800*l*e))}--e,r=s[0];for(var h=1;h<s.length;++h)r+=s[h]/(e+h);return t=e+a+.5,Math.sqrt(2*Math.PI)*Math.pow(t,e+.5)*Math.exp(-t)*r},Complex:function(t){var r,n;if(0==t.im)return p(t.re);t=new e.Complex(t.re-1,t.im),n=new e.Complex(s[0],0);for(var i=1;i<s.length;++i){var o=t.re+i,u=o*o+t.im*t.im;0!=u?(n.re+=s[i]*o/u,n.im+=-(s[i]*t.im)/u):n.re=s[i]<0?-(1/0):1/0}r=new e.Complex(t.re+a+.5,t.im);var c=Math.sqrt(2*Math.PI);t.re+=.5;var h=l(r,t);0==h.im?h.re*=c:0==h.re?h.im*=c:(h.re*=c,h.im*=c);var m=Math.exp(-r.re);return r.re=m*Math.cos(-r.im),r.im=m*Math.sin(-r.im),f(f(h,r),n)},BigNumber:function(t){if(t.isInteger())return t.isNegative()||t.isZero()?new e.BigNumber(1/0):c(t.minus(1));if(!t.isFinite())return new e.BigNumber(t.isNegative()?NaN:1/0);throw new Error("Integer BigNumber expected")},"Array | Matrix":function(e){return i(e,p)}});return p.toTex={1:"\\Gamma\\left(${args[0]}\\right)"},p}var i=r(19),o=r(6).isInteger,a=4.7421875,s=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];t.name="gamma",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("combinations",{"number, number":function(e,t){var r,n,i;if(!o(e)||0>e)throw new TypeError("Positive integer value expected in function combinations");if(!o(t)||0>t)throw new TypeError("Positive integer value expected in function combinations");if(t>e)throw new TypeError("k must be less than or equal to n");for(r=Math.max(t,e-t),n=1,i=1;e-r>=i;i++)n=n*(r+i)/i;return n},"BigNumber, BigNumber":function(t,r){var n,o,a,s,u=new e.BigNumber(1);if(!i(t)||!i(r))throw new TypeError("Positive integer value expected in function combinations");if(r.gt(t))throw new TypeError("k must be less than n in function combinations");for(n=t.minus(r),r.lt(n)&&(n=r),o=u,a=u,s=t.minus(n);a.lte(s);a=a.plus(1))o=o.times(n.plus(a)).dividedBy(a);return o}});return a.toTex={2:"\\binom{${args[0]}}{${args[1]}}"},a}function i(e){return e.isInteger()&&e.gte(0)}var o=r(6).isInteger;t.name="combinations",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("isInteger",{number:o.isInteger,BigNumber:function(e){return e.isInt()},Fraction:function(e){return 1===e.d&&isFinite(e.n)},"Array | Matrix":function(e){return i(e,a)}});return a}var i=r(19),o=r(6);t.name="isInteger",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(415)),a=n(r(53)),s=n(r(378)),u=n(r(416)),c=n(r(64)),f=i("composition",{"number | BigNumber, number | BigNumber":function(e,t){if(!(u(e)&&s(e)&&u(t)&&s(t)))throw new TypeError("Positive integer value expected in function composition");if(c(t,e))throw new TypeError("k must be less than or equal to n in function composition");return o(a(e,-1),a(t,-1))}});return f.toTex=void 0,f}t.name="composition",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(51)),a=n(r(326)),s=n(r(84)),u=n(r(415)),c=n(r(365)),f=n(r(416)),l=i("catalan",{"number | BigNumber":function(e){if(!f(e)||c(e))throw new TypeError("Non-negative integer value expected in function catalan");return a(u(s(e,2),e),o(e,1))}});return l.toTex={1:"\\mathrm{C}_{${args[0]}}"},l}t.name="catalan",t.factory=n},function(e,t,r){e.exports=[r(420),r(421),r(422),r(423)]},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("arg",{number:function(e){return Math.atan2(0,e)},Complex:function(e){return e.arg()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\arg\\left(${args[0]}\\right)"},o}var i=r(19);t.name="arg",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("conj",{number:function(e){return e},BigNumber:function(e){return e},Complex:function(e){return e.conjugate()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\left(${args[0]}\\right)^*"},o}var i=r(19);t.name="conj",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("im",{number:function(e){return 0},BigNumber:function(t){return new e.BigNumber(0)},Complex:function(e){return e.im},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\Im\\left\\lbrace${args[0]}\\right\\rbrace"},o}var i=r(19);t.name="im",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("re",{number:function(e){return e},BigNumber:function(e){return e},Complex:function(e){return e.re},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\Re\\left\\lbrace${args[0]}\\right\\rbrace"},o}var i=r(19);t.name="re",t.factory=n},function(e,t,r){e.exports=[r(425),r(426)]},function(e,t,r){"use strict";function n(e,t,n,i){function o(e){return 2===e.length&&"number"==typeof e[0]&&"number"==typeof e[1]}function a(e){return 3===e.length&&"number"==typeof e[0]&&"number"==typeof e[1]&&"number"==typeof e[2]}function s(e){return 4===e.length&&"number"==typeof e[0]&&"number"==typeof e[1]&&"number"==typeof e[2]&&"number"==typeof e[3]}function u(e,r,n,i){var o=e,a=n,s=d(o,r),u=d(a,i),c=s[0]*u[1]-u[0]*s[1];if(l(c)<t.epsilon)return null;var f=(u[0]*o[1]-u[1]*o[0]-u[0]*a[1]+u[1]*a[0])/c;return p(m(s,f),o)}function c(e,t,r,n,i,o,a,s,u,c,f,l){var p=(e-a)*(c-a)+(t-s)*(f-s)+(r-u)*(l-u),h=(c-a)*(n-e)+(f-s)*(i-t)+(l-u)*(o-r),m=(e-a)*(n-e)+(t-s)*(i-t)+(r-u)*(o-r),d=(c-a)*(c-a)+(f-s)*(f-s)+(l-u)*(l-u),g=(n-e)*(n-e)+(i-t)*(i-t)+(o-r)*(o-r),v=(p*h-m*d)/(g*d-h*h),y=(p+v*h)/d,x=e+v*(n-e),b=t+v*(i-t),w=r+v*(o-r),N=a+y*(c-a),E=s+y*(f-s),M=u+y*(l-u);return x===N&&b===E&&w===M?[x,b,w]:null}function f(e,t,r,n,i,o,a,s,u,c){var f=(c-e*a-t*s-r*u)/(n*a+i*s+o*u-e-t-r),l=e+f*(n-e),p=t+f*(i-t),h=r+f*(o-r);return[l,p,h]}var l=n(r(86)),p=n(r(51)),h=n(r(52)),m=n(r(84)),d=n(r(77)),g=i("intersect",{"Array, Array, Array":function(e,t,r){if(!a(e))throw new TypeError("Array with 3 numbers expected for first argument");if(!a(t))throw new TypeError("Array with 3 numbers expected for second argument");if(!s(r))throw new TypeError("Array with 4 numbers expected as third argument");return f(e[0],e[1],e[2],t[0],t[1],t[2],r[0],r[1],r[2],r[3])},"Array, Array, Array, Array":function(e,t,r,n){if(2===e.length){if(!o(e))throw new TypeError("Array with 2 numbers expected for first argument");if(!o(t))throw new TypeError("Array with 2 numbers expected for second argument");if(!o(r))throw new TypeError("Array with 2 numbers expected for third argument");if(!o(n))throw new TypeError("Array with 2 numbers expected for fourth argument");return u(e,t,r,n)}if(3===e.length){if(!a(e))throw new TypeError("Array with 3 numbers expected for first argument");if(!a(t))throw new TypeError("Array with 3 numbers expected for second argument");if(!a(r))throw new TypeError("Array with 3 numbers expected for third argument");if(!a(n))throw new TypeError("Array with 3 numbers expected for fourth argument");return c(e[0],e[1],e[2],t[0],t[1],t[2],r[0],r[1],r[2],n[0],n[1],n[2])}throw new TypeError("Arrays with two or thee dimensional points expected")},"Matrix, Matrix, Matrix":function(e,t,r){return h(g(e.valueOf(),t.valueOf(),r.valueOf()))},"Matrix, Matrix, Matrix, Matrix":function(e,t,r,n){return h(g(e.valueOf(),t.valueOf(),r.valueOf(),n.valueOf()))}});return g}t.name="intersect",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,s){var m=(n(r(52)),s("distance",{"Array, Array, Array":function(e,t,r){if(2==e.length&&2==t.length&&2==r.length){if(!i(e))throw new TypeError("Array with 2 numbers expected for first argument");if(!i(t))throw new TypeError("Array with 2 numbers expected for second argument");if(!i(r))throw new TypeError("Array with 2 numbers expected for third argument");var n=(r[1]-r[0])/(t[1]-t[0]),o=n*n*t[0],a=-1*(n*t[0]),s=e[1];return c(e[0],e[1],o,a,s)}throw new TypeError("Invalid Arguments: Try again")},"Object, Object, Object":function(e,t,r){if(2==Object.keys(e).length&&2==Object.keys(t).length&&2==Object.keys(r).length){if(!i(e))throw new TypeError("Values of pointX and pointY should be numbers");if(!i(t))throw new TypeError("Values of lineOnePtX and lineOnePtY should be numbers");if(!i(r))throw new TypeError("Values of lineTwoPtX and lineTwoPtY should be numbers");if(e.hasOwnProperty("pointX")&&e.hasOwnProperty("pointY")&&t.hasOwnProperty("lineOnePtX")&&t.hasOwnProperty("lineOnePtY")&&r.hasOwnProperty("lineTwoPtX")&&r.hasOwnProperty("lineTwoPtY")){var n=(r.lineTwoPtY-r.lineTwoPtX)/(t.lineOnePtY-t.lineOnePtX),o=n*n*t.lineOnePtX,a=-1*(n*t.lineOnePtX),s=e.pointX;return c(e.pointX,e.pointY,o,a,s)}throw new TypeError("Key names do not match")}throw new TypeError("Invalid Arguments: Try again")},"Array, Array":function(e,t){if(2==e.length&&3==t.length){if(!i(e))throw new TypeError("Array with 2 numbers expected for first argument");if(!o(t))throw new TypeError("Array with 3 numbers expected for second argument");return c(e[0],e[1],t[0],t[1],t[2])}if(3==e.length&&6==t.length){if(!o(e))throw new TypeError("Array with 3 numbers expected for first argument");if(!a(t))throw new TypeError("Array with 6 numbers expected for second argument");return f(e[0],e[1],e[2],t[0],t[1],t[2],t[3],t[4],t[5])}if(2==e.length&&2==t.length){if(!i(e))throw new TypeError("Array with 2 numbers expected for first argument");if(!i(t))throw new TypeError("Array with 2 numbers expected for second argument");return l(e[0],e[1],t[0],t[1])}if(3==e.length&&3==t.length){if(!o(e))throw new TypeError("Array with 3 numbers expected for first argument");if(!o(t))throw new TypeError("Array with 3 numbers expected for second argument");return p(e[0],e[1],e[2],t[0],t[1],t[2])}throw new TypeError("Invalid Arguments: Try again")},"Object, Object":function(e,t){if(2==Object.keys(e).length&&3==Object.keys(t).length){if(!i(e))throw new TypeError("Values of pointX and pointY should be numbers");if(!o(t))throw new TypeError("Values of xCoeffLine, yCoeffLine and constant should be numbers");if(e.hasOwnProperty("pointX")&&e.hasOwnProperty("pointY")&&t.hasOwnProperty("xCoeffLine")&&t.hasOwnProperty("yCoeffLine")&&t.hasOwnProperty("yCoeffLine"))return c(e.pointX,e.pointY,t.xCoeffLine,t.yCoeffLine,t.constant);throw new TypeError("Key names do not match")}if(3==Object.keys(e).length&&6==Object.keys(t).length){if(!o(e))throw new TypeError("Values of pointX, pointY and pointZ should be numbers");
if(!a(t))throw new TypeError("Values of x0, y0, z0, a, b and c should be numbers");if(e.hasOwnProperty("pointX")&&e.hasOwnProperty("pointY")&&t.hasOwnProperty("x0")&&t.hasOwnProperty("y0")&&t.hasOwnProperty("z0")&&t.hasOwnProperty("a")&&t.hasOwnProperty("b")&&t.hasOwnProperty("c"))return f(e.pointX,e.pointY,e.pointZ,t.x0,t.y0,t.z0,t.a,t.b,t.c);throw new TypeError("Key names do not match")}if(2==Object.keys(e).length&&2==Object.keys(t).length){if(!i(e))throw new TypeError("Values of pointOneX and pointOneY should be numbers");if(!i(t))throw new TypeError("Values of pointTwoX and pointTwoY should be numbers");if(e.hasOwnProperty("pointOneX")&&e.hasOwnProperty("pointOneY")&&t.hasOwnProperty("pointTwoX")&&t.hasOwnProperty("pointTwoY"))return l(e.pointOneX,e.pointOneY,t.pointTwoX,t.pointTwoY);throw new TypeError("Key names do not match")}if(3==Object.keys(e).length&&3==Object.keys(t).length){if(!o(e))throw new TypeError("Values of pointOneX, pointOneY and pointOneZ should be numbers");if(!o(t))throw new TypeError("Values of pointTwoX, pointTwoY and pointTwoZ should be numbers");if(e.hasOwnProperty("pointOneX")&&e.hasOwnProperty("pointOneY")&&e.hasOwnProperty("pointOneZ")&&t.hasOwnProperty("pointTwoX")&&t.hasOwnProperty("pointTwoY")&&t.hasOwnProperty("pointTwoZ"))return p(e.pointOneX,e.pointOneY,e.pointOneZ,t.pointTwoX,t.pointTwoY,t.pointTwoZ);throw new TypeError("Key names do not match")}throw new TypeError("Invalid Arguments: Try again")},Array:function(e){if(!u(e))throw new TypeError("Incorrect array format entered for pairwise distance calculation");return h(e)}}));return m}function i(e){return e.constructor!==Array&&(e=s(e)),"number"==typeof e[0]&&"number"==typeof e[1]}function o(e){return e.constructor!==Array&&(e=s(e)),"number"==typeof e[0]&&"number"==typeof e[1]&&"number"==typeof e[2]}function a(e){return e.constructor!==Array&&(e=s(e)),"number"==typeof e[0]&&"number"==typeof e[1]&&"number"==typeof e[2]&&"number"==typeof e[3]&&"number"==typeof e[4]&&"number"==typeof e[5]}function s(e){for(var t=Object.keys(e),r=[],n=0;n<t.length;n++)r.push(e[t[n]]);return r}function u(e){if(2==e[0].length&&"number"==typeof e[0][0]&&"number"==typeof e[0][1]){for(var t in e)if(2!=e[t].length||"number"!=typeof e[t][0]||"number"!=typeof e[t][1])return!1}else{if(3!=e[0].length||"number"!=typeof e[0][0]||"number"!=typeof e[0][1]||"number"!=typeof e[0][2])return!1;for(var t in e)if(3!=e[t].length||"number"!=typeof e[t][0]||"number"!=typeof e[t][1]||"number"!=typeof e[t][2])return!1}return!0}function c(e,t,r,n,i){var o=Math.abs(r*e+n*t+i),a=Math.pow(r*r+n*n,.5),s=o/a;return s}function f(e,t,r,n,i,o,a,s,u){var c=[(i-t)*u-(o-r)*s,(o-r)*a-(n-e)*u,(n-e)*s-(i-t)*a];c=Math.pow(c[0]*c[0]+c[1]*c[1]+c[2]*c[2],.5);var f=Math.pow(a*a+s*s+u*u,.5),l=c/f;return l}function l(e,t,r,n){var i=n-t,o=r-e,a=i*i+o*o,s=Math.pow(a,.5);return s}function p(e,t,r,n,i,o){var a=o-r,s=i-t,u=n-e,c=a*a+s*s+u*u,f=Math.pow(c,.5);return f}function h(e){for(var t=[],r=0;r<e.length-1;r++)for(var n=r+1;n<e.length;n++)2==e[0].length?t.push(l(e[r][0],e[r][1],e[n][0],e[n][1])):3==e[0].length&&t.push(p(e[r][0],e[r][1],e[r][2],e[n][0],e[n][1],e[n][2]));return t}t.name="distance",t.factory=n},function(e,t,r){e.exports=[r(428),r(429),r(431),r(432)]},function(e,t,r){"use strict";function n(e,t,n,i){var o=r(32),a=n(r(52)),s=n(r(389)),u=n(r(429)),c=(n(r(430)),n(r(369))),f=n(r(380)),l=n(r(85)),p=n(r(57)),h=n(r(58)),m=i("and",{"number, number":function(e,t){return!(!e||!t)},"Complex, Complex":function(e,t){return!(0===e.re&&0===e.im||0===t.re&&0===t.im)},"BigNumber, BigNumber":function(e,t){return!(e.isZero()||t.isZero()||e.isNaN()||t.isNaN())},"Unit, Unit":function(e,t){return m(e.value,t.value)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=c(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=c(e,t,m,!1);break;default:r=p(e,t,m)}}return r},"Array, Array":function(e,t){return m(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return m(a(e),t)},"Matrix, Array":function(e,t){return m(e,a(t))},"Matrix, any":function(e,t){if(u(t))return s(e.size(),e.storage());var r;switch(e.storage()){case"sparse":r=l(e,t,m,!1);break;default:r=h(e,t,m,!1)}return r},"any, Matrix":function(e,t){if(u(e))return s(e.size(),e.storage());var r;switch(t.storage()){case"sparse":r=l(t,e,m,!0);break;default:r=h(t,e,m,!0)}return r},"Array, any":function(e,t){return m(a(e),t).valueOf()},"any, Array":function(e,t){return m(e,a(t)).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+o.operators.and+"${args[1]}\\right)"},m}t.name="and",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=r(32),s=o("not",{number:function(e){return!e},Complex:function(e){return 0===e.re&&0===e.im},BigNumber:function(e){return e.isZero()||e.isNaN()},Unit:function(e){return s(e.value)},"Array | Matrix":function(e){return i(e,s)}});return s.toTex={1:a.operators.not+"\\left(${args[0]}\\right)"},s}var i=r(19);t.name="not",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isZero",{number:function(e){return 0===e},BigNumber:function(e){return e.isZero()},Complex:function(e){return 0===e.re&&0===e.im},Fraction:function(e){return 1===e.d&&0===e.n},Unit:function(e){return o(e.value)},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);r(6);t.name="isZero",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=r(32),a=n(r(52)),s=n(r(61)),u=n(r(79)),c=n(r(63)),f=n(r(57)),l=n(r(58)),p=i("or",{"number, number":function(e,t){return!(!e&&!t)},"Complex, Complex":function(e,t){return 0!==e.re||0!==e.im||0!==t.re||0!==t.im},"BigNumber, BigNumber":function(e,t){return!e.isZero()&&!e.isNaN()||!t.isZero()&&!t.isNaN()},"Unit, Unit":function(e,t){return p(e.value,t.value)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=u(e,t,p);break;default:r=s(t,e,p,!0)}break;default:switch(t.storage()){case"sparse":r=s(e,t,p,!1);break;default:r=f(e,t,p)}}return r},"Array, Array":function(e,t){return p(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return p(a(e),t)},"Matrix, Array":function(e,t){return p(e,a(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=c(e,t,p,!1);break;default:r=l(e,t,p,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=c(t,e,p,!0);break;default:r=l(t,e,p,!0)}return r},"Array, any":function(e,t){return l(a(e),t,p,!1).valueOf()},"any, Array":function(e,t){return l(a(t),e,p,!0).valueOf()}});return p.toTex={2:"\\left(${args[0]}"+o.operators.or+"${args[1]}\\right)"},p}t.name="or",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=r(32),a=n(r(52)),s=n(r(61)),u=n(r(62)),c=n(r(63)),f=n(r(57)),l=n(r(58)),p=i("xor",{"number, number":function(e,t){return!!(!!e^!!t)},"Complex, Complex":function(e,t){return(0!==e.re||0!==e.im)!=(0!==t.re||0!==t.im)},"BigNumber, BigNumber":function(e,t){return(!e.isZero()&&!e.isNaN())!=(!t.isZero()&&!t.isNaN())},"Unit, Unit":function(e,t){return p(e.value,t.value)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=u(e,t,p);break;default:r=s(t,e,p,!0)}break;default:switch(t.storage()){case"sparse":r=s(e,t,p,!1);break;default:r=f(e,t,p)}}return r},"Array, Array":function(e,t){return p(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return p(a(e),t)},"Matrix, Array":function(e,t){return p(e,a(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=c(e,t,p,!1);break;default:r=l(e,t,p,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=c(t,e,p,!0);break;default:r=l(t,e,p,!0)}return r},"Array, any":function(e,t){return l(a(e),t,p,!1).valueOf()},"any, Array":function(e,t){return l(a(t),e,p,!0).valueOf()}});return p.toTex={2:"\\left(${args[0]}"+o.operators.xor+"${args[1]}\\right)"},p}t.name="xor",t.factory=n},function(e,t,r){e.exports=[r(310),r(434),r(328),r(435),r(436),r(83),r(312),r(437),r(314),r(327),r(317),r(438),r(439),r(332),r(441),r(442),r(443),r(444),r(285),r(386),r(344),r(389)]},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t){var r=i(e),n=i(t);if(1!=r.length||1!=n.length||3!=r[0]||3!=n[0])throw new RangeError("Vectors with length 3 expected (Size A = ["+r.join(", ")+"], B = ["+n.join(", ")+"])");return[u(c(e[1],t[2]),c(e[2],t[1])),u(c(e[2],t[0]),c(e[0],t[2])),u(c(e[0],t[1]),c(e[1],t[0]))]}var s=n(r(52)),u=n(r(77)),c=n(r(84)),f=o("cross",{"Matrix, Matrix":function(e,t){return s(a(e.toArray(),t.toArray()))},"Matrix, Array":function(e,t){return s(a(e.toArray(),t))},"Array, Matrix":function(e,t){return s(a(e,t.toArray()))},"Array, Array":a});return f.toTex={2:"\\left(${args[0]}\\right)\\times\\left(${args[1]}\\right)"},f}var i=r(40).size;t.name="cross",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(e,t,r,n){if(!o(t))throw new TypeError("Second parameter in function diag must be an integer");var i=t>0?t:0,a=0>t?-t:0;switch(r.length){case 1:return u(e,t,n,r[0],a,i);case 2:return c(e,t,n,r,a,i)}throw new RangeError("Matrix for function diag must be 2 dimensional")}function u(t,r,n,i,o,a){var s=[i+o,i+a],u=e.Matrix.storage(n||"dense"),c=u.diagonal(s,t,r);return null!==n?c:c.valueOf()}function c(e,t,r,n,i,o){if(e&&e.isMatrix===!0){var a=e.diagonal(t);return null!==r?r!==a.storage()?f(a,r):a:a.valueOf()}for(var s=Math.min(n[0]-i,n[1]-o),u=[],c=0;s>c;c++)u[c]=e[c+i][c+o];return null!==r?f(u):u}var f=n(r(52)),l=a("diag",{Array:function(e){return s(e,0,i.size(e),null)},"Array, number":function(e,t){return s(e,t,i.size(e),null)},"Array, BigNumber":function(e,t){return s(e,t.toNumber(),i.size(e),null)},"Array, string":function(e,t){return s(e,0,i.size(e),t)},"Array, number, string":function(e,t,r){return s(e,t,i.size(e),r)},"Array, BigNumber, string":function(e,t,r){return s(e,t.toNumber(),i.size(e),r)},Matrix:function(e){return s(e,0,e.size(),e.storage())},"Matrix, number":function(e,t){return s(e,t,e.size(),e.storage())},"Matrix, BigNumber":function(e,t){return s(e,t.toNumber(),e.size(),e.storage())},"Matrix, string":function(e,t){return s(e,0,e.size(),t)},"Matrix, number, string":function(e,t,r){return s(e,t,e.size(),r)},"Matrix, BigNumber, string":function(e,t,r){return s(e,t.toNumber(),e.size(),r)}});return l.toTex=void 0,l}var i=r(40),o=(r(3).clone,r(6).isInteger);t.name="diag",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t){var r=i(e),n=i(t),o=r[0];if(1!==r.length||1!==n.length)throw new RangeError("Vector expected");if(r[0]!=n[0])throw new RangeError("Vectors must have equal length ("+r[0]+" != "+n[0]+")");if(0==o)throw new RangeError("Cannot calculate the dot product of empty vectors");for(var a=0,c=0;o>c;c++)a=s(a,u(e[c],t[c]));return a}var s=n(r(51)),u=n(r(84)),c=o("dot",{"Matrix, Matrix":function(e,t){return a(e.toArray(),t.toArray())},"Matrix, Array":function(e,t){return a(e.toArray(),t)},"Array, Matrix":function(e,t){return a(e,t.toArray())},"Array, Array":a});return c.toTex={2:"\\left(${args[0]}\\cdot${args[1]}\\right)"},c}var i=r(40).size;t.name="dot",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=a("flatten",{Array:function(e){return o(i(e))},Matrix:function(e){var t=o(i(e.toArray()));return s(t)}});return u.toTex=void 0,u}var i=r(3).clone,o=r(40).flatten;t.name="flatten",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(t,r){var n=u(t),i=n?new e.BigNumber(1):1;if(c(t),r){var a=f(r);return t.length>0?a.resize(t,i):a}var s=[];return t.length>0?o(s,t,i):s}function u(e){var t=!1;return e.forEach(function(e,r,n){e&&e.isBigNumber===!0&&(t=!0,n[r]=e.toNumber())}),t}function c(e){e.forEach(function(e){if("number"!=typeof e||!i(e)||0>e)throw new Error("Parameters in function ones must be positive integers")})}var f=n(r(52)),l=a("ones",{"":function(){return"Array"===t.matrix?s([]):s([],"default")},"...number | BigNumber | string":function(e){var r=e[e.length-1];if("string"==typeof r){var n=e.pop();return s(e,n)}return"Array"===t.matrix?s(e):s(e,"default")},Array:s,Matrix:function(e){var t=e.storage();return s(e.valueOf(),t)},"Array | Matrix, string":function(e,t){return s(e.valueOf(),t)}});return l.toTex=void 0,l}var i=r(6).isInteger,o=r(40).resize;t.name="ones",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e,t){return-c(e,t)}function s(e,t,r){if(!i(t)||0>t)throw new Error("k must be a non-negative integer");if(e&&e.isMatrix){var n=e.size();if(n.length>1)throw new Error("Only one dimensional matrices supported");return u(e.valueOf(),t,r)}return Array.isArray(e)?u(e,t,r):void 0}function u(e,t,r){if(t>=e.length)throw new Error("k out of bounds");for(var n=0,i=e.length-1;i>n;){for(var o=n,a=i,s=e[Math.floor(Math.random()*(i-n+1))+n];a>o;)if(r(e[o],s)>=0){var u=e[a];e[a]=e[o],e[o]=u,--a}else++o;r(e[o],s)>0&&--o,o>=t?i=o:n=o+1}return e[t]}var c=n(r(440));return o("partitionSelect",{"Array | Matrix, number":function(e,t){return s(e,t,c)},"Array | Matrix, number, string":function(e,t,r){if("asc"===r)return s(e,t,c);if("desc"===r)return s(e,t,a);throw new Error('Compare string must be "asc" or "desc"')},"Array | Matrix, number, function":s})}var i=r(6).isInteger;t.name="partitionSelect",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(79)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=a("compare",{"boolean, boolean":function(e,t){return e===t?0:e>t?1:-1},"number, number":function(e,r){return e===r||i(e,r,t.epsilon)?0:e>r?1:-1},"BigNumber, BigNumber":function(r,n){return r.eq(n)||o(r,n,t.epsilon)?new e.BigNumber(0):new e.BigNumber(r.cmp(n))},"Fraction, Fraction":function(t,r){return new e.Fraction(t.compare(r))},"Complex, Complex":function(){throw new TypeError("No ordering relation is defined for complex numbers")},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return h(e.value,t.value)},"string, string":function(e,t){return e===t?0:e>t?1:-1},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,h);break;default:r=u(t,e,h,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,h,!1);break;default:r=l(e,t,h)}}return r},"Array, Array":function(e,t){return h(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return h(s(e),t)},"Matrix, Array":function(e,t){return h(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,h,!1);break;default:r=p(e,t,h,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,h,!0);break;default:r=p(t,e,h,!0)}return r},"Array, any":function(e,t){return p(s(e),t,h,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,h,!0).valueOf()}});return h.toTex=void 0,h}var i=r(6).nearlyEqual,o=r(49);t.name="compare",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,f){function l(e,t,r){if(void 0!==r){if("string"!=typeof r||1!==r.length)throw new TypeError("Single character expected as defaultValue")}else r=" ";if(1!==t.length)throw new i(t.length,1);var n=t[0];if("number"!=typeof n||!a(n))throw new TypeError("Invalid size, must contain positive integers (size: "+s(t)+")");if(e.length>n)return e.substring(0,n);if(e.length<n){for(var o=e,u=0,c=n-e.length;c>u;u++)o+=r;return o}return e}var p=n(r(52)),h=function(e,r,n){if(2!=arguments.length&&3!=arguments.length)throw new o("resize",arguments.length,2,3);if(r&&r.isMatrix===!0&&(r=r.valueOf()),r.length&&r[0]&&r[0].isBigNumber===!0&&(r=r.map(function(e){return e&&e.isBigNumber===!0?e.toNumber():e})),e&&e.isMatrix===!0)return e.resize(r,n,!0);if("string"==typeof e)return l(e,r,n);var i=Array.isArray(e)?!1:"Array"!==t.matrix;if(0==r.length){for(;Array.isArray(e);)e=e[0];return u(e)}Array.isArray(e)||(e=[e]),e=u(e);var a=c.resize(e,r,n);return i?p(a):a};return h.toTex=void 0,h}var i=r(42),o=r(11),a=r(6).isInteger,s=r(23).format,u=r(3).clone,c=r(40);t.name="resize",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(52)),s=o("size",{Matrix:function(e){return a(e.size())},Array:i.size,string:function(e){return"Array"===t.matrix?[e.length]:a([e.length])},"number | Complex | BigNumber | Unit | boolean | null":function(e){return"Array"===t.matrix?[]:a([])}});return s.toTex=void 0,s}var i=r(40);t.name="size",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e){if("asc"===e)return f;if("desc"===e)return l;throw new Error('String "asc" or "desc" expected')}function s(e){if(1!==i(e).length)throw new Error("One dimensional array expected")}function u(e){if(1!==e.size().length)throw new Error("One dimensional matrix expected")}var c=n(r(52)),f=n(r(440)),l=function(e,t){return-f(e,t)},p=o("sort",{Array:function(e){return s(e),e.sort(f)},Matrix:function(e){return u(e),c(e.toArray().sort(f),e.storage())},"Array, function":function(e,t){return s(e),e.sort(t)},"Matrix, function":function(e,t){return u(e),c(e.toArray().sort(t),e.storage())},"Array, string":function(e,t){return s(e),e.sort(a(t))},"Matrix, string":function(e,t){return u(e),c(e.toArray().sort(a(t)),e.storage())}});return p.toTex=void 0,p}var i=r(40).size;t.name="sort",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=a("squeeze",{Array:function(e){return o.squeeze(i.clone(e))},Matrix:function(e){var t=o.squeeze(e.toArray());return Array.isArray(t)?s(t):t},any:function(e){return i.clone(e)}});return u.toTex=void 0,u}var i=r(3),o=r(40);t.name="squeeze",t.factory=n},function(e,t,r){e.exports=[r(415),r(413),r(414),r(446),r(448),r(449),r(450),r(452),r(453)]},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){var r=t.size().length,n=e.size().length;if(r>1)throw new Error("first object must be one dimensional");if(n>1)throw new Error("second object must be one dimensional");if(r!==n)throw new Error("Length of two vectors must be equal");var i=u(e);if(0===i)throw new Error("Sum of elements in first object must be non zero");var o=u(t);if(0===o)throw new Error("Sum of elements in second object must be non zero");var a=s(e,u(e)),h=s(t,u(t)),m=u(c(a,l(f(a,h))));return p(m)?m:Number.NaN}var a=n(r(52)),s=n(r(326)),u=n(r(447)),c=n(r(84)),f=n(r(368)),l=n(r(382)),p=n(r(89)),h=i("kldivergence",{"Array, Array":function(e,t){return o(a(e),a(t))},"Matrix, Array":function(e,t){return o(e,a(t))},"Array, Matrix":function(e,t){return o(a(e),t)},"Matrix, Matrix":function(e,t){return o(e,t)}});return h}t.name="kldivergence",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(r){var n=void 0;if(i(r,function(e){n=void 0===n?e:s(n,e)}),void 0===n)switch(t.number){case"number":return 0;case"BigNumber":return new e.BigNumber(0);case"Fraction":return new e.Fraction(0);default:return 0}return n}var s=n(r(53)),u=o("sum",{"Array | Matrix":function(e){return a(e)},"Array | Matrix, number | BigNumber":function(){throw new Error("sum(A, dim) is not yet supported")},"...":function(e){return a(e)}});return u.toTex=void 0,u}var i=r(321);t.name="sum",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=n(r(51)),s=n(r(84)),u=n(r(326)),c=n(r(413)),f=n(r(416)),l=n(r(378));return o("multinomial",{"Array | Matrix":function(e){var t=0,r=1;return i(e,function(e){if(!f(e)||!l(e))throw new TypeError("Positive integer value expected in function multinomial");t=a(t,e),r=s(r,c(e))}),u(c(t),r)}})}var i=r(321);t.name="multinomial",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(413)),u=a("permutations",{"number | BigNumber":s,"number, number":function(e,t){var r,n;if(!o(e)||0>e)throw new TypeError("Positive integer value expected in function permutations");if(!o(t)||0>t)throw new TypeError("Positive integer value expected in function permutations");if(t>e)throw new TypeError("second argument k must be less than or equal to first argument n");for(r=1,n=e-t+1;e>=n;n++)r*=n;return r},"BigNumber, BigNumber":function(t,r){var n,o;if(!i(t)||!i(r))throw new TypeError("Positive integer value expected in function permutations");if(r.gt(t))throw new TypeError("second argument k must be less than or equal to first argument n");for(n=new e.BigNumber(1),o=t.minus(r).plus(1);o.lte(t);o=o.plus(1))n=n.times(o);return n}});return u.toTex=void 0,u}function i(e){return e.isInteger()&&e.gte(0)}var o=r(6).isInteger;t.name="permutations",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(451)),a=o("uniform").pickRandom;return a.toTex=void 0,a}t.name="pickRandom",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(e){if(!f.hasOwnProperty(e))throw new Error("Unknown distribution "+e);var t=Array.prototype.slice.call(arguments,1),r=f[e].apply(this,t);return function(e){var t={random:function(e,t,n){var s,c,f;if(arguments.length>3)throw new i("random",arguments.length,0,3);if(1===arguments.length?o(e)?s=e:f=e:2===arguments.length?o(e)?(s=e,f=t):(c=e,f=t):(s=e,c=t,f=n),void 0===f&&(f=1),void 0===c&&(c=0),void 0!==s){var l=a(s.valueOf(),c,f,r);return s&&s.isMatrix===!0?u(l):l}return r(c,f)},randomInt:function(e,t,r){var s,c,f;if(arguments.length>3||arguments.length<1)throw new i("randomInt",arguments.length,1,3);if(1===arguments.length?o(e)?s=e:f=e:2===arguments.length?o(e)?(s=e,f=t):(c=e,f=t):(s=e,c=t,f=r),void 0===c&&(c=0),void 0!==s){var l=a(s.valueOf(),c,f,n);return s&&s.isMatrix===!0?u(l):l}return n(c,f)},pickRandom:function(e){if(1!==arguments.length)throw new i("pickRandom",arguments.length,1);if(e&&e.isMatrix===!0)e=e.valueOf();else if(!Array.isArray(e))throw new TypeError("Unsupported type of value in function pickRandom");if(c.size(e).length>1)throw new Error("Only one dimensional vectors supported");return e[Math.floor(Math.random()*e.length)]}},r=function(t,r){return t+e()*(r-t)},n=function(t,r){return Math.floor(t+e()*(r-t))},a=function(e,t,r,n){var i,o,s=[];if(e=e.slice(0),e.length>1)for(o=0,i=e.shift();i>o;o++)s.push(a(e,t,r,n));else for(o=0,i=e.shift();i>o;o++)s.push(n(t,r));return s};return t}(r)}var u=n(r(52)),c=r(40),f={uniform:function(){return Math.random},normal:function(){return function(){for(var e,t,r=-1;0>r||r>1;)e=Math.random(),t=Math.random(),r=1/6*Math.pow(-2*Math.log(e),.5)*Math.cos(2*Math.PI*t)+.5;return r}}};return s.toTex=void 0,s}var i=r(11),o=r(319);t.name="distribution",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(451)),a=o("uniform").random;return a.toTex=void 0,a}t.name="random",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(451)),a=o("uniform").randomInt;return a.toTex=void 0,a}t.name="randomInt",t.factory=n},function(e,t,r){e.exports=[r(440),r(455),r(88),r(64),r(351),r(60),r(456),r(457)]},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){if(Array.isArray(e)){if(Array.isArray(t)){var r=e.length;if(r!==t.length)return!1;for(var n=0;r>n;n++)if(!o(e[n],t[n]))return!1;return!0}return!1}return Array.isArray(t)?!1:a(e,t)}var a=n(r(88)),s=i("deepEqual",{"any, any":function(e,t){return o(e.valueOf(),t.valueOf())}});return s.toTex=void 0,s}t.name="deepEqual",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(62)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=r(32),m=a("smallerEq",{"boolean, boolean":function(e,t){return t>=e},"number, number":function(e,r){return r>=e||i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return e.lte(r)||o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return 1!==e.compare(t)},"Complex, Complex":function(){throw new TypeError("No ordering relation is defined for complex numbers")},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return m(e.value,t.value)},"string, string":function(e,t){return t>=e},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,m);break;default:r=u(t,e,m,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,m,!1);break;default:r=l(e,t,m)}}return r},"Array, Array":function(e,t){return m(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return m(s(e),t)},"Matrix, Array":function(e,t){return m(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,m,!1);break;default:r=p(e,t,m,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,m,!0);break;default:r=p(t,e,m,!0)}return r},"Array, any":function(e,t){return p(s(e),t,m,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,m,!0).valueOf()}});return m.toTex={2:"\\left(${args[0]}"+h.operators.smallerEq+"${args[1]}\\right)"},m}var i=r(6).nearlyEqual,o=r(49);t.name="smallerEq",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){var s=n(r(52)),u=n(r(61)),c=n(r(62)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=r(32),m=a("unequal",{"any, any":function(e,t){return null===e?null!==t:null===t?null!==e:void 0===e?void 0!==t:void 0===t?void 0!==e:d(e,t)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=c(e,t,d);break;default:r=u(t,e,d,!0)}break;default:switch(t.storage()){case"sparse":r=u(e,t,d,!1);break;default:r=l(e,t,d)}}return r},"Array, Array":function(e,t){return m(s(e),s(t)).valueOf()},"Array, Matrix":function(e,t){return m(s(e),t)},"Matrix, Array":function(e,t){return m(e,s(t))},"Matrix, any":function(e,t){var r;switch(e.storage()){case"sparse":r=f(e,t,d,!1);break;default:r=p(e,t,d,!1)}return r},"any, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,d,!0);break;default:r=p(t,e,d,!0)}return r},"Array, any":function(e,t){return p(s(e),t,d,!1).valueOf()},"any, Array":function(e,t){return p(s(t),e,d,!0).valueOf()}}),d=a("_unequal",{"boolean, boolean":function(e,t){return e!==t},"number, number":function(e,r){return!i(e,r,t.epsilon)},"BigNumber, BigNumber":function(e,r){return!o(e,r,t.epsilon)},"Fraction, Fraction":function(e,t){return!e.equals(t)},"Complex, Complex":function(e,t){return!e.equals(t)},"Unit, Unit":function(e,t){if(!e.equalBase(t))throw new Error("Cannot compare units with different base");return m(e.value,t.value)},"string, string":function(e,t){return e!==t}});return m.toTex={2:"\\left(${args[0]}"+h.operators.unequal+"${args[1]}\\right)"},m}var i=r(6).nearlyEqual,o=r(49);t.name="unequal",t.factory=n},function(e,t,r){e.exports=[r(320),r(325),r(459),r(330),r(460),r(461),r(462),r(463),r(447),r(464)]},function(e,t,r){"use strict";function n(e,t,n,a){function s(e){e=i(e.valueOf());var t=e.length;if(0==t)throw new Error("Cannot calculate median of an empty array");if(t%2==0){for(var r=t/2-1,n=l(e,r+1),o=e[r],a=0;r>a;++a)f(e[a],o)>0&&(o=e[a]);return m(o,n)}var s=l(e,(t-1)/2);return h(s)}var u=n(r(53)),c=n(r(81)),f=n(r(440)),l=n(r(439)),p=a("median",{"Array | Matrix":s,"Array | Matrix, number | BigNumber":function(e,t){throw new Error("median(A, dim) is not yet supported")},"...":function(e){if(o(e))throw new TypeError("Scalar values expected in function median");return s(e)}}),h=a({"number | BigNumber | Unit":function(e){return e}}),m=a({"number | BigNumber | Unit, number | BigNumber | Unit":function(e,t){return c(u(e,t),2)}});return p.toTex=void 0,p}var i=r(40).flatten,o=(r(322),r(323));t.name="median",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){function o(e){e=i(e.valueOf());var t=e.length;if(0==t)throw new Error("Cannot calculate mode of an empty array");var r={},n=[],o=0;for(var a in e)e[a]in r||(r[e[a]]=0),r[e[a]]++,r[e[a]]==o?n.push(e[a]):r[e[a]]>o&&(o=r[e[a]],n=[e[a]]);return n}var a=n("mode",{"Array | Matrix":o,"...":function(e){return o(e)}});return a}var i=r(40).flatten;t.name="mode",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){function a(e){var t=void 0;if(i(e,function(e){t=void 0===t?e:s(t,e)}),void 0===t)throw new Error("Cannot calculate prod of an empty array");return t}var s=n(r(80)),u=o("prod",{"Array | Matrix":a,"Array | Matrix, number | BigNumber":function(e,t){throw new Error("prod(A, dim) is not yet supported")},"...":function(e){return a(e)}});return u.toTex=void 0,u}var i=r(321);t.name="prod",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,u){function c(t,r,n){var a,u,c;if(arguments.length<2||arguments.length>3)throw new SyntaxError("Function quantileSeq requires two or three parameters");if(s(t)){if(n=n||!1,"boolean"==typeof n){if(u=t.valueOf(),o(r)){if(0>r)throw new Error("N/prob must be non-negative");if(1>=r)return f(u,r,n);if(r>1){if(!i(r))throw new Error("N must be a positive integer");var l=r+1;a=new Array(r);for(var p=0;r>p;)a[p]=f(u,++p/l,n);return a}}if(r&&r.isBigNumber){if(r.isNegative())throw new Error("N/prob must be non-negative");if(c=new r.constructor(1),r.lte(c))return f(u,r,n);if(r.gt(c)){if(!r.isInteger())throw new Error("N must be a positive integer");var h=r.toNumber();if(h>4294967295)throw new Error("N must be less than or equal to 2^32-1, as that is the maximum length of an Array");var l=new e.BigNumber(h+1);a=new Array(h);for(var p=0;h>p;)a[p]=f(u,new e.BigNumber(++p).div(l),n);return a}}if(Array.isArray(r)){a=new Array(r.length);for(var p=0;p<a.length;++p){var m=r[p];if(o(m)){if(0>m||m>1)throw new Error("Probability must be between 0 and 1, inclusive")}else{if(!m||!m.isBigNumber)throw new TypeError("Unexpected type of argument in function quantileSeq");if(c=new m.constructor(1),m.isNegative()||m.gt(c))throw new Error("Probability must be between 0 and 1, inclusive")}a[p]=f(u,m,n)}return a}throw new TypeError("Unexpected type of argument in function quantileSeq")}throw new TypeError("Unexpected type of argument in function quantileSeq")}throw new TypeError("Unexpected type of argument in function quantileSeq")}function f(e,t,r){var n=a(e),i=n.length;if(0===i)throw new Error("Cannot calculate quantile of an empty sequence");if(o(t)){var s=t*(i-1),u=s%1;if(0===u){var c=r?n[s]:h(n,s);return d(c),c}var f,g,v=Math.floor(s);if(r)f=n[v],g=n[v+1];else{g=h(n,v+1),f=n[v];for(var y=0;v>y;++y)m(n[y],f)>0&&(f=n[y])}return d(f),d(g),l(p(f,1-u),p(g,u))}var s=t.times(i-1);if(s.isInteger()){s=s.toNumber();var c=r?n[s]:h(n,s);return d(c),c}var f,g,v=s.floor(),u=s.minus(v),x=v.toNumber();if(r)f=n[x],g=n[x+1];else{g=h(n,x+1),f=n[x];for(var y=0;x>y;++y)m(n[y],f)>0&&(f=n[y])}d(f),d(g);var b=new u.constructor(1);return l(p(f,b.minus(u)),p(g,u))}var l=n(r(51)),p=n(r(84)),h=n(r(439)),m=n(r(440)),d=u({"number | BigNumber | Unit":function(e){return e}});return c}var i=r(6).isInteger,o=r(6).isNumber,a=r(40).flatten,s=r(319);t.name="quantileSeq",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){function o(e,t){if(0==e.length)throw new SyntaxError("Function std requires one or more parameters (0 provided)");return a(s.apply(null,arguments))}var a=n(r(377)),s=n(r(464)),u=i("std",{"Array | Matrix":o,"Array | Matrix, string":o,"...":function(e){return o(e)}});return u.toTex=void 0,u}t.name="std",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,a){function s(t,r){var n=0,i=0;if(0==t.length)throw new SyntaxError("Function var requires one or more parameters (0 provided)");if(o(t,function(e){n=u(n,e),i++}),0===i)throw new Error("Cannot calculate var of an empty array");var a=l(n,i);switch(n=0,o(t,function(e){var t=c(e,a);n=u(n,f(t,t))}),r){case"uncorrected":return l(n,i);case"biased":return l(n,i+1);case"unbiased":var s=n&&n.isBigNumber===!0?new e.BigNumber(0):0;return 1==i?s:l(n,i-1);default:throw new Error('Unknown normalization "'+r+'". Choose "unbiased" (default), "uncorrected", or "biased".')}}var u=n(r(53)),c=n(r(77)),f=n(r(80)),l=n(r(81)),p=a("variance",{"Array | Matrix":function(e){return s(e,i)},"Array | Matrix, string":s,"...":function(e){return s(e,i)}});return p.toTex="\\mathrm{Var}\\left(${args}\\right)",p}var i="unbiased",o=r(321);t.name="var",t.factory=n},function(e,t,r){e.exports=[r(90),r(466)]},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("print",{"string, Object":i,"string, Object, number":i});return o.toTex=void 0,o}function i(e,t,r){return e.replace(/\$([\w\.]+)/g,function(e,n){for(var i=n.split("."),s=t[i.shift()];i.length&&void 0!==s;){
var u=i.shift();s=u?s[u]:s+"."}return void 0!==s?o(s)?s:a(s,r):e})}var o=r(23).isString,a=r(23).format;t.name="print",t.factory=n},function(e,t,r){e.exports=[r(468),r(469),r(470),r(471),r(472),r(473),r(474),r(475),r(476),r(477),r(478),r(479),r(480),r(481),r(482),r(483),r(484),r(485),r(486),r(487),r(488),r(489),r(490),r(491),r(492)]},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("acos",{number:function(r){return r>=-1&&1>=r||t.predictable?Math.acos(r):new e.Complex(r,0).acos()},Complex:function(e){return e.acos()},BigNumber:function(e){return e.acos()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\cos^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="acos",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("acosh",{number:function(r){return r>=1||t.predictable?o(r):-1>=r?new e.Complex(Math.log(Math.sqrt(r*r-1)-r),Math.PI):new e.Complex(r,0).acosh()},Complex:function(e){return e.acosh()},BigNumber:function(e){return e.acosh()},"Array | Matrix":function(e){return i(e,a)}});return a.toTex={1:"\\cosh^{-1}\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.acosh||function(e){return Math.log(Math.sqrt(e*e-1)+e)};t.name="acosh",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("acot",{number:function(e){return Math.atan(1/e)},Complex:function(e){return e.acot()},BigNumber:function(t){return new e.BigNumber(1).div(t).atan()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\cot^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="acot",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("acoth",{number:function(r){return r>=1||-1>=r||t.predictable?isFinite(r)?(Math.log((r+1)/r)+Math.log(r/(r-1)))/2:0:new e.Complex(r,0).acoth()},Complex:function(e){return e.acoth()},BigNumber:function(t){return new e.BigNumber(1).div(t).atanh()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\coth^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="acoth",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("acsc",{number:function(r){return-1>=r||r>=1||t.predictable?Math.asin(1/r):new e.Complex(r,0).acsc()},Complex:function(e){return e.acsc()},BigNumber:function(t){return new e.BigNumber(1).div(t).asin()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\csc^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="acsc",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("acsch",{number:function(e){return e=1/e,Math.log(e+Math.sqrt(e*e+1))},Complex:function(e){return e.acsch()},BigNumber:function(t){return new e.BigNumber(1).div(t).asinh()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\mathrm{csch}^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="acsch",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("asec",{number:function(r){return-1>=r||r>=1||t.predictable?Math.acos(1/r):new e.Complex(r,0).asec()},Complex:function(e){return e.asec()},BigNumber:function(t){return new e.BigNumber(1).div(t).acos()},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\sec^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="asec",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,o){var a=(o.find(n(r(469)),["Complex"]),o("asech",{number:function(r){if(1>=r&&r>=-1||t.predictable){r=1/r;var n=Math.sqrt(r*r-1);return r>0||t.predictable?Math.log(n+r):new e.Complex(Math.log(n-r),Math.PI)}return new e.Complex(r,0).asech()},Complex:function(e){return e.asech()},BigNumber:function(t){return new e.BigNumber(1).div(t).acosh()},"Array | Matrix":function(e){return i(e,a)}}));return a.toTex={1:"\\mathrm{sech}^{-1}\\left(${args[0]}\\right)"},a}var i=r(19);t.name="asech",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("asin",{number:function(r){return r>=-1&&1>=r||t.predictable?Math.asin(r):new e.Complex(r,0).asin()},Complex:function(e){return e.asin()},BigNumber:function(e){return e.asin()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\sin^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="asin",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("asinh",{number:Math.asinh||function(e){return Math.log(Math.sqrt(e*e+1)+e)},Complex:function(e){return e.asinh()},BigNumber:function(e){return e.asinh()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\sinh^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="asinh",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("atan",{number:function(e){return Math.atan(e)},Complex:function(e){return e.atan()},BigNumber:function(e){return e.atan()},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\tan^{-1}\\left(${args[0]}\\right)"},o}var i=r(19);t.name="atan",t.factory=n},function(e,t,r){"use strict";function n(e,t,n,i){var o=n(r(52)),a=n(r(369)),s=n(r(61)),u=n(r(371)),c=n(r(85)),f=n(r(63)),l=n(r(57)),p=n(r(58)),h=i("atan2",{"number, number":Math.atan2,"BigNumber, BigNumber":function(t,r){return e.BigNumber.atan2(t,r)},"Matrix, Matrix":function(e,t){var r;switch(e.storage()){case"sparse":switch(t.storage()){case"sparse":r=u(e,t,h,!1);break;default:r=a(t,e,h,!0)}break;default:switch(t.storage()){case"sparse":r=s(e,t,h,!1);break;default:r=l(e,t,h)}}return r},"Array, Array":function(e,t){return h(o(e),o(t)).valueOf()},"Array, Matrix":function(e,t){return h(o(e),t)},"Matrix, Array":function(e,t){return h(e,o(t))},"Matrix, number | BigNumber":function(e,t){var r;switch(e.storage()){case"sparse":r=c(e,t,h,!1);break;default:r=p(e,t,h,!1)}return r},"number | BigNumber, Matrix":function(e,t){var r;switch(t.storage()){case"sparse":r=f(t,e,h,!0);break;default:r=p(t,e,h,!0)}return r},"Array, number | BigNumber":function(e,t){return p(o(e),t,h,!1).valueOf()},"number | BigNumber, Array":function(e,t){return p(o(t),e,h,!0).valueOf()}});return h.toTex={2:"\\mathrm{atan2}\\left(${args}\\right)"},h}t.name="atan2",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("atanh",{number:function(r){return 1>=r&&r>=-1||t.predictable?o(r):new e.Complex(r,0).atanh()},Complex:function(e){return e.atanh()},BigNumber:function(e){return e.atanh()},"Array | Matrix":function(e){return i(e,a,!0)}});return a.toTex={1:"\\tanh^{-1}\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.atanh||function(e){return Math.log((1+e)/(1-e))/2};t.name="atanh",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("cos",{number:Math.cos,Complex:function(e){return e.cos()},BigNumber:function(e){return e.cos()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function cos is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\cos\\left(${args[0]}\\right)"},o}var i=r(19);t.name="cos",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("cosh",{number:o,Complex:function(e){return e.cosh()},BigNumber:function(e){return e.cosh()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function cosh is no angle");return a(t.value)},"Array | Matrix":function(e){return i(e,a)}});return a.toTex={1:"\\cosh\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.cosh||function(e){return(Math.exp(e)+Math.exp(-e))/2};t.name="cosh",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("cot",{number:function(e){return 1/Math.tan(e)},Complex:function(e){return e.cot()},BigNumber:function(t){return new e.BigNumber(1).div(t.tan())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function cot is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\cot\\left(${args[0]}\\right)"},o}var i=r(19);t.name="cot",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("coth",{number:i,Complex:function(e){return e.coth()},BigNumber:function(t){return new e.BigNumber(1).div(t.tanh())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function coth is no angle");return a(t.value)},"Array | Matrix":function(e){return o(e,a)}});return a.toTex={1:"\\coth\\left(${args[0]}\\right)"},a}function i(e){var t=Math.exp(2*e);return(t+1)/(t-1)}var o=r(19);t.name="coth",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("csc",{number:function(e){return 1/Math.sin(e)},Complex:function(e){return e.csc()},BigNumber:function(t){return new e.BigNumber(1).div(t.sin())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function csc is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\csc\\left(${args[0]}\\right)"},o}var i=r(19);t.name="csc",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("csch",{number:i,Complex:function(e){return e.csch()},BigNumber:function(t){return new e.BigNumber(1).div(t.sinh())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function csch is no angle");return a(t.value)},"Array | Matrix":function(e){return o(e,a)}});return a.toTex={1:"\\mathrm{csch}\\left(${args[0]}\\right)"},a}function i(e){return 0==e?Number.POSITIVE_INFINITY:Math.abs(2/(Math.exp(e)-Math.exp(-e)))*a(e)}var o=r(19),a=r(6).sign;t.name="csch",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("sec",{number:function(e){return 1/Math.cos(e)},Complex:function(e){return e.sec()},BigNumber:function(t){return new e.BigNumber(1).div(t.cos())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function sec is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o)}});return o.toTex={1:"\\sec\\left(${args[0]}\\right)"},o}var i=r(19);t.name="sec",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("sech",{number:i,Complex:function(e){return e.sech()},BigNumber:function(t){return new e.BigNumber(1).div(t.cosh())},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function sech is no angle");return a(t.value)},"Array | Matrix":function(e){return o(e,a)}});return a.toTex={1:"\\mathrm{sech}\\left(${args[0]}\\right)"},a}function i(e){return 2/(Math.exp(e)+Math.exp(-e))}var o=r(19);t.name="sech",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("sin",{number:Math.sin,Complex:function(e){return e.sin()},BigNumber:function(e){return e.sin()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function sin is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\sin\\left(${args[0]}\\right)"},o}var i=r(19);t.name="sin",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("sinh",{number:o,Complex:function(e){return e.sinh()},BigNumber:function(e){return e.sinh()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function sinh is no angle");return a(t.value)},"Array | Matrix":function(e){return i(e,a,!0)}});return a.toTex={1:"\\sinh\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.sinh||function(e){return(Math.exp(e)-Math.exp(-e))/2};t.name="sinh",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("tan",{number:Math.tan,Complex:function(e){return e.tan()},BigNumber:function(e){return e.tan()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function tan is no angle");return o(t.value)},"Array | Matrix":function(e){return i(e,o,!0)}});return o.toTex={1:"\\tan\\left(${args[0]}\\right)"},o}var i=r(19);t.name="tan",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var a=n("tanh",{number:o,Complex:function(e){return e.tanh()},BigNumber:function(e){return e.tanh()},Unit:function(t){if(!t.hasBase(e.Unit.BASE_UNITS.ANGLE))throw new TypeError("Unit in function tanh is no angle");return a(t.value)},"Array | Matrix":function(e){return i(e,a,!0)}});return a.toTex={1:"\\tanh\\left(${args[0]}\\right)"},a}var i=r(19),o=Math.tanh||function(e){var t=Math.exp(2*e);return(t-1)/(t+1)};t.name="tanh",t.factory=n},function(e,t,r){e.exports=[r(494)]},function(e,t,r){"use strict";function n(e,t,n,i){var o=r(32),a=n(r(52)),s=n(r(57)),u=n(r(58)),c=i("to",{"Unit, Unit | string":function(e,t){return e.to(t)},"Matrix, Matrix":function(e,t){return s(e,t,c)},"Array, Array":function(e,t){return c(a(e),a(t)).valueOf()},"Array, Matrix":function(e,t){return c(a(e),t)},"Matrix, Array":function(e,t){return c(e,a(t))},"Matrix, any":function(e,t){return u(e,t,c,!1)},"any, Matrix":function(e,t){return u(t,e,c,!0)},"Array, any":function(e,t){return u(a(e),t,c,!1).valueOf()},"any, Array":function(e,t){return u(a(t),e,c,!0).valueOf()}});return c.toTex={2:"\\left(${args[0]}"+o.operators.to+"${args[1]}\\right)"},c}t.name="to",t.factory=n},function(e,t,r){e.exports=[r(496),r(416),r(365),r(89),r(378),r(497),r(430),r(498),r(91)]},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("clone",{any:i.clone});return o.toTex=void 0,o}var i=r(3);t.name="clone",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isPrime",{number:function(e){if(2>e)return!1;if(2==e)return!0;if(e%2==0)return!1;for(var t=3;e>=t*t;t+=2)if(e%t==0)return!1;return!0},BigNumber:function(t){if(t.lt(2))return!1;if(t.equals(2))return!0;if(t.mod(2).isZero())return!1;for(var r=e.BigNumber(3);r.times(r).lte(t);r=r.plus(1))if(t.mod(r).isZero())return!1;return!0},"Array | Matrix":function(e){return i(e,o)}});return o}var i=r(19);t.name="isPrime",t.factory=n},function(e,t,r){"use strict";function n(e,t,r,n){var o=n("isNaN",{number:function(e){return Number.isNaN(e)},BigNumber:function(e){return e.isNaN()},Fraction:function(e){return!1},Complex:function(e){return Number.isNaN(e.re)&&Number.isNaN(e.im)},Unit:function(e){return Number.isNaN(e.value)},"Array | Matrix":function(e){return i(e,Number.isNaN)}});return o}var i=r(19);r(6);t.name="isNaN",t.factory=n},function(e,t,r){e.exports=[r(500)]},function(e,t){"use strict";function r(e,t,r,n){return function(t,r){var n=e[r&&r.mathjs];return n&&"function"==typeof n.fromJSON?n.fromJSON(r):r}}t.name="reviver",t.path="json",t.factory=r},function(e,t,r){"use strict";var n=r(11),i=r(42),o=r(43);e.exports=[{name:"ArgumentsError",path:"error",factory:function(){return n}},{name:"DimensionError",path:"error",factory:function(){return i}},{name:"IndexError",path:"error",factory:function(){return o}}]}])});
//# sourceMappingURL=math.map

























































/** * Created by rebeccawolf on 7/28/16.
 


function deg2rad(degrees){
    var pi = Math.PI;
    return (degrees * (pi/180));

}

function displacement(thetaX, r, b, d, a) {
    return ( r*Math.cos(deg2rad(thetaX)) ) + Math.sqrt(Math.pow(b,2) - ( Math.pow((r*Math.sin(deg2rad(thetaX))+d),2) ));
}


function initializeSetup(mLmin, r, b, d, a) {

    // what is thetaX: 1st deriv of displacement
    var thetaX = 0;
    var firstDerivativeDisplacement = (-(r*Math.cos(deg2rad(thetaX))*(d+r*Math.sin(deg2rad(thetaX))))/Math.sqrt((Math.pow(b, 2))-(Math.pow((d+r*Math.sin(deg2rad(thetaX))), 2))))-r*Math.sin(deg2rad(thetaX));
    



    var thetaXArray = [];
    var displacementArray = [];
    var increment = 100;
    var stepSize = 360/increment;

    for( var i = 0; i <= increment; i++){
        thetaX_i = -90+stepSize*i;
        thetaXArray.push(thetaX_i);
        displacementArray.push(displacement(thetaX_i, r, b, d, a));
    }
    console.log(displacementArray);
    
    
    



    var myArray = [10, 20, 20.34, 0, -36, 0.23];
    console.log(Math.max(...myArray));

    //calculate variables we need
    theta_min = brentq(first_derivitive_displacement,-90,75)
    theta_max = brentq(first_derivitive_displacement,75,270)
    Xmin = displacement(theta_min)
    Xmax = displacement(theta_max)
    mLmax = mLmin - (Xmin-Xmax)/a

    return (theta_min,theta_max,Xmin,Xmax,mLmax,mLmin,r,b,d,a)

}

*/


/* Create uL_table

*/
var theta_max = 157.0
var theta_min = -13.6
var r = 0.75
var b = 3
var d = 0.88
var a = 0.25
var PWM_min = 180
var PWM_max = 500
var X_min = 2.071
var mL_max = 9.175
var X_max = 3.645
var mL_min = 2.8779
var mL_range = mL_max - mL_min

function PWM2rad(PWM) {
	var deg = ( (PWM - PWM_min) * (theta_max-theta_min) / (PWM_max-PWM_min) ) + theta_min
    return (deg * (Math.PI/180));
}


var create_uL_table = function(uL_precision) {
	var uL_min = mL_min*1000;
	var uL_range = mL_range*1000;
	// Create PWM_table
	var PWM_table = [];
	for (var i=PWM_min; i<=PWM_max; i++) {
		PWM_table.push(i);
		var mL_temp = mL_max - ((( r*Math.cos(PWM2rad(i)) ) + Math.sqrt(Math.pow(b,2) - ( Math.pow((r*Math.sin(PWM2rad(i))+d),2) ))) - X_min)/a;	
		var uL_temp = Math.round(mL_temp*10000)/10;
		PWM_table.push(uL_temp);
	};

	// create uL_table
	var uL_table = [];
	for (var i=uL_min; i<uL_range+uL_min+uL_precision; i=i+uL_precision) {
		// round i (which is current uL value)
		var uL_current = i
		uL_current = Math.round(uL_current*100)/100;

		uL_table.push(uL_current); // Add the current uL value to table

		// Add PWM values
		if (i == uL_min) {		// We know the first value, which can't be found with linear interpolation
			uL_table.push(PWM_table[0]);
			continue;
		}
		// Linear interpolation to find other values
		// Skip to 2nd value as we already logged the first
		for (var j = 3; j < PWM_table.length; j=j+2) {	// Add PWM value to table via linear interpolation
    		if (PWM_table[j] >= uL_current && j%2 > 0) { 		// If uL value in PWM table is greater than or equal to our current uL value, find PWM inbetween PWMs in PWM_table
    			var PWM_between = PWM_table[j-3] + (uL_current - PWM_table[j-2])*((PWM_table[j-1]-PWM_table[j-3])/(PWM_table[j]-PWM_table[j-2]));
    			var PWM_between = Math.round(PWM_between*100)/100;
    			uL_table.push(PWM_between);
    			//console.log([PWM_table[j],PWM_table[j-1],PWM_table[j-2],PWM_table[j-3],uL_current,PWM_between]);	
    			break;		
    		}    
  		}
	};
  	uL_table.push(PWM_max) // i don't know why this isn't being added!

	return {
		PWM_table: PWM_table,
		uL_table: uL_table
	};
};



/*  Calculate even uL steps
	
	Discription:
		At any arbitrary position, move to any other position in 
		equal fluid dispensing steps over a set amount of time

	Inputs:
		Pump number
		uL_table
		PWM_table
		highest uL difference
		Current uL value
		Goal uL value
		Time to get from current to goal uL value
	Outputs:
		Serial command to Arduino 5x per second in format '00010300' with 0001 being the pump number and 0300 being the PWM value to go to
*/

/*PWM_table
		Array of PWM values, uL values = [
			180 PWM, 0 uL,
			181 PWM, 1.14 uL,
			182 PWM, 2.52 uL
		]

  uL_table (ordered )
  		Array of uL values, PWM values = [
			0 uL, 180 PWM,
			0.5 uL, 180.45 PWM,
			1 uL, 181.2 PWM
  		]
*/


/* Example inputs:
		Pump number 								= 1
		uL_table 									= maping_table
		PWM_table									= PWM_table
		highest uL difference 						= 1.5 uL
		Current uL value 							= 12 uL
		Goal uL value 								= 400 uL
		Time to get from current to goal uL values	= 5 seconds
*/

var even_uL_steps = function(pump_num, uL_table, PWM_table, uL_precision, current_uL, goal_uL, time_sec) {

	// Get uL_to_dispense
	var uL_to_dispense = Math.abs(goal_uL-current_uL);

	// Get Total number of steps
	var num_steps = uL_to_dispense/uL_precision;

	// Get number of steps per second and number of seconds per step
	var steps_per_second = num_steps/time_sec; // send to user, not used in program
	var seconds_per_step = time_sec/num_steps; // needed for delay between step

	// Find current place and goal place in uL_table
	var f_found = false;
	for (var i=0; i <= uL_table.length; i=i+2) {
		if (uL_table[i] > current_uL && f_found == false) {
			var first_uL_index = i;
			f_found = true;
		}
		if (uL_table[i] > goal_uL) {
			var goal_uL_index = i;
			break;
		}
	}

	// Iterate through uL_table from next uL_index and go specified number of steps 
	// MUST DELAY each console.log by the variable 'seconds_per_step'	
	for (var i=first_uL_index; i < first_uL_index+goal_uL_index; i=i+2) {
		// Basically an if else; always goes to the else until last step

		// if last step, do fancy calculations
		if (i==first_uL_index+goal_uL_index-2) {
			// iterate through PWM table PWM values
			for (var j=0; j<=PWM_table.length;j=j+2) {	// Find if we should round last PWM up or down
				if(Math.ceil(uL_table[i+1]) == PWM_table[j]) { 	// if our last PWM value (rounded UP) is found in PWM table:
					if (Math.abs(goal_uL - PWM_table[j+1]) < Math.abs(goal_uL - PWM_table[j-1])) { 	// If rounded up PWM value uL value is closer to goal_uL, go with rounded up PWM
						console.log(PWM_table[j+1]);			//uL value
						console.log(Math.ceil(uL_table[i+1])); 	//PWM value
						console.log("");
						console.log("aaaaaaaa")
						var end_PWM = Math.ceil(uL_table[i+1]);	// used for PWM tracking and debugging
					}
					else {	// otherwise round down
						console.log(PWM_table[j-1]);				//uL value
						console.log(Math.floor(uL_table[i+1])); 	//PWM value
						console.log("");
						console.log("zzzzzzzz")
						var end_PWM = Math.floor(uL_table[i+1]);	// used for PWM tracking and debugging
					}
					break; // break for loop as we found what PWM value to use
				}
			}
		}
		else {
			console.log(uL_table[i]);
			console.log(uL_table[i+1]);
			console.log("");
		}
	}



	// Debugging 
	/*
	for (var i=0; i<= PWM_table.length;i=i+2) {
		if(end_PWM == PWM_table[i]) {
			console.log(PWM_table[i+1])
		}
	}
	console.log("Total uL dispensed: ",end_PWM)


	// Send output to Serial
	console.log(uL_table)
	console.log(PWM_table)

	console.log(num_steps,steps_per_second,seconds_per_step);
	*/
	console.log(end_PWM);
	//console.log(PWM_table);
};




var create_table_outputs = create_uL_table(40);
var PWM_table = create_table_outputs.PWM_table;
var uL_table = create_table_outputs.uL_table;


even_uL_steps(1,uL_table,PWM_table,40,2880,3100,30);