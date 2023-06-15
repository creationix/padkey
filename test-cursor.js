import { del, left, right, up, down } from './cursor.js'
import * as assert from 'assert'

const testCases = [
    [del, "abc", 0, 0, "abc", 0, 0],
    [del, "abc", 1, 1, "bc", 0, 0],
    [del, "abc", 2, 2, "ac", 1, 1],
    [del, "abc", 3, 3, "ab", 2, 2],
    [del, "abc", 1, 2, "ac", 1, 1],
    [del, "abc", 0, 2, "c", 0, 0],
    [del, "abc", 0, 3, "", 0, 0],
    [del, "a🦊c", 0, 0, "a🦊c", 0, 0],
    [del, "a🦊c", 1, 1, "🦊c", 0, 0],
    [del, "a🦊c", 2, 2, "ac", 1, 1],
    [del, "a🦊c", 3, 3, "ac", 1, 1],
    [del, "a🦊c", 4, 4, "a🦊", 3, 3],
    [left, "abc", 0, 0, "abc", 0, 0],
    [left, "abc", 1, 1, "abc", 0, 0],
    [left, "abc", 2, 2, "abc", 1, 1],
    [left, "abc", 3, 3, "abc", 2, 2],
    [left, "a🦊c", 0, 0, "a🦊c", 0, 0],
    [left, "a🦊c", 1, 1, "a🦊c", 0, 0],
    [left, "a🦊c", 3, 3, "a🦊c", 1, 1],
    [left, "a🦊c", 4, 4, "a🦊c", 3, 3],
    [left, "a🦊c", 0, 2, "a🦊c", 0, 0],
    [left, "a🦊c", 2, 3, "a🦊c", 1, 1],
    [right, "abc", 0, 0, "abc", 1, 1],
    [right, "abc", 1, 1, "abc", 2, 2],
    [right, "abc", 2, 2, "abc", 3, 3],
    [right, "abc", 3, 3, "abc", 3, 3],
    [right, "a🦊c", 0, 0, "a🦊c", 1, 1],
    [right, "a🦊c", 1, 1, "a🦊c", 3, 3],
    [right, "a🦊c", 3, 3, "a🦊c", 4, 4],
    [right, "a🦊c", 4, 4, "a🦊c", 4, 4],
    [right, "a🦊c", 0, 1, "a🦊c", 3, 3],
    [right, "a🦊c", 1, 3, "a🦊c", 4, 4],
    [up, "abc\ndef", 0, 0, "abc\ndef", 0, 0],
    [up, "abc\ndef", 1, 1, "abc\ndef", 0, 0],
    [up, "abc\ndef", 2, 2, "abc\ndef", 0, 0],
    [up, "abc\ndef", 3, 3, "abc\ndef", 0, 0],
    [up, "abc\ndef", 4, 4, "abc\ndef", 0, 0],
    [up, "abc\ndef", 5, 5, "abc\ndef", 1, 1],
    [up, "abc\ndef", 6, 6, "abc\ndef", 2, 2],
    [up, "abc\ndef", 7, 7, "abc\ndef", 3, 3],
    [up, "🦊x🦊\ny🦊z", 0, 0, "🦊x🦊\ny🦊z", 0, 0],
    [up, "🦊x🦊\ny🦊z", 2, 2, "🦊x🦊\ny🦊z", 0, 0],
    [up, "🦊x🦊\ny🦊z", 3, 3, "🦊x🦊\ny🦊z", 0, 0],
    [up, "🦊x🦊\ny🦊z", 5, 5, "🦊x🦊\ny🦊z", 0, 0],
    [up, "🦊x🦊\ny🦊z", 6, 6, "🦊x🦊\ny🦊z", 0, 0],
    [up, "🦊x🦊\ny🦊z", 7, 7, "🦊x🦊\ny🦊z", 2, 2],
    [up, "🦊x🦊\ny🦊z", 9, 9, "🦊x🦊\ny🦊z", 3, 3],
    [up, "🦊x🦊\ny🦊z", 10, 10, "🦊x🦊\ny🦊z", 5, 5],
    [up, "🦊x🦊\ny🦊zz", 11, 11, "🦊x🦊\ny🦊zz", 5, 5],
    [up, '1\n23\n4', 0, 0, '1\n23\n4', 0, 0],
    [up, '1\n23\n4', 1, 1, '1\n23\n4', 0, 0],
    [up, '1\n23\n4', 2, 2, '1\n23\n4', 0, 0],
    [up, '1\n23\n4', 3, 3, '1\n23\n4', 1, 1],
    [up, '1\n23\n4', 4, 4, '1\n23\n4', 1, 1],
    [up, '1\n23\n4', 5, 5, '1\n23\n4', 2, 2],
    [up, '1\n23\n4', 6, 6, '1\n23\n4', 3, 3],
    [down, '1\n23\n4', 0, 0, '1\n23\n4', 2, 2],
    [down, '1\n23\n4', 1, 1, '1\n23\n4', 3, 3],
    [down, '1\n23\n4', 2, 2, '1\n23\n4', 5, 5],
    [down, '1\n23\n4', 3, 3, '1\n23\n4', 6, 6],
    [down, '1\n23\n4', 4, 4, '1\n23\n4', 6, 6],
    [down, '1\n23\n4', 5, 5, '1\n23\n4', 6, 6],
    [down, '1\n23\n4', 6, 6, '1\n23\n4', 6, 6],
    [down, "abc\ndef", 0, 0, "abc\ndef", 4, 4],
    [down, "abc\ndef", 1, 1, "abc\ndef", 5, 5],
    [down, "abc\ndef", 2, 2, "abc\ndef", 6, 6],
    [down, "abc\ndef", 3, 3, "abc\ndef", 7, 7],
    [down, "abc\ndef", 4, 4, "abc\ndef", 7, 7],
    [down, "abc\ndef", 5, 5, "abc\ndef", 7, 7],
    [down, "abc\ndef", 6, 6, "abc\ndef", 7, 7],
    [down, "abc\ndef", 7, 7, "abc\ndef", 7, 7],
    [down, "🦊x🦊\ny🦊z", 0, 0, "🦊x🦊\ny🦊z", 6, 6],
    [down, "🦊x🦊\ny🦊z", 2, 2, "🦊x🦊\ny🦊z", 7, 7],
    [down, "🦊x🦊\ny🦊z", 3, 3, "🦊x🦊\ny🦊z", 9, 9],
    [down, "🦊x🦊\ny🦊z", 5, 5, "🦊x🦊\ny🦊z", 10, 10],
    [down, "🦊x🦊\ny🦊z", 6, 6, "🦊x🦊\ny🦊z", 10, 10],
    [down, "🦊x🦊\ny🦊z", 7, 7, "🦊x🦊\ny🦊z", 10, 10],
    [down, "🦊x🦊\ny🦊z", 9, 9, "🦊x🦊\ny🦊z", 10, 10],
    [down, "🦊x🦊\ny🦊z", 10, 10, "🦊x🦊\ny🦊z", 10, 10],
    [down, "🦊x🦊z\ny🦊z", 6, 6, "🦊x🦊z\ny🦊z", 11, 11],
    [down, "ab\ncd\n", 0, 0, "ab\ncd\n", 3, 3],
    [down, "ab\ncd\n", 1, 1, "ab\ncd\n", 4, 4],
    [down, "ab\ncd\n", 2, 2, "ab\ncd\n", 5, 5],
    [down, "ab\ncd\n", 3, 3, "ab\ncd\n", 6, 6],
    [down, "ab\ncd\n", 4, 4, "ab\ncd\n", 6, 6],
]


for (const [fn,iv,is,ie,ov,os,oe] of testCases) {
    const el = {value:iv, selectionStart:is, selectionEnd:ie}
    fn(el)
    console.log({fn,iv,is,ie,ov,os,oe})
    assert.equal(el.value, ov)
    assert.equal(el.selectionStart, os)
    assert.equal(el.selectionEnd, oe)
}
console.log("all tests passed")