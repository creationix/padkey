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

function renderGrid(layer, { cell, cell2 }) {
    return [".grid",
        ...layer.map((chars, i) => renderBox(chars, cell === i, cell2))
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
            [' ', '1', ' ',
                'a', ' ', 'c',
                ' ', 'b', ' '],
            [' ', '2', ' ',
                'd', ' ', 'f',
                ' ', 'e', ' '],
            [' ', '3', ' ',
                'g', ' ', 'i',
                ' ', 'h', ' '],
            [' ', '4', ' ',
                'k', ' ', 'l',
                ' ', 'k', ' '],
            [' ', '5', ' ',
                'm', ' ', 'n',
                ' ', '0', ' '],
            [' ', '6', ' ',
                'o', ' ', 'q',
                ' ', 'p', ' '],
            [' ', '7', ' ',
                'r', ' ', 't',
                ' ', 's', ' '],
            [' ', '8', ' ',
                'u', ' ', 'w',
                ' ', 'v', ' '],
            [' ', '9', ' ',
                'x', ' ', 'z',
                ' ', 'y', ' '],
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
    let oldCell
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
            const cell = getCell(gp.axes[0], gp.axes[1])
            const cell2 = getCell(gp.axes[2], gp.axes[3])
            const buttons = gp.buttons.map(b => b.pressed ? '1' : '0').join('')
            if (cell === oldCell && cell2 === oldCell2 && buttons == oldButtons) continue
            if (gp.hapticActuators && gp.hapticActuators.length) {
                gp.hapticActuators[0].pulse(1.0, 200);
            }
            if (gp.vibrationActuator) {
                gp.vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 50,
                    weakMagnitude: 1.0,
                    strongMagnitude: 0.0,
                });
            }


            const layerIndex = (buttons[4] === "1" ? 1 : 0) + (buttons[5] === '1' ? 2 : 0)
            const layer = layers[layerIndex]

            for (let i = 0, l = buttons.length; i < l; i++) {
                if (oldButtons[i] === '1' && buttons[i] === '0') {
                    let action = buttonMap[i] || { i }
                    if (typeof action === 'number') {
                        action = layer[cell][action]
                        action = specialMap[action] || action
                    }
                    console.log({ action })
                    if (typeof action === 'string') {
                        insert(editor, action)
                    } else if (typeof action === 'function') {
                        action(editor)
                    }
                }
            }

            oldCell = cell
            oldCell2 = cell2
            oldButtons = buttons

            state = [
                layer,
                { cell, cell2 },
            ]
            console.log({ cell, cell2 })
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