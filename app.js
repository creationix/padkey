import { domBuilder } from './dombuilder.js';
import { del, left, right, up, down } from './cursor.js'

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

function getRowCol(string, offset) {
    const lines = string.split('\n')
    const line = lines[Math.max(0, lines.findIndex((l) => l.length >= offset) - 1)]
    const col = line.length - offset
    return [lines.indexOf(line), col]
}
/**
 * @param {HTMLInputElement} el
 * @param {string} txt
 */
function insert(el, txt) {
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    el.value = value.slice(0, start) + txt + value.slice(end)
    el.selectionStart = el.selectionEnd = start + txt.length
}

const layers = [
    // top-left to bottom right
    // up left down right within each
    [
        ['{', 'a', 'b', 'c'],
        ['up', 'd', 'e', 'f'],
        ['}', 'g', 'h', 'i'],
        ['left', 'j', 'k', 'l'],
        ['del', 'm', 'space', 'n'],
        ['right', 'o', 'p', 'q'],
        ['[', 'r', 's', 't'],
        ['down', 'u', 'v', 'w'],
        ['enter', 'x', 'y', 'z'],
    ],
    [
        ['0', 'A', 'B', 'C'],
        ['1', 'D', 'E', 'F'],
        ['2', 'G', 'H', 'I'],
        ['3', 'J', 'K', 'L'],
        ['4', 'M', '5', 'N'],
        ['6', 'O', 'P', 'Q'],
        ['7', 'R', 'S', 'T'],
        ['8', 'U', 'V', 'W'],
        ['9', 'X', 'Y', 'Z'],
    ],
    // other symbols
    [
        ['!', '@', '#', '$'],
        ['%', '^', '&', '*'],
        ['-', '_', '=', '+'],
        ['/', '\\', '?', '.'],
        ['`', '~', '[', ']'],
        ['{', '}', '|', ';'],
        ['(', ')', '<', '>'],
        ['\'', '"', ':', ','],
        [' ', ' ', ' ', ' '],
    ],
    // most popular emojis
    [
        ['😂', '❤️', '🤣', '👍'],
        ['😭', '🙏', '😘', '🥰'],
        ['😍', '😊', '🎉', '😁'],
        ['💕', '🥺', '😅', '🔥'],
        ['☺️', '🤦', '♥️', '🤷'],
        ['🙄', '😆', '🤗', '😉'],
        ['🎂', '🤔', '👏', '🙂'],
        ['😳', '🥳', '😎', '👌'],
        ['💜', '😔', '💪', '🤣'],
    ],
    // unicode deseret block
    [
        ['𐐀', '𐐁', '𐐂', '𐐃'],
        ['𐐄', '𐐅', '𐐆', '𐐇'],
        ['𐐈', '𐐉', '𐐊', '𐐋'],
        ['𐐌', '𐐍', '𐐎', '𐐏'],
        ['𐐐', '𐐑', '𐐒', '𐐓'],
        ['𐐔', '𐐕', '𐐖', '𐐗'],
        ['𐐘', '𐐙', '𐐚', '𐐛'],
        ['𐐜', '𐐝', '𐐞', '𐐟'],
        ['𐐠', '𐐡', '𐐢', '𐐣'],
        // ['𐐤', '𐐥', '𐐦', '𐐧'],
        // ['𐐨', '𐐩', '𐐪', '𐐫'],
        // ['𐐬', '𐐭', '𐐮', '𐐯'],
        // ['𐐰', '𐐱', '𐐲', '𐐳'],
        // ['𐐴', '𐐵', '𐐶', '𐐷'],
        // ['𐐸', '𐐹', '𐐺', '𐐻'],
        // ['𐐼', '𐐽', '𐐾', '𐐿'],
        // ['𐑀', '𐑁', '𐑂', '𐑃'],
        // ['𐑄', '𐑅', '𐑆', '𐑇'],
        // ['𐑈', '𐑉', '𐑊', '𐑋'],
        // ['𐑌', '𐑍', '𐑎', '𐑏'],
    ],
]



const kb = document.querySelector("#keyboard")
const editor = document.getElementById("editor")

const buttonMap = [2, 3, 1, 0]
let oldCol
let oldRow
let oldButtons = ""

editor.onselectionchange = (evt) => {
    console.log(evt)

}

requestAnimationFrame(update)
function update() {
    const gamepads = navigator.getGamepads()
    for (const gp of gamepads) {
        if (!gp) continue
        const x = gp.axes[0]
        const y = gp.axes[1]
        let col = x < -0.4 ? 0 : x > 0.4 ? 2 : 1
        let row = y < -0.4 ? 0 : y > 0.4 ? 2 : 1
        const buttons = gp.buttons.map(b => b.pressed ? '1' : '0').join('')
        if (col === oldCol && row === oldRow && buttons == oldButtons) continue

        const layerIndex = (buttons[4] === "1" ? 1 : 0) + (buttons[5] === '1' ? 2 : 0)
        const layer = layers[layerIndex]
        const cellIndex = row * 3 + col
        const lifted = []
        for (let i = 0; i < 4; i++) {
            if (oldButtons[i] === '1' && buttons[i] === '0') {
                const cell = layer[cellIndex]
                lifted.push(cell[buttonMap[i]])
            }
        }
        if (lifted.length === 1) {
            console.log(lifted)
            let [l] = lifted
            l = specialMap[l] || l
            editor.focus()

            if (typeof l === 'function') {
                l(editor)
            } else {
                insert(editor, l)
            }

        }
        oldCol = col
        oldRow = row
        oldButtons = buttons

        kb.textContent = ""
        kb.appendChild(domBuilder(renderGrid(layer, {
            cell: cellIndex,
            buttons: buttons
        })))
    }
    requestAnimationFrame(update)
}

function renderBox([u, l, d, r], current, buttons) {
    return [`.box${current ? ".current" : ""}`,
    [`.up${buttons[3] === '1' ? ".pressed" : ""}.${charClass(u)}`, u],
    [`.left${buttons[2] === '1' ? ".pressed" : ""}.${charClass(l)}`, l],
    [`.right${buttons[1] === '1' ? ".pressed" : ""}.${charClass(r)}`, r],
    [`.down${buttons[0] === '1' ? ".pressed" : ""}.${charClass(d)}`, d],
    ]
}

function charClass(c) {
    if (/^[a-z][a-z]+$/.test(c)) return 'word'
    if (/^\p{L}$/u.test(c)) return "letter"
    if (/^\p{N}$/u.test(c)) return "number"
    if (/^(?:\p{P}|\p{S})$/u.test(c)) return "punctuation"
    return "other"
}

function renderGrid(layer, { cell, buttons }) {
    return [".grid",
        ...layer.map((chars, i) => renderBox(chars, cell === i, buttons))
    ]
}



