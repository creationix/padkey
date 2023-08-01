import { del, insert, left, right, up, down } from './cursor.js'
import { createComponent } from './domchanger.js'

function renderBox(characters, current, cell) {
    return [`.box${current ? ".current" : ""}`,
    ...characters.map((c, i) =>
        [`.cell${cell === i ? '.current' : ''}.${charClass(c)}`, c]
    )
    ]
}

function charClass(c) {
    if (/^[a-z][a-z]+$/.test(c)) return 'word'
    if (/^\p{L}$/u.test(c)) return "letter"
    if (/^\p{N}$/u.test(c)) return "number"
    if (/^(?:\p{P}|\p{S})$/u.test(c)) return "punctuation"
    return "other"
}

function renderGrid(layer, { cell1, cell2 }) {
    return [".grid",
        ...layer.map((chars, i) => renderBox(chars, cell1 === i, cell2))
    ]
}

function PadKey(emit, refresh) {
    window.addEventListener("gamepadconnected", (e) => {
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length
        )
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id)
    })

    const layers = [
        // top-left to bottom right
        // same within each
        [
            ['(', '1', ')',
             'a', 'τ', 'c',
             '<', 'b', '>'],
            ['|', '2', '?',
             'd', '↑', 'f',
             '\\', 'e', '/'],
            ['{', '3', '}',
             'g', 'ε', 'i',
             '[', 'h', ']'],
            [';', '4', '"',
             'k', '←', 'l',
             ':', 'k', '\''],
            ['-', '5', '+',
             'm', ' ', 'n',
             '_', '0', '='],
            ['*', '6', '%',
             'o', '→', 'q',
             '×', 'p', '÷'],
            ['~', '7', '!',
             'r', 'λ', 't',
             '`', 's', '@'],
            [',', '8', '.',
             'u', '↓', 'w',
             ' ', 'v', ' '],
            ['#', '9', '$',
             'x', 'μ', 'z',
             '∙', 'y', '^'],
        ],
        [
            [' ', '1', ' ',
             'A', ' ', 'C',
             ' ', 'B', ' '],
            [' ', '2', ' ',
             'D', ' ', 'F',
             ' ', 'E', ' '],
            [' ', '3', ' ',
             'G', ' ', 'I',
             ' ', 'H', ' '],
            [' ', '4', ' ',
             'K', ' ', 'L',
             ' ', 'K', ' '],
            [' ', '5', ' ',
             'M', ' ', 'N',
             ' ', '0', ' '],
            [' ', '6', ' ',
             'O', ' ', 'Q',
             ' ', 'P', ' '],
            [' ', '7', ' ',
             'R', ' ', 'T',
             ' ', 'S', ' '],
            [' ', '8', ' ',
             'U', ' ', 'W',
             ' ', 'V', ' '],
            [' ', '9', ' ',
             'X', ' ', 'Z',
             ' ', 'Y', ' '],
        ],
    ]

    let state

    const editor = document.getElementById("editor")

    let cell1 = 4
    let cell2 = 4
    let buttons = ""

    editor.onselectionchange = (evt) => {
        console.log(evt)
    }

    function getCell(x, y) {
        let col = x < -0.4 ? 0 : x > 0.4 ? 2 : 1
        let row = y < -0.4 ? 0 : y > 0.4 ? 2 : 1
        return row * 3 + col
    }

    function onButtonUp(index) {
        switch (index) {
            case 4: del(editor); break
            case 5: insert(editor, "\n"); break
            case 6: case 7: // Trigger click
                const layer = getLayer(layers, buttons)
                const key = layer[cell1][cell2]
                insert(editor, key)
                break
            case 12: up(editor); break
            case 13: down(editor); break
            case 14: left(editor); break
            case 15: right(editor); break
            default:
                insert(editor, "key " + index)
        }
    }

    function onButtonDown(index) {

    }

    function getLayer(layers, buttons) {
        return layers[buttons[10] === "1" || buttons[11] === "1" ? 1 : 0]
    }

    requestAnimationFrame(update)
    function update() {
        const gamepads = navigator.getGamepads()
        for (const gp of gamepads) {
            if (!gp) continue

            const newCell1 = getCell(gp.axes[0], gp.axes[1])
            const newCell2 = getCell(gp.axes[2], gp.axes[3])
            const newButtons = gp.buttons.map(b => b.pressed ? '1' : '0').join('')
            if (newCell1 === cell1 && newCell2 === cell2 && newButtons == buttons) continue
            cell1 = newCell1
            cell2 = newCell2
            const oldButtons = buttons
            buttons = newButtons
            for (let i = 0, l = newButtons.length; i < l; i++) {
                const b = buttons[i]
                const o = oldButtons[i]
                if (o === "1" && b === "0") {
                    onButtonUp(i)
                } else if (o === "0" && b === "1") {
                    onButtonDown(i)
                }
            }
            editor.focus()

            // Slight buzz when something changes
            if (gp.vibrationActuator) {
                gp.vibrationActuator.playEffect("dual-rumble", {
                    duration: 25,
                    weakMagnitude: 0.5,
                    strongMagnitude: 0.0,
                });
            }


            state = [
                getLayer(layers, buttons),
                { cell1: newCell1, cell2: newCell2 },
            ]
            refresh()
        }
        requestAnimationFrame(update)
    }

    return {
        render() {
            return renderGrid(...state)
        }
    }
}

createComponent(PadKey, document.querySelector("#keyboard"))