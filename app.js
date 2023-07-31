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

    const specialMap = {
        space: ' ',
        enter: "\n",
        del, up, down, left, right,
    }

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
             'm', 'space', 'n',
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
             'M', 'del', 'N',
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

    const buttonMap = [2, 3, 1, 0]
    buttonMap[8] = del
    buttonMap[9] = "\n"
    buttonMap[12] = up
    buttonMap[13] = down
    buttonMap[14] = left
    buttonMap[15] = right
    let oldCell1
    let oldCell2
    let oldButtons = ""

    editor.onselectionchange = (evt) => {
        console.log(evt)
    }

    function getCell(x, y) {
        let col = x < -0.4 ? 0 : x > 0.4 ? 2 : 1
        let row = y < -0.4 ? 0 : y > 0.4 ? 2 : 1
        return row * 3 + col
    }

    requestAnimationFrame(update)
    function update() {
        const gamepads = navigator.getGamepads()
        for (const gp of gamepads) {
            if (!gp) continue

            const cell1 = getCell(gp.axes[0], gp.axes[1])
            const cell2 = getCell(gp.axes[2], gp.axes[3])
            const buttons = gp.buttons.map(b => b.pressed ? '1' : '0').join('')
            if (cell1 === oldCell1 && cell2 === oldCell2 && buttons == oldButtons) continue

            if (buttons != oldButtons) {
                console.log("Buttons", 
                    [...buttons]
                        .map((p,i)=>[i,p])
                        .filter(([i,p])=>p==='1')
                        .map(([i,p])=>`${i}:${p}`)
                        .join(", ")
                )
            }

            // Slight buzz when something changes
            if (gp.vibrationActuator) {
                gp.vibrationActuator.playEffect("dual-rumble", {
                    duration: 25,
                    weakMagnitude: 0.5,
                    strongMagnitude: 0.0,
                });
            }

            oldCell1 = cell1
            oldCell2 = cell2
            oldButtons = buttons

            state = [
                layers[buttons[10] === "1" || buttons[11] === "1" ? 1 : 0],
                { cell1, cell2 },
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