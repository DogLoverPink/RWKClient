"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level = void 0;
exports.normalizedTileValue = normalizedTileValue;
exports.extractLevelName = extractLevelName;
var bitwise_1 = require("bitwise");
var Buffer = require('buffer/').Buffer;
var level_defaults = {
    // header : Buffer.from('000000000500000026000000ffffffff','hex'),
    header_1: Buffer.from('0000000005000000', 'hex'),
    header_2: Buffer.from('ffffffff', 'hex'),
    footer_head: Buffer.from('0100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc000000000000000000000000000000', 'hex'),
    footer: Buffer.from('0100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f010000000001000000000100000000', 'hex')
};
function delimitedBuffer(b) {
    var newb = Buffer.alloc(b.length + 4);
    newb.writeUInt32LE(b.length);
    b.copy(newb, 4);
    return newb;
}
function readDelimited(b_in, offset) {
    var length = b_in.readUInt32LE(offset);
    var payload = b_in.slice(offset + 4, offset + 4 + length);
    return payload;
}
var Tags = /** @class */ (function () {
    function Tags() {
        this.length = 19;
        this.tag_names_BE = [
            "kids",
            "easy",
            "hard",
            "insane",
            "tricky",
            "silly",
            "arcade",
            "prank",
            "unfair",
            "evil",
            "rpg",
            "tiny",
            "huge",
            "glitchy",
        ];
        this.tag_names = [
            "prank", //7
            "arcade", //6
            "silly", //5
            "tricky", //4
            "insane", //3
            "hard", //2
            "easy", //1
            "kids", //0
            undefined, //15
            undefined, //14
            "glitchy", //13
            "huge", //12
            "tiny", //11
            "rpg", //10
            "evil", //9
            "unfair", //8
        ];
        this.buf = Buffer.alloc(this.length, 0);
        this.tag_index = {};
        for (var i = 0; i < this.tag_names.length; i++) {
            var tag_name = this.tag_names[i];
            if (typeof tag_name == 'string') {
                this.tag_index[tag_name] = i;
            }
        }
    }
    Tags.prototype.deserialize = function (buf, offset) {
        this.buf = buf.slice(offset, offset + 19);
        offset += 19;
        return offset;
    };
    Tags.prototype.set_tag = function (tag) {
        var index = this.tag_index[tag];
        if (typeof index == 'undefined')
            throw Error("Given tag \"".concat(tag, "\" is unknown."));
        var bits = bitwise_1.default.buffer.read(this.buf, 0, this.tag_names.length);
        bits[index] = 1;
        bitwise_1.default.buffer.modify(this.buf, bits);
        // console.log(this.buf)
    };
    Tags.prototype.get_tags = function () {
        var bits = bitwise_1.default.buffer.read(this.buf, 0, this.tag_names.length);
        var tags = [];
        for (var i = 0; i < this.tag_names.length; i++) {
            if (bits[i]) {
                var tag_name = this.tag_names[i];
                if (tag_name)
                    tags.push(tag_name);
            }
        }
        return tags.join(',');
    };
    Tags.prototype.serialize = function () {
        return this.buf;
    };
    return Tags;
}());
var CellObj = /** @class */ (function () {
    function CellObj(arg) {
        if (!arg) {
            this._val = 0;
            return;
        }
        if ('val' in arg) {
            this._val = arg.val;
            return;
        }
        this._val = 0;
        this.paint = arg.paint;
        this.base = arg.base;
    }
    CellObj.prototype._normalizedCellValue = function (val) {
        // only touch the high two bytes if there are any values set there.
        if (val < 65536)
            return val;
        var buf = Buffer.alloc(4);
        buf.writeUInt32LE(val);
        Buffer.from('8000', 'hex').copy(buf, 2);
        return buf.readUInt32LE();
    };
    CellObj.prototype._normalizedPaint = function (val) {
        return this._normalizedCellValue(val) & 0xffffff80;
    };
    CellObj.prototype._normalizedBase = function (val) {
        return this._normalizedCellValue(val) & 0x7f;
    };
    Object.defineProperty(CellObj.prototype, "value", {
        get: function () { return this._val; },
        set: function (val) { this._val = this._normalizedCellValue(val); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CellObj.prototype, "base", {
        get: function () {
            return this._normalizedBase(this._val);
        },
        set: function (b) {
            this._val = (this.paint) + this._normalizedBase(b);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CellObj.prototype, "paint", {
        get: function () {
            return this._normalizedPaint(this._val);
        },
        set: function (p) {
            this._val = this.base + this._normalizedPaint(p);
        },
        enumerable: false,
        configurable: true
    });
    return CellObj;
}());
var Grid = /** @class */ (function () {
    function Grid(x, y, default_cell) {
        if (x === void 0) { x = 10; }
        if (y === void 0) { y = 7; }
        if (default_cell === void 0) { default_cell = 0; }
        this.size_x = 0;
        this.size_y = 0;
        this.celldata = [];
        this.mapgrid = [];
        this.setSize(x, y, default_cell);
    }
    Grid.prototype.getCellID = function (x, y) {
        return (y * this.size_x + x);
    };
    Grid.prototype.serialize = function () {
        var buf = Buffer.alloc(this.size_x * this.size_y * (4 + 1) + 8);
        var offset = 0;
        buf.writeUInt32LE(this.size_x, offset);
        offset += 4;
        buf.writeUInt32LE(this.size_y, offset);
        offset += 4;
        //write main grid
        for (var j = 0; j < this.size_y; j++) {
            for (var i = 0; i < this.size_x; i++) {
                buf.writeUInt32LE(normalizedTileValue(this.celldata[j][i]), offset);
                offset += 4;
            }
        }
        // write map grid
        for (var j = 0; j < this.size_y; j++) {
            for (var i = 0; i < this.size_x; i++) {
                buf.writeUInt8(this.mapgrid[j][i], offset);
                offset += 1;
            }
        }
        return delimitedBuffer(buf);
    };
    Grid.prototype.deserialize = function (buf, offset) {
        var total_size = buf.readUInt32LE(offset);
        offset += 4;
        var size_x = buf.readUInt32LE(offset);
        offset += 4;
        var size_y = buf.readUInt32LE(offset);
        offset += 4;
        if (total_size != size_x * size_y * 5 + 8)
            throw new Error("Grid size mismatch detected.");
        this.setSize(size_x, size_y, 0);
        //write main grid
        for (var j = 0; j < this.size_y; j++) {
            for (var i = 0; i < this.size_x; i++) {
                this.setCell(i, j, normalizedTileValue(buf.readUInt32LE(offset)));
                offset += 4;
            }
        }
        // write post-grid
        for (var j = 0; j < this.size_y; j++) {
            for (var i = 0; i < this.size_x; i++) {
                this.setMapCell(i, j, buf.readUInt8(offset));
                offset += 1;
            }
        }
        return offset;
    };
    Grid.prototype.setSize = function (x, y, default_cell) {
        if (x === void 0) { x = 10; }
        if (y === void 0) { y = 7; }
        if (default_cell === void 0) { default_cell = 0; }
        this.size_x = x;
        this.size_y = y;
        this.celldata = Array.from(Array(y), function (row) { return Array.from(Array(x), function (cell) { return default_cell; }); });
        // console.log(this.celldata)
        this.mapgrid = Array.from(Array(y), function (row) { return Array.from(Array(x), function (cell) { return 0; }); });
    };
    Grid.prototype._checkLimits = function (x, y) {
        // console.log(`${x},${this.size_x},${x>=this.size_x}`)
        if (x >= this.size_x || y >= this.size_y || x < 0 || y < 0)
            throw new Error('invalid grid index');
    };
    Grid.prototype.setCell = function (x, y, val) {
        this._checkLimits(x, y);
        this.celldata[y][x] = normalizedTileValue(val);
    };
    Grid.prototype.setCellBase = function (x, y, val) {
        this._checkLimits(x, y);
        var cell = new CellObj({ val: this.celldata[y][x] });
        cell.base = val;
        this.celldata[y][x] = cell.value;
    };
    Grid.prototype.setCellPaint = function (x, y, val) {
        this._checkLimits(x, y);
        var cell = new CellObj({ val: this.celldata[y][x] });
        cell.paint = val;
        this.celldata[y][x] = cell.value;
    };
    Grid.prototype.getCell = function (x, y) {
        this._checkLimits(x, y);
        return normalizedTileValue(this.celldata[y][x]);
    };
    Grid.prototype.getCellObj = function (x, y) {
        this._checkLimits(x, y);
        return new CellObj({ val: this.celldata[y][x] });
    };
    Grid.prototype.setMapCell = function (x, y, val) {
        this._checkLimits(x, y);
        this.mapgrid[y][x] = val;
    };
    Grid.prototype.getMapCell = function (x, y) {
        this._checkLimits(x, y);
        return this.mapgrid[y][x];
    };
    return Grid;
}());
var CalloutList = /** @class */ (function () {
    function CalloutList() {
        this.callouts = [];
    }
    CalloutList.prototype.addCallout = function (x, y, text) {
        this.callouts.push({ x: x, y: y, text: text });
    };
    CalloutList.prototype.serialize = function () {
        var parts = [];
        for (var _i = 0, _a = this.callouts; _i < _a.length; _i++) {
            var call = _a[_i];
            // console.log(`serializing ${call.text},${call.x},${call.y}`)
            var textbuf = Buffer.from(call.text, 'utf-8');
            var buf = Buffer.alloc(textbuf.length + 13, 0);
            buf.writeUInt32LE(call.x, 0);
            buf.writeUInt32LE(call.y, 4);
            buf.writeUInt32LE(textbuf.length + 1, 8);
            textbuf.copy(buf, 12);
            // the terminating zero of the string is already present from the zeroed buffer.
            parts.push(buf);
        }
        var combined_callout_buf = Buffer.concat(parts);
        // console.log(combined_callout_buf)
        var n_callouts = Buffer.alloc(4);
        n_callouts.writeUInt32LE(this.callouts.length);
        return delimitedBuffer(Buffer.concat([n_callouts, combined_callout_buf]));
    };
    CalloutList.prototype.deserialize = function (buf, offset) {
        this.callouts = [];
        var final_offset = offset + 4 + buf.readUInt32LE(offset); // we can check when we are done
        offset += 4;
        var n_callouts = buf.readUInt32LE(offset);
        offset += 4;
        for (var i = 0; i < n_callouts; i++) {
            var x = buf.readUInt32LE(offset);
            offset += 4;
            var y = buf.readUInt32LE(offset);
            offset += 4;
            var n = buf.readUInt32LE(offset);
            offset += 4;
            var text = buf.slice(offset, offset + n - 1).toString('utf-8'); // leave out the trailing zero byte.
            offset += n;
            this.callouts.push({ x: x, y: y, text: text });
        }
        if (offset != final_offset) {
            throw new Error("Deserialization problem in callout section. Unexpected final size.");
        }
        return offset;
    };
    return CalloutList;
}());
var floatXY = /** @class */ (function () {
    function floatXY(x, y) {
        var _a;
        _a = [x, y], this.x = _a[0], this.y = _a[1];
    }
    floatXY.prototype.serialize = function () {
        var buf = Buffer.alloc(8);
        buf.writeFloatLE(this.x, 0);
        buf.writeFloatLE(this.y, 4);
        return delimitedBuffer(buf);
    };
    floatXY.prototype.deserialize = function (buf, offset) {
        var should_be_8 = buf.readUInt32LE(offset);
        offset += 4;
        this.x = buf.readFloatLE(offset);
        offset += 4;
        this.y = buf.readFloatLE(offset);
        offset += 4;
        return offset;
    };
    return floatXY;
}());
var Footer = /** @class */ (function () {
    function Footer() {
        this.header = level_defaults.footer_head;
        this.belt_speed = 0.6;
        this.music = ["", "", ""];
    }
    Footer.prototype.serialize = function () {
        var parts = [];
        parts.push(level_defaults.footer_head);
        var beltbuf = Buffer.alloc(4, 0);
        beltbuf.writeFloatLE(this.belt_speed);
        parts.push(beltbuf);
        parts.push(beltbuf); // no idea why it is doubled.
        for (var i = 0; i < 3; i++) {
            parts.push(delimitedBuffer(Buffer.from(this.music[i] + "\x00", 'utf-8')));
        }
        return delimitedBuffer(Buffer.concat(parts));
    };
    Footer.prototype.deserialize = function (buf, offset) {
        var final_offset = offset + 4 + buf.readUInt32LE(offset); //check at the end
        offset += 4;
        this.header = Buffer.from(buf.slice(offset, offset + level_defaults.footer_head.length));
        offset += level_defaults.footer_head.length;
        this.belt_speed = buf.readFloatLE(offset);
        offset += 8; //the value is doubled for some reason
        for (var i = 0; i < 3; i++) {
            if (offset == final_offset)
                return offset; // The level Eyedea n Abilities does not have the following part.
            var length_1 = buf.readUInt32LE(offset);
            offset += 4;
            this.music[i] = buf.slice(offset, offset + length_1 - 1).toString('utf-8');
            offset += length_1;
        }
        if (offset != final_offset)
            throw new Error("Final offset in footer is not as expected.");
        return offset;
    };
    return Footer;
}());
var Header = /** @class */ (function () {
    function Header() {
        this.name = '';
        // this.buf = Buffer.from(level_defaults.header)
    }
    // setBuf(buf:Buffer){
    //     this.buf = Buffer.from(buf)
    // }
    Header.prototype.serialize = function () {
        var namebuf = Buffer.from(this.name, 'utf-8');
        var parts1 = [];
        parts1.push(level_defaults.header_1);
        parts1.push(new ExpectValue(4 + level_defaults.header_1.length + 4 + level_defaults.header_2.length + 4 + namebuf.length).serialize());
        parts1.push(level_defaults.header_2);
        var name_part = Buffer.alloc(5 + namebuf.length, 0);
        name_part.writeUInt32LE(namebuf.length + 1);
        namebuf.copy(name_part, 4);
        return Buffer.concat([
            delimitedBuffer(Buffer.concat(parts1)),
            name_part
        ]);
    };
    Header.prototype.deserialize = function (buf, offset) {
        // console.log(`Deserializing header from offset ${offset}`)
        var length = buf.readUInt32LE(offset);
        offset += 4 + length;
        var name_length = buf.readUInt32LE(offset);
        offset += 4;
        // console.log(`Deserializing name from offset ${offset}, lenght ${name_length-1}`)
        this.name = buf.slice(offset, offset + name_length - 1).toString('utf-8');
        offset += name_length;
        // console.log(`name is ${this.name}`)
        return offset;
    };
    return Header;
}());
var ExpectValue = /** @class */ (function () {
    function ExpectValue(val) {
        this.val = val;
        this.buf = Buffer.alloc(4, 0);
        this.buf.writeUInt32LE(val);
    }
    ExpectValue.prototype.serialize = function () {
        return this.buf;
    };
    ExpectValue.prototype.deserialize = function (buf, offset) {
        var seen = buf.readUInt32LE(offset);
        if (seen != this.val)
            throw new Error("Deserialization. Unexpected value. Expected ".concat(this.val, ", got ").concat(seen));
        return offset + 4;
    };
    return ExpectValue;
}());
var Level = /** @class */ (function () {
    function Level(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.header = new Header();
        this.header.name = (options === null || options === void 0 ? void 0 : options.name) || '';
        this.tags = new Tags();
        this.grid = new Grid((_a = options === null || options === void 0 ? void 0 : options.grid) === null || _a === void 0 ? void 0 : _a.x, (_b = options === null || options === void 0 ? void 0 : options.grid) === null || _b === void 0 ? void 0 : _b.y, (_c = options === null || options === void 0 ? void 0 : options.grid) === null || _c === void 0 ? void 0 : _c.val);
        this.callouts = new CalloutList();
        this.robot = new floatXY(((_d = options === null || options === void 0 ? void 0 : options.robot) === null || _d === void 0 ? void 0 : _d.x) || 50, ((_e = options === null || options === void 0 ? void 0 : options.robot) === null || _e === void 0 ? void 0 : _e.y) || 60);
        this.kitty = new floatXY(((_f = options === null || options === void 0 ? void 0 : options.kitty) === null || _f === void 0 ? void 0 : _f.x) || 70, ((_g = options === null || options === void 0 ? void 0 : options.kitty) === null || _g === void 0 ? void 0 : _g.y) || 80);
        this.footer = new Footer();
        this.zero = new ExpectValue(0);
        this.one = new ExpectValue(1);
        this.debug = options === null || options === void 0 ? void 0 : options.debug;
    }
    Object.defineProperty(Level.prototype, "name", {
        get: function () {
            return this.header.name;
        },
        set: function (s) {
            this.header.name = s;
        },
        enumerable: false,
        configurable: true
    });
    Level.from = function (buf, debug) {
        var lvl = new Level({ debug: debug });
        lvl.deserialize(buf);
        return lvl;
    };
    Level.prototype.changeGridSize = function (x_size, y_size) {
        this.grid = new Grid(x_size, y_size);
    };
    Level.prototype.dbg = function (s) {
        if (this.debug) {
            this.debug(s);
        }
    };
    Level.prototype.serialize = function () {
        var parts = [];
        parts.push(this.header.serialize());
        // parts.push(delimitedBuffer(Buffer.from(this.name+'\x00','utf-8'))) # name now in header
        parts.push(this.tags.serialize());
        parts.push(this.grid.serialize());
        parts.push(this.one.serialize()); //unknown one
        parts.push(this.callouts.serialize());
        parts.push(this.zero.serialize()); //unknown zero block
        parts.push(this.robot.serialize());
        parts.push(this.zero.serialize()); //unknown zero block
        parts.push(this.kitty.serialize());
        parts.push(this.zero.serialize()); //unknown zero block
        parts.push(this.footer.serialize());
        parts.push(this.zero.serialize()); //unknown zero block
        parts.push(this.zero.serialize()); //unknown zero block
        return Buffer.concat(parts);
    };
    Level.prototype.deserialize = function (buf) {
        this.dbg("beginning level deserialization");
        var offset = this.header.deserialize(buf, 0);
        this.dbg("header deser passed");
        // name now in header
        // const namebuf = readDelimited(buf,offset)
        // offset+=4+namebuf.length
        // this.name = namebuf.slice(0,namebuf.length-1).toString('utf-8').trim()
        offset = this.tags.deserialize(buf, offset);
        this.dbg("tags deser passed");
        offset = this.grid.deserialize(buf, offset);
        this.dbg("grid deser passed");
        offset = this.one.deserialize(buf, offset); // magic one. reason unknown.
        offset = this.callouts.deserialize(buf, offset);
        this.dbg("callouts deser passed");
        offset = this.zero.deserialize(buf, offset);
        offset = this.robot.deserialize(buf, offset);
        offset = this.zero.deserialize(buf, offset);
        offset = this.kitty.deserialize(buf, offset);
        offset = this.zero.deserialize(buf, offset);
        this.dbg("robot and kitty deser passed");
        offset = this.footer.deserialize(buf, offset);
        this.dbg("footer deser passed");
        offset = this.zero.deserialize(buf, offset);
        offset = this.zero.deserialize(buf, offset);
        this.dbg("complete deserilaization passed");
    };
    return Level;
}());
exports.Level = Level;
function normalizedTileValue(val) {
    // only touch the high two bytes if there are any values set there.
    if (val < 65536)
        return val;
    var buf = Buffer.alloc(4);
    buf.writeUInt32LE(val);
    Buffer.from('8000', 'hex').copy(buf, 2);
    return buf.readUInt32LE();
}
function extractLevelName(buf) {
    var offset = 0;
    offset += 4 + buf.readUInt32LE(offset);
    var length = buf.readUInt32LE(offset);
    offset += 4;
    return buf.slice(offset, offset + length - 1).toString('utf-8').trim();
}
