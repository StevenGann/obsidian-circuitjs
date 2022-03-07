## Obsidian CircuitJS

An Obsidian.md plugin to embed [CircuitJS](https://falstad.com/circuit/circuitjs.html) circuit simulations into notes

### Purpose

I like using CircuitJS for sketching out circuit designs and I wanted a good way to organize and reference those circuits. With this plugin, I am able to keep the actual circuit designs in version control and backed up along with the rest of my Obsidian vault. Having the circuits embedded in Markdown means I can also include extensive notes on the circuits, links to additional information, etc.

### Usage

In CircuitJS use `File -> Export As Text...` and paste the code into a markdown code block tagged as `circuitjs` like this:

```
```circuitjs
$ 1 0.000005 10.20027730826997 50 5 43 5e-11
r 176 80 384 80 0 10
s 384 80 448 80 0 1 false
w 176 80 176 352 0
c 384 352 176 352 0 0.000015 -9.16123055990675 -10
l 384 80 384 352 0 1 -0.01424104005209455 0
v 448 352 448 80 0 0 40 5 0 0 0.5
r 384 352 448 352 0 100
o 4 64 0 4099 20 0.05 0 2 4 3
o 3 64 0 4099 20 0.05 1 2 3 3
o 0 64 0 4099 0.625 0.05 2 2 0 3
38 3 F1 0 0.000001 0.000101 -1 Capacitance
38 4 F1 0 0.01 1.01 -1 Inductance
38 0 F1 0 1 101 -1 Resistance
h 1 4 3
` ` `
```

When in Reading view Obsidian will then replace the code block with an emedded CircuitJS instance with the circuit defined in the code, and a link to open the circuit in a full browser.

![CircuitJS View](https://raw.githubusercontent.com/StevenGann/obsidian-circuitjs/master/docs/screenshot.png)

### Limitations

The embedded simulation is completely interactive, but changes don't get stored back in the code. If you make changes in the simulation and want to keep them, use `File -> Export As Text...` before switching back to Editing mode and pasting in the updated code.
