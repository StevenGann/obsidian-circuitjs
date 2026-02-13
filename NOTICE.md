# Third-Party Software Notices

This Obsidian plugin includes bundled third-party software. This document provides attribution and license information for the included components.

---

## CircuitJS1

**Source:** https://github.com/pfalstad/circuitjs1

**Author:** Paul Falstad and contributors

**License:** GNU General Public License v2.0 (GPL-2.0)

CircuitJS1 is an electronic circuit simulator that runs in the browser. This plugin bundles a compiled version of CircuitJS1 to enable offline circuit simulation.

### GPL-2.0 License Summary

CircuitJS1 is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

CircuitJS1 is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

The full GPL-2.0 license text is available at:
https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

### Source Code Availability

The source code for CircuitJS1 is available at:
https://github.com/pfalstad/circuitjs1

As required by the GPL-2.0 license, the complete corresponding source code for the bundled CircuitJS1 is available:
1. In the `vendor/circuitjs1` git submodule of this repository
2. From the upstream repository at https://github.com/pfalstad/circuitjs1

---

## LZ-String

**Source:** https://github.com/pieroxy/lz-string

**Author:** pieroxy

**License:** MIT License

LZ-String is used for compressing circuit data for URL encoding.

```
MIT License

Copyright (c) 2013 pieroxy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Note on License Compatibility

This Obsidian plugin (obsidian-circuitjs) is licensed under the MIT License. The bundled CircuitJS1 component is licensed under GPL-2.0.

The plugin code and CircuitJS1 are kept separate:
- The plugin code (MIT) loads CircuitJS1 in an isolated webview/iframe
- CircuitJS1 (GPL-2.0) runs as a separate application within that container
- No GPL-2.0 code is statically linked into the MIT-licensed plugin code

Users who redistribute this plugin with the bundled CircuitJS1 assets must comply with the GPL-2.0 license terms for the CircuitJS1 component.
