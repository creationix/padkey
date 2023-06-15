
/** @param {HTMLInputElement} el */
export function del(el) {
    let start = [...el.value.slice(0, el.selectionStart)].length
    const end = [...el.value.slice(0, el.selectionEnd)].length
    if (start === end) {
        if (!start) return
        start--
    }
    const letters = [...el.value]
    const prefix = letters.slice(0, start).join('')
    const postfix = letters.slice(end).join('')
    el.value = prefix + postfix
    el.selectionStart = el.selectionEnd = prefix.length
}

/** @param {HTMLInputElement} el */
export function left(el) {
    let start = [...el.value.slice(0, el.selectionStart)].length
    if (start <= 0) {
        el.selectionStart = el.selectionEnd = 0
        return
    }
    start--
    const letters = [...el.value]
    const prefix = letters.slice(0, start).join('')
    el.selectionStart = el.selectionEnd = prefix.length
}

/** @param {HTMLInputElement} el */
export function right(el) {
    let end = [...el.value.slice(0, el.selectionEnd)].length
    const letters = [...el.value]
    if (end >= letters.length - 1) {
        el.selectionStart = el.selectionEnd = el.value.length
        return
    }
    end++
    const prefix = letters.slice(0, end).join('')
    el.selectionStart = el.selectionEnd = prefix.length
}

/** @param {HTMLInputElement} el */
export function up(el) {
    const before = [...el.value.slice(0, el.selectionStart)]
    const curStart = before.lastIndexOf('\n', before.length - 1) + 1
    const offset = before.length - curStart
    if (curStart <= 0) {
        el.selectionStart = el.selectionEnd = 0
        return
    }
    const prevStart = before.lastIndexOf('\n', curStart - 2) + 1
    const pos = Math.min(curStart - 1, prevStart + offset)
    const letters = [...el.value]
    const prefix = letters.slice(0, pos).join('').length
    el.selectionStart = el.selectionEnd = prefix
}

/** @param {HTMLInputElement} el */
export function down(el) {
    const before = [...el.value.slice(0, el.selectionEnd)]
    const curStart = before.lastIndexOf('\n', before.length - 1) + 1
    const offset = before.length - curStart
    const letters = [...el.value]
    const nextStart = letters.indexOf('\n', curStart) + 1
    if (nextStart <= 0 || nextStart >= letters.length) {
        el.selectionStart = el.selectionEnd = el.value.length
        return
    }
    let nextEnd = letters.indexOf('\n', nextStart)
    if (nextEnd < 0) nextEnd = letters.length
    const pos = Math.min(nextStart + offset, nextEnd)
    const prefix = letters.slice(0, pos).join('')
    el.selectionStart = el.selectionEnd = prefix.length
}

/**
 * @param {HTMLInputElement} el
 * @param {string} txt
 */
export function insert(el, txt) {
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    el.value = value.slice(0, start) + txt + value.slice(end)
    el.selectionStart = el.selectionEnd = start + txt.length
}

